import { toast } from 'sonner';

export const notify = {
  // 1. Notifikasi Sukses
  success: (title: string, description?: string) => {
    return toast.success(title, { description });
  },

  // 2. Notifikasi Error
  error: (title: string, description?: string) => {
    return toast.error(title, { description });
  },

  // 3. Notifikasi Peringatan
  warning: (title: string, description?: string) => {
    return toast.warning(title, { description });
  },

  // 4. Notifikasi Info (Biasa)
  info: (title: string, description?: string) => {
    return toast.info(title, { description });
  },

  // 5. Notifikasi Loading (Mengembalikan ID agar bisa di-update/dihapus nanti)
  loading: (title: string, description?: string) => {
    return toast.loading(title, { description });
  },

  // 6. Mengubah Loading menjadi Sukses/Error berdasarkan ID
  update: (id: string | number, type: 'success' | 'error', title: string, description?: string) => {
    return toast[type](title, { id, description });
  },

  // 7. Menghapus notifikasi berdasarkan ID
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },
};