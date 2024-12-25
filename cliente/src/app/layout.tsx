// /app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext"; // Tu contexto de autenticación
import "./globals.css";  // Asegúrate de que los estilos estén importados


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: true,
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
        <body className={poppins.className}>{children}</body>
      </html>
    </AuthProvider>
  );
}

