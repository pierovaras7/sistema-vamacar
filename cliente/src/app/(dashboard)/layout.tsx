"use client";

import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import useAuthStore from "@/stores/AuthStore";
import useDashboardStore from "@/stores/DashboardStore";
import { useRouter } from "next/navigation"; // Para redirigir si no hay módulos

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuthStore();
  const { modules, isLoading, fetchModules } = useDashboardStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú lateral en pantallas pequeñas
  const router = useRouter(); // Para redirigir si no hay módulos

  // Cargar los módulos cuando el componente se monta
  useEffect(() => {
    if (!modules.length) {
      fetchModules(); // Solo lo llamamos si no tenemos módulos
    }
  }, [modules, fetchModules]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-screen flex-col">
        <Image src="/logo.png" alt="logo" width={80} height={80} priority />
        <p className="mt-4 text-gray-500 text-sm text-center">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col md:flex-row">
        {/* LEFT */}
        <div
          className={`fixed top-0 left-0 h-full bg-white z-20 transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 md:relative md:translate-x-0 md:w-[14%] lg:w-[16%] xl:w-[14%] p-4 shadow md:shadow-none border-r-2`}
        >
          <Link
            href="/"
            className="flex items-center justify-center lg:justify-start gap-2 mb-6"
          >
            <Image src="/logo.png" alt="logo" width={32} height={32} priority/>
            <span className="hidden lg:block font-bold">SchooLama</span>
          </Link>
          <Menu modules={modules} />
        </div>

        {/* HAMBURGER MENU TOGGLE */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-30 bg-gray-100 p-2 rounded shadow"
        >
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800"></span>
        </button>

        {/* RIGHT */}
        <div className="flex-1 bg-[#F7F8FA] overflow-scroll flex flex-col">
          <Navbar user={user} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}

