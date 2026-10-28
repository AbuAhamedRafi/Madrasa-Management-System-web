import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ requiredPermission?: string }> = ({ requiredPermission }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB]">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">Loading application...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
    return (
      <div className="p-8 text-center text-rose-600 font-semibold text-sm">
        403 - এই কার্যক্রমে আপনার অনুমতি নেই।
      </div>
    );
  }

  return <Outlet />;
};

export const PublicRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};

