import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from '@/components/theme-provider';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFoundModule from './components/modules/NotFoundModule/index.tsx';
import CreateFormModule from './components/modules/CreateFormModule/index.tsx';
import HomepageModule from './components/modules/HomepageModule/index.tsx';
import AboutModule from './components/modules/AboutModule/index.tsx';

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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
