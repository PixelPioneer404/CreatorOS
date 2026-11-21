import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '../features/auth/Login.jsx';
import { Register } from '../features/auth/Register.jsx';
import { ForgotPassword } from '../features/auth/ForgotPassword.jsx';
import { Onboarding } from '../features/onboarding/Onboarding.jsx';
import { Dashboard } from '../features/dashboard/Dashboard.jsx';
import { ProfileSettings } from '../features/settings/ProfileSettings.jsx';
import { ProtectedRoute } from '../features/auth/ProtectedRoute.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute requireOnboarding={false}>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute requireOnboarding={true}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'settings/profile',
        element: <ProfileSettings />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
