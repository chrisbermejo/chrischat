import React from 'react';
import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from '../hooks/useAuth';

const RequireAuth = () => {
    const location = useLocation();

    const { isAuthenticated } = useAuth();

    return isAuthenticated ? (<Outlet />) : (<Navigate to="/login" state={{ from: location }} replace />);
}

export default RequireAuth;