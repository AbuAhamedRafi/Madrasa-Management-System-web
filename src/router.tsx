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
import { AcademicOverviewPage } from './pages/academics/overview/AcademicOverviewPage';
import { EducationHierarchyPage } from './pages/academics/structure/EducationHierarchyPage';
import { DepartmentsPage } from './pages/academics/departments/DepartmentsPage';
import { ProgramEditorPage } from './pages/academics/programs/ProgramEditorPage';
import { CohortPeriodsPage } from './pages/academics/periods/CohortPeriodsPage';
import { OfferingsSectionsPage } from './pages/academics/offerings/OfferingsSectionsPage';
import { PeriodClosurePage } from './pages/academics/closure/PeriodClosurePage';
import { InstitutionSettingsPage } from './pages/institution/InstitutionSettingsPage';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';

export const router = createBrowserRouter([
  // Public login & activation routes
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/',
        element: <LoginPage />,
      },
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
          // D02: Academic Structure & Lifecycle Routes
          {
            path: 'academics',
            element: <ProtectedRoute requiredPermission="academics.read" />,
            children: [
              { index: true, element: <AcademicOverviewPage /> },
              { path: 'structure', element: <EducationHierarchyPage /> },
              { path: 'departments', element: <DepartmentsPage /> },
              { path: 'periods', element: <CohortPeriodsPage /> },
              { path: 'periods/:id', element: <PeriodClosurePage /> },
              { path: 'offerings', element: <OfferingsSectionsPage /> },
            ],
          },
          {
            path: 'academics/programs/new',
            element: <ProtectedRoute requiredPermission="academics.manage_structure" />,
            children: [
              { index: true, element: <ProgramEditorPage /> },
            ],
          },
          {
            path: 'academics/programs/:id/edit',
            element: <ProtectedRoute requiredPermission="academics.manage_structure" />,
            children: [
              { index: true, element: <ProgramEditorPage /> },
            ],
          },
          // D02: Institution Settings
          {
            path: 'admin/institution',
            element: <ProtectedRoute requiredPermission="institution.read" />,
            children: [
              { index: true, element: <InstitutionSettingsPage /> },
            ],
          },
          // D01: User & Role Management
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
    element: <Navigate to="/" replace />,
  },
]);
