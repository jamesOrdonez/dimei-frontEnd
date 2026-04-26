// component
import {
  TagIcon, WrenchScrewdriverIcon, WrenchIcon, UserGroupIcon, ArchiveBoxIcon,
  ChartBarIcon, DocumentTextIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon,
  Squares2X2Icon, CubeIcon, Cog6ToothIcon, UsersIcon,
} from '@heroicons/react/24/outline';
import SvgColor from '../../../components/svg-color';
import { TruckIcon } from '@heroicons/react/24/outline';
import { PERMISOS } from '../../../context/PermissionsContext';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

/**
 * navConfig — cada ítem puede tener:
 *  - adminOnly: true        → solo visible para el Administrador
 *  - requiredPermissions:[] → visible si tiene AL MENOS UNO de esos permisos
 *  - children: []           → grupo colapsable; la visibilidad la controla cada child
 *  - (ninguno)              → visible para todos los usuarios autenticados
 */
const navConfig = [
  // ── General ──────────────────────────────────────────────────────────────
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic_analytics'),
  },

  // ── Inventario ───────────────────────────────────────────────────────────
  {
    title: 'Inventario',
    icon: <CubeIcon className="h-6 w-6" />,
    children: [
      {
        title: 'Items',
        path: '/items',
        icon: <TruckIcon className="h-5 w-5" />,
        requiredPermissions: [
          PERMISOS.INGRESAR_MATERIAL,
          PERMISOS.HACER_REMISIONES,
          PERMISOS.CREAR_ITEMS,
        ],
      },
      {
        title: 'Productos',
        path: '/itemProductos',
        icon: <TagIcon className="h-5 w-5" />,
        requiredPermissions: [PERMISOS.CREAR_PRODUCTOS],
      },
      {
        title: 'Análisis de inventario',
        path: '/analisis-inventario',
        icon: <ChartBarIcon className="h-5 w-5" />,
        requiredPermissions: [PERMISOS.CONSULTAR_LISTAS],
      },
    ],
  },

  // ── Herramientas ─────────────────────────────────────────────────────────
  {
    title: 'Herramientas',
    icon: <WrenchIcon className="h-6 w-6" />,
    children: [
      {
        title: 'Catálogo',
        path: '/herramientas',
        icon: <WrenchIcon className="h-5 w-5" />,
        requiredPermissions: [
          PERMISOS.INGRESAR_MATERIAL,
          PERMISOS.HACER_REMISIONES,
          PERMISOS.CREAR_ITEMS,
        ],
      },
      {
        title: 'Préstamos',
        path: '/prestamos-herramientas',
        icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
        requiredPermissions: [
          PERMISOS.INGRESAR_MATERIAL,
          PERMISOS.HACER_REMISIONES,
          PERMISOS.CREAR_ITEMS,
        ],
      },
    ],
  },

  // ── Proyectos ─────────────────────────────────────────────────────────────
  {
    title: 'Proyectos',
    icon: <ArchiveBoxIcon className="h-6 w-6" />,
    children: [
      {
        title: 'Proyectos',
        path: '/proyectos',
        icon: <ArchiveBoxIcon className="h-5 w-5" />,
        requiredPermissions: [
          PERMISOS.CREAR_PROYECTOS,
          PERMISOS.CONSULTAR_LISTAS,
          PERMISOS.ANEXAR_ACTAS,
          PERMISOS.PEDIR_MATERIAL,
          PERMISOS.HACER_REMISIONES,
          PERMISOS.VER_PROYECTOS,
        ],
      },
      {
        title: 'Remisiones',
        path: '/remisiones',
        icon: <DocumentTextIcon className="h-5 w-5" />,
        requiredPermissions: [
          PERMISOS.HACER_REMISIONES,
          PERMISOS.VER_PROYECTOS,
        ],
      },
    ],
  },

  // ── Administración ────────────────────────────────────────────────────────
  {
    title: 'Administración',
    icon: <Cog6ToothIcon className="h-6 w-6" />,
    adminOnly: true,
    children: [
      {
        title: 'Usuarios',
        path: '/usuarios',
        icon: icon('ic_user'),
        adminOnly: true,
      },
      {
        title: 'Clientes',
        path: '/clientes',
        icon: <UserGroupIcon className="h-5 w-5" />,
        adminOnly: true,
      },
      {
        title: 'Proveedores',
        path: '/proveedores',
        icon: <BuildingStorefrontIcon className="h-5 w-5" />,
        adminOnly: true,
      },
      {
        title: 'Configuraciones',
        path: '/configuraciones',
        icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
        adminOnly: true,
      },
    ],
  },
];

export default navConfig;
