// Path: /src/pages/AdminOrdersPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeobackend.netlify.app'; // ✅ Your deployed backend

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/orders`);
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <div className="text-white p-6">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* ✅ Back Button only (Header removed) */}
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="flex items-center gap-2 mb-6 text-gray-300 hover:text-white"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1 className="text-2xl font-semibold mb-6 text-center">
        Order Management
      </h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-400">No orders found yet 😴</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order._id}</h2>
                  <p className="text-sm text-gray-400">
                    {order.name} — {order.phone}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status:{" "}
                    <span className="font-medium text-yellow-400">
                      {order.status || "Pending"}
                    </span>
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
                    onChange={(e) =>
                      updateStatus(order._id, e.target.value)
                    }
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

      {/* ✅ Order Details Modal */}
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
