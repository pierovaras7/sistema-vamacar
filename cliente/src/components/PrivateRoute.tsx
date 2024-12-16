import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const PrivateRoute = ({ children, requiredSlug }: any) => {
  const { user } = useAuth(); // Obtener datos del usuario
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // Estado de permisos
  
  useEffect(() => {
    // Asegurarse de que estamos en un entorno de cliente
    if (typeof window !== "undefined") {
      // Si no hay usuario autenticado, redirigir a login
      if (!user) {
        window.location.href = "/login"; // Redirigir a login si no está autenticado
        return;
      }

      // Llamada a la API para obtener permisos del usuario
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/${user.idUser}`)
        .then((response) => response.json())
        .then((data) => {
          const allowedModules = data.modules?.map((module: any) => module.slug);
          // Verifica si el usuario tiene acceso al módulo requerido
          const hasPermission = allowedModules?.includes(requiredSlug);
          setHasPermission(hasPermission);
        })
        .catch((error) => {
          console.error("Error al obtener los permisos:", error);
          setHasPermission(false); // Si ocurre un error, no tiene permisos
        });
    }
  }, [user, requiredSlug]);

  // Mientras no sepamos si tiene permisos, mostramos un loading
  if (hasPermission === null) {
    return <div>Loading...</div>; // Puedes mostrar un spinner o algo mientras se carga
  }

  // Si no tiene permisos, redirigimos o mostramos un mensaje
  if (!hasPermission) {
    window.location.href = "/unauthorized"; // Redirigir a una página de no autorizado
    return null; // Retornar null para que no renderice el contenido
  }

  // Si tiene permisos, renderizamos el contenido
  return <>{children}</>;
};

export default PrivateRoute;
