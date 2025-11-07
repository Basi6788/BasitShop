// Path: /src/utils/AdminRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute: React.FC = () => {
    // Local Storage se token aur role check karna
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    // Agar token nahi hai ya role admin nahi hai, toh Admin Login page par bhej dein
    if (!token || role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }

    // Agar sab theek hai, toh child route ko render karein
    return <Outlet />;
};

export default AdminRoute;

