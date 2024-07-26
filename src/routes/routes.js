import { Routes, Route, Outlet } from 'react-router-dom';
import Layouts from '../layouts/navbar/DashboardLayout';
import Page404 from '../layouts/404/404';
import Dashboard from '../pages/Dashboard';
import UserPage from '../pages/UserPage';
// layouts

/* import SimpleLayout from '../layouts/simple'; */
//
/* import BlogPage from '../pages/BlogPage'; */
/* import UserPage from '../pages/UserPage';
import LoginPage from '../pages/LoginPage';
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
        <Route path="/usuarios" element={<UserPage />} />
      </Route>
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}
