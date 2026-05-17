import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// routes
import Router from './routes/routes';
// theme
import ThemeProvider from './theme';
import axios from 'axios';
import { PermissionsProvider } from './context/PermissionsContext';

const URL_DEV = 'http://localhost:8080/api/v1/';
const URL_PRO = 'https://vps.equiposdimei.com/api/v1/';

export let BASE_URL = process.env.NODE_ENV === 'production' ? URL_PRO : URL_DEV;

const TOKEN = sessionStorage.getItem('Token');
axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common['Authorization'] = TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// Ensure SweetAlert2 always appears above MUI Dialogs (z-index 1300)
const swalStyle = document.createElement('style');
swalStyle.textContent = '.swal2-container { z-index: 9999 !important; }';
document.head.appendChild(swalStyle);
// ----------------------------------------------------------------------

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <PermissionsProvider>
            <Router />
          </PermissionsProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

