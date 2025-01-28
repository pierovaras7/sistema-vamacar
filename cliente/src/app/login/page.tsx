"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importamos useRouter de Next.js
import { toast, Toaster } from 'sonner';
import useAuthStore from '@/stores/AuthStore';
import { showErrorsToast } from '@/lib/functions';

const LoginPage = () => {
  const { login } = useAuthStore();
  const router  = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  
    try {
      await login(username, password); // Llamamos al método login del store
      toast.success("Inicio de sesión exitoso");
        setTimeout(() => {
        router.push("/home");
      }, 500); 
    } catch (error: any) {
      showErrorsToast(error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg flex flex-col md:flex-row w-full max-w-4xl animate-fade-in">
        {/* Sección de la imagen */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="https://lubritodo.com/wp-content/uploads/2018/11/bienvenido-a-lubricentro-lubritodo-zona-norte-florida-equipamiento-3.jpg"
            alt="Imagen de bienvenida"
            className="object-cover w-full h-full rounded-l-lg"
          />
        </div>
        {/* Sección del formulario */}
        <div className="w-full md:w-1/2 px-8 py-24 text-sm">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Bienvenido a Sistema Vamacar 👋
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Campo de usuario */}
            <div>
              <label htmlFor="email" className="block text-gray-600">
                Usuario
              </label>
              <input
                id="username"
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-800 focus:outline-none"
                placeholder="Ingresa tu usuario"
              />
            </div>
            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-gray-600">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-800 focus:outline-none"
                placeholder="Ingresa tu contraseña"
              />
            </div>
            {/* Mostrar error si hay */}
            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}
            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              className="w-full py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-md transition-transform transform hover:scale-105"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
      {/* Contenedor de toasts */}
      <Toaster position="top-right" richColors />

    </div>
  );
};

export default LoginPage;

