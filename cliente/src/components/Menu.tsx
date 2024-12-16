"use client";
import { useAuth } from "@/context/AuthContext"; // Contexto de autenticación
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Menu = () => {
  const { user } = useAuth(); // Obtenemos la información del usuario autenticado
  const [permissions, setPermissions] = useState<string[]>([]); // Permisos asignados al usuario
  const [error, setError] = useState<string | null>(null); // Para manejar errores

  // Cargar los permisos del usuario desde la API
  useEffect(() => {
    if (user?.idUser) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/${user.idUser}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Permisos obtenidos:", data); // Depuración: verifica los permisos
          const slugs = data.modules?.map((module: any) => module.slug) || [];
          setPermissions(slugs); // Guardamos los slugs de los módulos permitidos
        })
        .catch((error) => {
          console.error("Error al obtener los permisos:", error);
          setError("No se pudieron cargar los permisos del usuario");
        });
    }
  }, [user]);

  // Estructura del menú
  const menuItems = [
    {
      title: "MENU",
      items: [
        { icon: "/home.png", label: "Home", href: "/",  slug: "always_visible" },
        { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", slug: "teachers" },
        // Otros ítems del menú...
      ],
    },
    {
      title: "OTHER",
      items: [
        { icon: "/profile.png", label: "Profile", href: "/profile", slug: "profile" },
        {
          icon: "/setting.png",
          label: "permisos",
          href: "/permisos",
          slug: "permisos", // Indicador para elementos siempre visibles
        },
        {
          icon: "/logout.png",
          label: "Logout",
          href: "#",
          slug: "always_visible", // Indicador para elementos siempre visibles
          onClick: () => console.log("Logout clicked"),
        },
      ],
    },
  ];

  // Filtrar los ítems según los permisos del usuario
  const filteredMenuItems = menuItems.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        permissions.includes(item.slug) || // Mostrar si el slug está permitido
        item.slug === "always_visible" // Mostrar siempre si el slug es "always_visible"
    ),
  }));

  return (
    <div className="mt-4 text-sm ">
      {error && <p className="text-red-500">{error}</p>} {/* Mostrar error si ocurre */}
      {filteredMenuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
              onClick={item.onClick ? item.onClick : undefined}
            >
              <Image src={item.icon} alt="" width={20} height={20} />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;
