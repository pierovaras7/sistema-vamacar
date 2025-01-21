"use client";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation"; // Para redirigir si no hay módulos
import useAuthStore from "@/stores/AuthStore";
import useModules from "@/hooks/useModules";
import useInventarios from "@/hooks/useInventarios";
import useNotificaciones from "@/hooks/useNotificaciones";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAdmin, modules: userModules, isHydrated, reloadModules } = useAuthStore(); 
  const { notificaciones } = useNotificaciones()
  const { modules: fetchedModules, isLoading} = useModules(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [loaded, setLoaded] = useState(false); 
  const router = useRouter(); 

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login"); 
    }
  }, [isHydrated, user, router]);

  

  const filteredModules = isAdmin  ? fetchedModules : fetchedModules.filter((module) => {
    const isMatch = Array.isArray(userModules) && userModules.some(
      (userModule) => userModule.idModule === module.idModule
    );
    return isMatch;
  });

  useEffect(() => {
    if (user && !loaded) {
      console.log("reload");
      reloadModules(user.idUser);
      setLoaded(true);  
    }
  }, [user, loaded, reloadModules]); 

  if(!user){
    return null;
  }
  
  if (!isHydrated || isLoading) {
    return null;
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
            <Image src="/logo.png" alt="logo" width={32} height={32} priority />
            <span className="hidden lg:block font-bold">VAMACAR</span>
          </Link>
          <Menu modules={filteredModules} /> {/* Pasa los módulos filtrados */}
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
          <Navbar user={user} notificaciones={notificaciones} /> {/* Enviar user al Navbar */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}
