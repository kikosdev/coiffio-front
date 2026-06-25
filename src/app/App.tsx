import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from '@/shared/store/authStore';

export default function App() {
  const loadMe = useAuthStore((s) => s.loadMe);

  // Hydrate la session au boot : si un token persiste, on récupère le profil.
  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  return <RouterProvider router={router} />;
}
