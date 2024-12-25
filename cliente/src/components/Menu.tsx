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
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/home.png",
        label: "Categoria",
        href: "/list/categoria",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/home.png",
        label: "Marca",
        href: "/list/marca",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/home.png",
        label: "Producto",
        href: "/list/producto",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "Trabajadores",
        href: "/trabajadores",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
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

      {/* Renderiza los módulos */}
      {modules.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          {modules.map((module) => (
            <Link
              href={module.slug}
              key={module.idModule}
              className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
            >
              <span className="hidden lg:block">{module.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
