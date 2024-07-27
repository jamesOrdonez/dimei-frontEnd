import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// routes
import Router from './routes/routes';
// theme
import ThemeProvider from './theme';
import axios from 'axios';
// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: 'http://localhost:8080/api/v1/',
});

// Alter defaults after instance has been created
instance.defaults.headers.common['Authorization'] = 'AUTH_TOKEN';
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
