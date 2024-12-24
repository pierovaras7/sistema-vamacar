"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuthStore from "@/stores/AuthStore"; // Ajusta la ruta según corresponda

const PrivateRoute: React.FC<{ children: React.ReactNode; slug: string }> = ({
  children,
  slug,
}) => {
  const { isAuthenticated, isAdmin, modules } = useAuthStore((state) => state);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // Si no está autenticado, redirigir a login
      router.push("/login");
    } else if (!isAdmin) {
      // Si no es admin y no tiene acceso al módulo, redirigir a una página de acceso denegado
      const hasAccess = modules.some((module) => module.slug === slug);
      if (!hasAccess) {
        router.push("/access-denied");
      }
    }
  }, [isAuthenticated, isAdmin, modules, slug, router]);

  // Si no está autenticado, no es admin ni tiene acceso al módulo, no se renderiza nada
  if (!isAuthenticated || (!isAdmin && !modules.some((module) => module.slug === slug))) {
    return null; // Puedes mostrar un spinner mientras se verifica o una pantalla de carga
  }

  return <>{children}</>;
};

export default PrivateRoute;
