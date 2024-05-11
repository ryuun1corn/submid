import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from '@/components/theme-provider';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFoundModule from './modules/NotFoundModule/index.tsx';
import CreateFormModule from './modules/CreateFormModule/index.tsx';
import HomepageModule from './modules/HomepageModule/index.tsx';
import AboutModule from './modules/AboutModule/index.tsx';
import SeeUserForm from './modules/UserFormsModule/index.tsx';
import SeeFormResponse from './modules/SeeFormResponse/index.tsx';
import FillFormModule from './modules/FillFormModule/index.tsx';
import { AuthContextProvider } from './components/contexts/UseAuthContext/index.tsx';
import { Toaster } from './components/ui/sonner.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundModule />,
    children: [
      {
        path: '/',
        element: <HomepageModule />,
      },
      {
        path: '/create',
        element: <CreateFormModule />,
      },
      {
        path: '/about',
        element: <AboutModule />,
      },
      {
        path: '/fill',
        element: <FillFormModule />,
      },
      {
        path: '/forms',
        element: <SeeUserForm />,
        children: [
          {
            path: 'forms/:id',
            element: <SeeFormResponse />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
);
