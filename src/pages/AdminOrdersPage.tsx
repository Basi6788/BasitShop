// Path: /src/pages/AdminOrdersPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { useAuth } from "../context/AuthProvider"; // adjust path if different

type Order = {
  _id: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  note?: string;
  email?: string;
  password?: string;
  paymentMethod?: string;
  trxId?: string;
  status?: string;
  [key: string]: any;
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { authToken, userRole } = useAuth();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeo-backend.vercel.app';

  useEffect(() => {
    // security: if userRole is not admin, redirect away
    if (userRole && userRole !== 'admin') {
      console.warn('[AdminOrders] non-admin tried to access admin page, redirecting.');
      navigate('/'); // or navigate('/login') depending on your flow
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${BACKEND_URL}/api/admin/orders`;
        // Prefer internal helper if available (dev). Otherwise normal fetch with Authorization header.
        let response: Response;
        if (typeof (window as any).__fetchWithToken === 'function') {
          response = await (window as any).__fetchWithToken(url, { method: 'GET' });
        } else {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          response = await fetch(url, { method: 'GET', headers, credentials: 'include' });
        }

        if (response.status === 401 || response.status === 403) {
          // Authorized issue — force logout/redirect to login
          console.warn('[AdminOrders] unauthorized. Redirecting to login.');
          // clear local auth if you want (optional)
          // navigate to login and show message
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Server error ${response.status}`);
        }

        const data = await response.json();
        // Expecting an array
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          // sometimes backend wraps object; try to be tolerant
          setOrders(data || []);
        }
      } catch (err: any) {
        console.error('[AdminOrders] fetch error:', err);
        setError(err?.message || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // we want to refetch when authToken changes (login/logout)
  }, [BACKEND_URL, authToken, navigate, userRole]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const url = `${BACKEND_URL}/api/admin/orders/${orderId}/status`;
      let response: Response;
      if (typeof (window as any).__fetchWithToken === 'function') {
        response = await (window as any).__fetchWithToken(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } else {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: newStatus }),
          credentials: 'include'
        });
      }

      if (response.status === 401 || response.status === 403) {
        console.warn('[AdminOrders] unauthorized when updating status.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Status update failed (${response.status})`);
      }

      // optimistic update
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('[AdminOrders] updateStatus error:', err);
      setError('Unable to update status. Try again.');
    }
  };

  if (loading) return <div className="text-white p-6">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="flex items-center gap-2 mb-6 text-gray-300 hover:text-white"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1 className="text-2xl font-semibold mb-6 text-center">Order Management</h1>

      {error && (
        <div className="mb-4 text-red-300 bg-red-900/20 p-3 rounded">
          <strong>Error: </strong>{error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center text-gray-400">No orders found yet 😴</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order._id}</h2>
                  <p className="text-sm text-gray-400">{order.name} — {order.phone}</p>
                  <p className="text-sm text-gray-500">
                    Status: <span className="font-medium text-yellow-400">{order.status || "Pending"}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Eye size={16} /> View
                  </button>

                  <select
                    value={order.status || "Pending"}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-11/12 md:w-2/3 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-300">
              <p><b>Name:</b> {selectedOrder.name}</p>
              <p><b>Phone:</b> {selectedOrder.phone}</p>
              <p><b>WhatsApp:</b> {selectedOrder.whatsapp}</p>
              <p><b>Address:</b> {selectedOrder.address}</p>
              <p><b>Note:</b> {selectedOrder.note}</p>
              <p><b>Email:</b> {selectedOrder.email}</p>
              {/* Password shown is probably sensitive — keep for debugging only */}
              <p><b>Password:</b> {selectedOrder.password}</p>
              <p><b>Payment Method:</b> {selectedOrder.paymentMethod}</p>
              <p><b>Transaction ID:</b> {selectedOrder.trxId}</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}