import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { encrypt } from '../../utils/crypto';
import Swealert from '../../components/Swealert';

/* const logo = 'https://readymadeui.com/signin-image.webp'; */
const logo = 'https://equiposdimei.com/wp-content/uploads/2014/12/logo-header.png';

export default function Login() {
  const [Token, SetToken] = useState(null);
  const [rol, setRol] = useState(null);
  const [company, setCompany] = useState(null);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    user: '',
    password: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleClick = async (e) => {
    e.preventDefault();

    try {
      const respon = await axios.post('/login', formData);
      setRol(respon.data.rolId);
      setCompany(respon.data.company);
      setUser(respon.data.user);
      await SetToken(respon.data.token);
      return await (window.location.href = '/dashboard');
    } catch (e) {
      if (e.message == 'Network Error') {
        const Alert = Swealert({ ico: 'error', message: e.message });
        return Alert;
      } else {
        const Alert = Swealert({ ico: 'error', message: e.response.data.message });
        return Alert;
      }
    }
  };

  useEffect(() => {
    sessionStorage.setItem('Token', Token);
    sessionStorage.setItem('rol', encrypt(rol));
    sessionStorage.setItem('company', encrypt(company));
    sessionStorage.setItem('user', encrypt(user));
  }, [Token]);

  return (
    <div class="font-[sans-serif]">
      <div class="grid lg:grid-cols-3 md:grid-cols-2 items-center gap-4 h-full">
        <div class="max-md:order-1 lg:col-span-2 md:h-screen w-full bg-[#000842] md:rounded-tr-xl md:rounded-br-xl lg:p-12 p-8">
          <img src={logo} class="lg:w-[50%] w-full h-full object-contain block mx-auto" alt="login-image" />
        </div>

        <div class="w-full p-6">
          <form onSubmit={handleClick}>
            <div class="mb-8">
              {' '}
              <h3 class="text-gray-800 text-3xl font-extrabold">DIMEI</h3>
            </div>

            <div>
              <label class="text-gray-800 text-[15px] mb-2 block">Usuario</label>
              <div class="relative flex items-center">
                <input
                  name="user"
                  type="text"
                  required
                  class="w-full text-sm text-gray-800 bg-gray-100 focus:bg-transparent px-4 py-3.5 rounded-md outline-blue-600"
                  placeholder="Usuario"
                  value={formData.user.toUpperCase()}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div class="mt-4">
              <label class="text-gray-800 text-[15px] mb-2 block">Contraseña</label>
              <div class="relative flex items-center">
                <input
                  name="password"
                  type="password"
                  required
                  class="w-full text-sm text-gray-800 bg-gray-100 focus:bg-transparent px-4 py-3.5 rounded-md outline-blue-600"
                  placeholder="***********"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-4 mt-4">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  class="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md"
                  defaultChecked
                />
                <label for="remember-me" class="ml-3 block text-sm">
                  Acuérdate de mí
                </label>
              </div>
              <div>
                <a href="jajvascript:void(0);" class="text-blue-600 font-semibold text-sm hover:underline">
                  ¿Has olvidado tu contraseña?
                </a>
              </div>
            </div>
            <div class="mt-8">
              <button
                type="submit"
                class="w-full py-3 px-6 text-sm tracking-wide rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Iniciar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
