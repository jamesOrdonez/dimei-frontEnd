// component
import { TagIcon, WrenchScrewdriverIcon, UserGroupIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import SvgColor from '../../../components/svg-color';
import { TruckIcon } from '@heroicons/react/24/outline';
import { PERMISOS } from '../../../context/PermissionsContext';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

/**
 * navConfig — cada ítem puede tener:
 *  - adminOnly: true → solo visible para el Administrador
 *  - requiredPermissions: [array] → visible si tiene AL MENOS UNO de esos permisos
 *  - (ninguno) → visible para todos los usuarios autenticados
 */
const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard',
    icon: icon('ic_analytics'),
    // dashboard es accesible para todos
  },
  {
    title: 'Usuarios',
    path: '/usuarios',
    icon: icon('ic_user'),
    adminOnly: true, // Solo el Administrador
  },
  {
    title: 'Items',
    path: '/items',
    icon: <TruckIcon className="h-6 w-6 text-gray-500" />,
    requiredPermissions: [
      PERMISOS.INGRESAR_MATERIAL,
      PERMISOS.HACER_REMISIONES,
      PERMISOS.CREAR_ITEMS,
    ],
  },
  {
    title: 'Productos',
    path: '/itemProductos',
    icon: <TagIcon className="h-6 w-6 text-gray-500" />,
    requiredPermissions: [
      PERMISOS.CREAR_PRODUCTOS,
    ],
  },
  {
    title: 'Clientes',
    path: '/clientes',
    icon: <UserGroupIcon className="h-6 w-6 text-gray-500" />,
    adminOnly: true, // Solo Administrador gestiona clientes
  },
  {
    title: 'Proyectos',
    path: '/proyectos',
    icon: <ArchiveBoxIcon className="h-6 w-6 text-gray-500" />,
    requiredPermissions: [
      PERMISOS.CREAR_PROYECTOS,
      PERMISOS.CONSULTAR_LISTAS,
      PERMISOS.ANEXAR_ACTAS,
      PERMISOS.PEDIR_MATERIAL,
      PERMISOS.HACER_REMISIONES,
    ],
  },
  {
    title: 'Configuraciones',
    path: '/configuraciones',
    icon: <WrenchScrewdriverIcon className="h-6 w-6 text-gray-500" />,
    adminOnly: true, // Solo el Administrador
  },
];

export default navConfig;
