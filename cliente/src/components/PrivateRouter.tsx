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
      router.push("/login");
    } else if (!isAdmin) {
      const hasAccess = modules.some((module) => module.slug === slug);
      if (!hasAccess) {
        router.push("/access-denied");
      }
    }
  }, [isAuthenticated, isAdmin, modules, slug, router]);

  if (!isAuthenticated || (!isAdmin && !modules.some((module) => module.slug === slug))) {
    return null; 
  }

  return <>{children}</>;
};

export default PrivateRoute;
