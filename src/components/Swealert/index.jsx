import Swal from 'sweetalert2';

export default function Swealert({ ico, message }) {
  const Show = () => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: ico || 'info',
      title: message || 'error inesperado',
    });
    return Toast;
  };
  return Show();
}
