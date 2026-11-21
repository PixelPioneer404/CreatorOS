import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import './styles/index.css';

function AppRoot() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
);
