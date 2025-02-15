import Swal from "sweetalert2";

export const showToast = (message, icon = "success") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: icon,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };