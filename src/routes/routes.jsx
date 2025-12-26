import { Routes, Route, Outlet } from 'react-router-dom';
import Layouts from '../layouts/navbar/DashboardLayout';
import Page404 from '../layouts/404/404';
import Dashboard from '../pages/Dashboard';
import { LoginForm } from '../Auth';
import Usuarios from '../pages/Usuarios';
import ProductsPage from '../pages/ProductsPage';
import BlogPage from '../pages/BlogPage';
import Items from '../pages/productos/index';
// layouts

/* import SimpleLayout from '../layouts/simple'; */
//
/* import BlogPage from '../pages/BlogPage'; */
/* import UserPage from '../pages/UserPage';

import Page404 from '../pages/Page404'; */
/* import ProductsPage from '../pages/ProductsPage'; */

// ----------------------------------------------------------------------

export default function Router() {
  /*  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
      ],
    },

    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '/',
      element: <LoginPage />,
    },
    {
      path: '/dashboard',
      element: <DashboardLayout />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
 */
  return (
    <Routes>
      <Route
        element={
          <Layouts>
            <Outlet />
          </Layouts>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/items" element={<Items />} />
        {/*  */}
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/blog" element={<BlogPage />} />
      </Route>
      <Route path="/" element={<LoginForm />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}
