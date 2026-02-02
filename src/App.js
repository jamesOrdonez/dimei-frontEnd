import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// routes
import Router from './routes/routes';
// theme
import ThemeProvider from './theme';
import axios from 'axios';

let URL_DEV = 'http://localhost:8080/api/v1/';
let URL_PRO = 'https://vps.equiposdimei.com/api/v1/';

export let BASE_URL = URL_PRO;

const TOKEN = sessionStorage.getItem('Token');
axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common['Authorization'] = TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// ----------------------------------------------------------------------

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <Router />
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
