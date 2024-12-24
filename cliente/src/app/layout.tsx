import type { Metadata } from "next";
import "./globals.css";

import { Poppins } from 'next/font/google';
import { AuthProvider } from "@/context/AuthContext";


const poppins = Poppins({
  subsets: ['latin'], // Especifica el subset que necesitas (recomendado)
  weight: ['400', '500', '700'], // Opcional: define los pesos que necesitas
  preload: true, // Habilita el preloading para mejorar el rendimiento
});


export const metadata: Metadata = {
  title: "Lama Dev School Management Dashboard",
  description: "Next.js School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
      <body className={poppins.className}>
        {children}
      </body>
      </html>
    </AuthProvider>
  );
}

