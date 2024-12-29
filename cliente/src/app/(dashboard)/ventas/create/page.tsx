"use client";
import React, { useState, useEffect } from "react";
import SearchDropdown from "@/components/SearchDropdown";
import { getProducts } from "@/services/productoService";
import { DetailVenta, Producto, Venta } from "@/types";
import VentaForm from "@/components/forms/VentasForm";

const VentasPage = () => {
  const [productosBase, setProductosBase] = useState<Producto[]>([]); 

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await getProducts(); // URL de tu API
        console.log(response);
        setProductosBase(response); // Guardar los productos obtenidos en el estado
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProductos(); // Llamada a la API cuando el componente se monta
  }, []); 

  return (
    <div className="p-8 rounded-lg shadow-lg mx-6 my-3 bg-white flex flex-col items-center">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Detalle de Venta</h2>

      <VentaForm productosBase={productosBase}/>

    </div>
  );
};

export default VentasPage;
