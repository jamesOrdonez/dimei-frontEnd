import { Routes, Route, Outlet } from 'react-router-dom';
import Layouts from '../layouts/navbar/DashboardLayout';
import Page404 from '../layouts/404/404';
import Dashboard from '../pages/Dashboard';
import { LoginForm } from '../Auth';
import Usuarios from '../pages/Usuarios';
import ProductsPage from '../pages/ProductsPage';
import BlogPage from '../pages/BlogPage';
import ItemProductos from '../pages/productos/index';
import Configuraciones from '../pages/configuraciones';
import Clientes from '../pages/clientes';
import Proveedores from '../pages/proveedores';
import Items from '../pages/items';
import Proyectos from '../pages/proyectos';
import Equipos from '../pages/equipos';
import DetalleProyecto from '../pages/proyectos/detail';
import PublicItemView from '../pages/items/public-view';
import AnalisisInventario from '../pages/analisis-inventario';
import Remisiones from '../pages/remisiones/index';
import Herramientas from '../pages/herramientas';
import PrestamosHerramientas from '../pages/prestamos-herramientas';
import ClientesMantenimiento from '../pages/mantenimiento/ClientesMantenimiento';
import FormularioMantenimiento from '../pages/mantenimiento/FormularioMantenimiento';
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
        <Route path="/herramientas" element={<Herramientas />} />
        <Route path="/prestamos-herramientas" element={<PrestamosHerramientas />} />
        <Route path="/itemProductos" element={<ItemProductos />} />
        <Route path="/configuraciones" element={<Configuraciones />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/proyectos/:id" element={<DetalleProyecto />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/equipos/:id" element={<DetalleProyecto />} />
        <Route path="/analisis-inventario" element={<AnalisisInventario />} />
        <Route path="/remisiones" element={<Remisiones />} />
        <Route path="/mantenimiento/clientes" element={<ClientesMantenimiento />} />
        <Route path="/mantenimiento/formulario/:id" element={<FormularioMantenimiento />} />
        {/*  */}
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/blog" element={<BlogPage />} />
      </Route>
      <Route path="/public/item/:id" element={<PublicItemView />} />
      <Route path="/" element={<LoginForm />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}
