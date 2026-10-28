import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { ActivatePage } from './pages/auth/ActivatePage';
import { AppLayout } from './layouts/AppLayout';
import { DashboardShellPage } from './pages/dashboard/DashboardShellPage';
import { UsersPage } from './pages/users/UsersPage';
import { CreateUserPage } from './pages/users/CreateUserPage';
import { EditUserPage } from './pages/users/EditUserPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { RolesPage } from './pages/roles/RolesPage';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';

export const router = createBrowserRouter([
  // Public login & activation routes
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/activate/:token',
    element: <ActivatePage />,
  },

  // Authenticated workspace app
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardShellPage />,
          },
          {
            path: 'admin/users',
            element: <ProtectedRoute requiredPermission="users.read" />,
            children: [
              { index: true, element: <UsersPage /> },
            ],
          },
          {
            path: 'admin/users/new',
            element: <ProtectedRoute requiredPermission="users.create" />,
            children: [
              { index: true, element: <CreateUserPage /> },
            ],
          },
          {
            path: 'admin/users/:id',
            element: <ProtectedRoute requiredPermission="users.read" />,
            children: [
              { index: true, element: <EditUserPage /> },
            ],
          },
          {
            path: 'admin/roles',
            element: <ProtectedRoute requiredPermission="roles.read" />,
            children: [
              { index: true, element: <RolesPage /> },
            ],
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
