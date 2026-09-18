// component
import {
  TagIcon, WrenchScrewdriverIcon, WrenchIcon, UserGroupIcon, ArchiveBoxIcon,
  ChartBarIcon, DocumentTextIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon,
  CubeIcon, Cog6ToothIcon, ClockIcon, MapPinIcon,
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
    adminOnly: true,
  },
  {
    title: 'Inicio',
    path: '/bienvenida',
    icon: icon('ic_analytics'),
    hideForAdmin: true,       // visible para todos EXCEPTO el Administrador
    hideForRoles: ['Técnicos'], // tampoco para Técnicos (ellos tienen su propio flujo)
  },
  {
    title: 'Mantenimientos',
    path: '/mantenimiento/clientes',
    icon: <WrenchScrewdriverIcon className="h-6 w-6" />,
    showForRoles: ['Técnicos']
  },
  {
    title: 'Proyectos Cerrados',
    path: '/mantenimiento/proyectos-cerrados',
    icon: <ArchiveBoxIcon className="h-6 w-6" />,
    showForRoles: ['Técnicos']
  },
  {
    title: 'Historial Mantenimientos',
    path: '/mantenimiento/historial',
    icon: <ClipboardDocumentListIcon className="h-6 w-6" />,
    showForRoles: ['Administrador']
  },
  // ── Marcación de tiempos ─────────────────────────────────────────────────────
  {
    title: 'Marcación',
    path: '/marcacion',
    icon: <ClockIcon className="h-6 w-6" />,
    hideForAdmin: true,       // Visible para todos EXCEPTO el Administrador
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
        title: 'Herramientas',
        path: '/herramientas',
        icon: <WrenchIcon className="h-5 w-5" />,
        requiredPermissions: [
          PERMISOS.VER_HERRAMIENTAS,
          PERMISOS.CREAR_HERRAMIENTAS,
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

  // ── Proyectos ─────────────────────────────────────────────────────────────
  {
    title: 'Proyectos',
    path: '/proyectos',
    icon: <ArchiveBoxIcon className="h-6 w-6" />,
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
    title: 'Equipos',
    path: '/equipos',
    icon: <WrenchScrewdriverIcon className="h-6 w-6" />,
    requiredPermissions: [
      PERMISOS.CREAR_PROYECTOS,
      PERMISOS.CONSULTAR_LISTAS,
      PERMISOS.ANEXAR_ACTAS,
      PERMISOS.PEDIR_MATERIAL,
      PERMISOS.HACER_REMISIONES,
      PERMISOS.VER_PROYECTOS,
    ],
  },

  // ── Administración ────────────────────────────────────────────────────────
  // El grupo no lleva adminOnly para que usuarios con permisos de remisiones/préstamos
  // también puedan ver sus children correspondientes.
  {
    title: 'Administración',
    icon: <Cog6ToothIcon className="h-6 w-6" />,
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
        title: 'Remisiones',
        path: '/remisiones',
        icon: <DocumentTextIcon className="h-5 w-5" />,
        requiredPermissions: [
          PERMISOS.HACER_REMISIONES,
          PERMISOS.VER_PROYECTOS,
        ],
      },
      {
        title: 'Préstamos Herramientas',
        path: '/prestamos-herramientas',
        icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
        requiredPermissions: [
          PERMISOS.VER_HERRAMIENTAS,
          PERMISOS.CREAR_PRESTAMOS,
          PERMISOS.DEVOLVER_HERRAMIENTAS,
        ],
      },
      {
        title: 'Horas Extra y Retardos',
        path: '/horas-extra',
        icon: <ClockIcon className="h-5 w-5" />,
        adminOnly: true,
      },
      {
        title: 'Ubicación y Fotos',
        path: '/reporte-ubicacion',
        icon: <MapPinIcon className="h-5 w-5" />,
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
