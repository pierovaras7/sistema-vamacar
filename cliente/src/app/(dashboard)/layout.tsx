"use client";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { Toaster } from "sonner";
import useAuthStore from "@/stores/AuthStore";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú lateral en pantallas pequeñas

  return (
    <>
      <div className="h-screen flex flex-col md:flex-row">
        {/* LEFT */}
        <div
          className={`fixed top-0 left-0 h-full bg-white z-20 transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 md:relative md:translate-x-0 md:w-[14%] lg:w-[16%] xl:w-[14%] p-4 shadow md:shadow-none`}
        >
          <Link
            href="/"
            className="flex items-center justify-center lg:justify-start gap-2 mb-6"
          >
            <Image src="/logo.png" alt="logo" width={32} height={32} />
            <span className="hidden lg:block font-bold">SchooLama</span>
          </Link>
          <Menu />
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
