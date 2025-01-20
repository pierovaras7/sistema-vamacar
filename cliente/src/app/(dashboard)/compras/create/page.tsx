"use client";

import React, { useState, useEffect } from "react";
import { getProducts } from "@/services/productoService";
import { getProveedores } from "@/services/proveedorService";
import { Producto } from "@/types";
import CompraForm from "@/components/forms/ComprasForm";

type Proveedor = {
  idProveedor: number;
  razonSocial: string;
};

const CreateCompraPage = () => {
  const [productosBase, setProductosBase] = useState<Producto[]>([]);
  const [proveedoresBase, setProveedoresBase] = useState<Proveedor[]>([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await getProducts(); // Llama al servicio para obtener productos
        setProductosBase(response);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    const fetchProveedores = async () => {
      try {
        const response = await getProveedores(); // Llama al servicio para obtener proveedores
        setProveedoresBase(response);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
      }
    };

    fetchProductos();
    fetchProveedores();
  }, []);

  return (
    <div className="p-8 rounded-lg shadow-lg mx-6 my-3 bg-white flex flex-col items-center">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Registrar Nueva Compra</h2>
      <CompraForm productosBase={productosBase} proveedoresBase={proveedoresBase} />
    </div>
  );
};

export default CreateCompraPage;
