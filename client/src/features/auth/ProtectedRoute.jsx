import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useWorkspaceStore } from '../../store/useWorkspaceStore.js';
import { FullPageLoader } from '../../components/ui/loading-indicator.jsx';

export function ProtectedRoute({ children, requireOnboarding = true }) {
  const location = useLocation();
  const { session, user, isLoading: authLoading } = useAuthStore();
  const { currentWorkspace, creatorProfile, loadWorkspaces, isLoading: workspaceLoading } = useWorkspaceStore();

  useEffect(() => {
    if (session && !currentWorkspace && !workspaceLoading) {
      loadWorkspaces();
    }
  }, [session, currentWorkspace, workspaceLoading, loadWorkspaces]);

  if (authLoading) {
    return <FullPageLoader text="Authenticating session..." />;
  }

  if (!session && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If workspace is still loading
  if (workspaceLoading && !currentWorkspace) {
    return <FullPageLoader text="Loading your creator workspace..." />;
  }

  const isOnboardingRoute = location.pathname === '/onboarding';
  const hasCompletedOnboarding = Boolean(creatorProfile?.onboardingCompleted);

  // If route requires completed onboarding but user hasn't completed it
  if (requireOnboarding && !hasCompletedOnboarding && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user completed onboarding and tries to go to /onboarding
  if (isOnboardingRoute && hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
