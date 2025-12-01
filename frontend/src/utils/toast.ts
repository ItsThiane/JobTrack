import { toast } from 'react-toastify';

export const showToast = {
  success: (message: string) => toast.success(message, { position: 'bottom-right', autoClose: 3000 }),
  error: (message: string) => toast.error(message, { position: 'bottom-right', autoClose: 3000 }),
  info: (message: string) => toast.info(message, { position: 'bottom-right', autoClose: 3000 }),
  warning: (message: string) => toast.warning(message, { position: 'bottom-right', autoClose: 3000 }),
};
