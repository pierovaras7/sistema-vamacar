import { toast } from 'sonner';
export const showErrorsToast = (error: any): void => {
  const errorMessage = error.message ? error.message : 'Error desconocido';
  try {
    const validationErrors = JSON.parse(errorMessage);
    if (validationErrors) {
      Object.keys(validationErrors).forEach((field) => {
        const messages = validationErrors[field];
        messages.forEach((msg: string) => {
          const cleanMessage = msg.replace(/^.*?:\s*/, ''); 
          toast.error(cleanMessage); 
        });          
      });
    }
  } catch (e) {
    toast.error(errorMessage);
  }
}
  