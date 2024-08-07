// component
import SvgColor from '../../../components/svg-color';
import { TruckIcon } from '@heroicons/react/24/outline';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard',
    icon: icon('ic_analytics'),
  },
  {
    title: 'usuarios',
    path: '/usuarios',
    icon: icon('ic_user'),
  },
  {
    title: 'productos',
    path: '/Productos',
    icon: <TruckIcon class="h-6 w-6 text-gray-500" />,
  },
  /*  

  {
    title: 'blog',
    path: '/dashboard/blog',
    icon: icon('ic_blog'),
  },
  {
    title: 'login',
    path: '/login',
    icon: icon('ic_lock'),
  },
  {
    title: 'Not found',
    path: '/404',
    icon: icon('ic_disabled'),
  }, */
];

export default navConfig;
