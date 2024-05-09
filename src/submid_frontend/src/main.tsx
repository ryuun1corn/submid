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
import SeeUserForm from './modules/SeeUserForm/index.tsx';
import SeeFormResponse from './modules/SeeFormResponse/index.tsx';
import FillForm from './modules/FillForm/index.tsx';

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
        element: <FillForm />
      },
      {
        path: '/seeForm',
        element: <SeeUserForm />,
      },
      {
        path: '/seeForm/:id',
        element: <SeeFormResponse />
      },
      {
        path: '/notFound',
        element: <NotFoundModule />
      }

    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
