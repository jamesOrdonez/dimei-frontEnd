import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// routes
import Router from './routes/routes';
// theme
import ThemeProvider from './theme';
import axios from 'axios';

const TOKEN = sessionStorage.getItem('Token');
axios.defaults.baseURL = 'http://localhost:8080/api/v1/';
/* axios.defaults.baseURL = 'https://vps.equiposdimei.com/api/v1/'; */
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
