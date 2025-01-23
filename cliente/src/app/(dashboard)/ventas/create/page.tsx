"use client";
import React, { useState, useEffect } from "react";
import SearchDropdown from "@/components/SearchDropdown";
import { getProducts } from "@/services/productoService";
import { DetailVenta, Producto, Venta } from "@/types";
import VentaForm from "@/components/forms/VentasForm";
import VentasForm2 from "@/components/forms/VentasForm2";
import VentasForm3 from "@/components/forms/VentasForm3";

const VentasPage = () => {
  return (
    <div className="p-8 rounded-lg shadow-lg mx-6 my-3 bg-white flex flex-col items-center">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Detalle de Venta</h2>
      <VentasForm3/>
    </div>
  );
};

export default VentasPage;
