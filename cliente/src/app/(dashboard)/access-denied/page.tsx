"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const AccessDeniedPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Puedes redirigir después de unos segundos si lo deseas, por ejemplo a la página de inicio
    const timer = setTimeout(() => {
      router.push("/"); // Redirige a la página principal
    }, 8000); // Redirige después de 5 segundos

    return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta antes
  }, [router]);

  return (
    <div className="flex justify-center items-center pt-20 bg-gray-50">
      <div className="text-center p-8 rounded-xl w-full sm:w-1/2 bg-white shadow-lg">
        <h1 className="text-xl font-semibold text-gray-900">Acceso Denegado</h1>
        <p className="text-sm mt-4 text-gray-600">
          No tienes permisos para acceder a esta página. Si crees que esto es un error, por favor contacta con el administrador.
        </p>
        <p className="text-sm mt-4 text-gray-600">
          Serás redirigido a la página principal en unos segundos.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>

  );
};

export default AccessDeniedPage;
