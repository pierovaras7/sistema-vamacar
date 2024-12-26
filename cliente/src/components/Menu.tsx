"use client";

import Link from "next/link";
import Image from "next/image";
import { role } from "@/lib/data";
import { logout } from "@/services/authService"; // Ajusta la ruta según sea necesario
import { Module } from "@/types";

interface MenuProps {
  modules: Module[];
}

const menuItems = [
  {
    title: "OTROS",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "#",
        visible: ["admin", "teacher", "student", "parent"],
        onClick: logout,
      },
    ],
  },
];

const Menu: React.FC<MenuProps> = ({ modules }) => {
  return (
    <div className="mt-4 text-sm">
      {/* Renderiza los módulos */}
      {modules.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          {modules.map((module) => (
            <Link
              href={module.slug}
              key={module.idModule}
              className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
            >
            <Image 
              src={`/${module.name.toLowerCase()}.png`} 
              alt={`Imagen de ${module.name}`} 
              width={20} 
              height={20} 
            />
            <span className="hidden lg:block">{module.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Renderiza el menú basado en el rol */}
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                  onClick={item.onClick ? item.onClick : undefined} // Llamar la función de logout si está definida
                >
                  <Image src={item.icon} alt={item.label} width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
