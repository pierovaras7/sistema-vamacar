"use client";

import React, { useState, useEffect } from "react";
import { getProveedorByRUC, getProveedores } from "@/services/proveedorService";
import { postCompra } from "@/services/comprasService";
import { toast } from 'sonner';

type Proveedor = {
  idProveedor: number | null; // Define explícitamente idProveedor
  ruc: string;
  razonSocial: string;
  telefono: string;
  correo: string;
  direccion: string;
  nombreRepresentante: string;
};

type Producto = {
  idProducto: number;
  descripcion: string;
  codigo: string;
  precioCosto: number;
};

type DetalleCompra = {
  producto: Producto;
  cantidad: number;
  precio: number;
};

type CompraFormProps = {
  productosBase: Producto[];
  proveedoresBase: { idProveedor: number; razonSocial: string }[]; // Proveedores con ID
};

const CompraForm: React.FC<CompraFormProps> = ({ productosBase }) => {
  const [proveedor, setProveedor] = useState<Proveedor>({
    idProveedor: null as number | null,
    ruc: "",
    razonSocial: "",
    telefono: "",
    correo: "",
    direccion: "",
    nombreRepresentante: "",
  });
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([]);
  const [showDropdown, setShowDropdown] = useState(false); // Control del desplegable
  const [fechaPedido, setFechaPedido] = useState("");
  const [detallesCompra, setDetallesCompra] = useState<DetalleCompra[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [resetDropdown, setResetDropdown] = useState(false);
  const [showDataDetails, setShowDataDetails] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>(productosBase);
  const [isTyping, setIsTyping] = useState(false);
  const [isProveedorSelected, setIsProveedorSelected] = useState(false); // Estado para habilitar/deshabilitar campos
  const [isRUCSelected, setIsRUCSelected] = useState(false); // Estado específico para RUC
  const [ventaTemporal, setVentaTemporal] = useState<any>(null);

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const data = await getProveedores();
        setProveedores(data);
        setFilteredProveedores(data);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
      }
    };
    const filtered = productosBase.filter((producto) =>
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProductos(filtered);

    fetchProveedores();
  }, [searchTerm, productosBase]);


  useEffect(() => {
    const compraGuardada = localStorage.getItem("compraTemporal");
    if (compraGuardada) {
      const compraData = JSON.parse(compraGuardada);
      setProveedor(compraData.proveedor || {});
      setFechaPedido(compraData.fechaPedido || "");
      setDetallesCompra(compraData.detallesCompra || []);
      setVentaTemporal(compraData); // Para manejo global
    } 
    console.log(compraGuardada);
  }, []);


    const actualizarCompra = (nuevaCompra: Partial<any>) => {
    setVentaTemporal((prevCompra: any) => {
      const compraActualizada = {
        ...prevCompra,
        ...nuevaCompra,
        detallesCompra: detallesCompra,
      };
      localStorage.setItem("compraTemporal", JSON.stringify(compraActualizada));
      return compraActualizada;
    });
  };

  useEffect(() => {
    actualizarCompra({
      proveedor,
      fechaPedido,
    });
  }, [proveedor, fechaPedido]);

  const handleSelectProducto = (productoId: number) => {
    const producto = productosBase.find((p) => p.idProducto === productoId);
    if (producto) {
      setSelectedProducto(producto);
    }
  };

   const handleAgregarProducto = () => {
    if (selectedProducto) {
      const detalleExistente = detallesCompra.find(
        (d) => d.producto.idProducto === selectedProducto.idProducto
      );

      if (detalleExistente) {
        setDetallesCompra((prev) =>
          prev.map((detalle) =>
            detalle.producto.idProducto === selectedProducto.idProducto
              ? { ...detalle, cantidad: detalle.cantidad + 1 }
              : detalle
          )
        );
      } else {
        setDetallesCompra((prev) => [
          ...prev,
          { producto: selectedProducto, cantidad: 1, precio: selectedProducto.precioCosto },
        ]);
      }

      setSelectedProducto(null);
      setSearchTerm(""); // Resetea el input
      setIsTyping(false); // Oculta el desplegable

    }
  };

  const handleSeleccionarProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    setSearchTerm(producto.descripcion); // Muestra el nombre del producto seleccionado en el input
    setFilteredProductos([]); // Oculta el desplegable
    setIsTyping(false);
  };


  const handleEliminarDetalle = (detalle: DetalleCompra) => {
    setDetallesCompra((prev) =>
      prev.filter((d) => d.producto.idProducto !== detalle.producto.idProducto)
    );
  }; 

  const handleEditarDetalle = (detalle: DetalleCompra, campo: "cantidad" | "precio", valor: number) => {
    setDetallesCompra((prev) =>
      prev.map((d) =>
        d.producto.idProducto === detalle.producto.idProducto
          ? { ...d, [campo]: valor }
          : d
      )
    );
  };


  const calcularTotal = () => {
    return detallesCompra.reduce((total, detalle) => total + detalle.cantidad * detalle.precio, 0);
  };



  const handleRUCChange = async (ruc: string) => {
    setProveedor((prev) => ({ ...prev, ruc }));

    if (ruc.length === 11) {
      try {
        const data = await getProveedorByRUC(ruc);
        setProveedor({
          idProveedor: data.idProveedor,
          ruc: data.ruc,
          razonSocial: data.razonSocial,
          telefono: data.telefono,
          correo: data.correo,
          direccion: data.direccion,
          nombreRepresentante: data.nombreRepresentante,
        });
        setIsRUCSelected(true); // Cuando se encuentra un proveedor por RUC, deshabilitamos campos
        setIsProveedorSelected(false); // Ignoramos Razón Social
      } catch (error) {
        console.error("Error al buscar el proveedor por RUC:", error);
        toast.error("No se encontró un proveedor con este RUC.");
        setProveedor({
          idProveedor: null,
          ruc: "",
          razonSocial: "",
          telefono: "",
          correo: "",
          direccion: "",
          nombreRepresentante: "",
        });
        setIsRUCSelected(false);
      }
    } else if (ruc.length === 0) {
      setProveedor({
        idProveedor: null,
        ruc: "",
        razonSocial: "",
        telefono: "",
        correo: "",
        direccion: "",
        nombreRepresentante: "",
      });
      setIsRUCSelected(false); // Habilitamos campos al borrar RUC
    }
  };

  const handleRazonSocialChange = (razonSocial: string) => {
    setProveedor((prev) => ({ ...prev, razonSocial }));

    if (razonSocial.length > 0) {
      const filtered = proveedores.filter((prov) =>
        prov.razonSocial.toLowerCase().includes(razonSocial.toLowerCase())
      );
      setFilteredProveedores(filtered);
      setIsProveedorSelected(false); // No está seleccionado aún, solo está escribiendo
      setIsRUCSelected(false); // Si se usa Razón Social, se ignora RUC
    } else {
      setFilteredProveedores(proveedores);
      setProveedor({
        idProveedor: null,
        ruc: "",
        razonSocial: "",
        telefono: "",
        correo: "",
        direccion: "",
        nombreRepresentante: "",
      });
      setIsProveedorSelected(false); // Habilitamos los campos
    }
  };

  const selectProveedor = (prov: Proveedor) => {
    setProveedor(prov);
    setFilteredProveedores([]);
    setShowDropdown(false);
    setIsProveedorSelected(true); // Se seleccionó un proveedor, deshabilitamos los campos
    setIsRUCSelected(false); // Si seleccionamos por Razón Social, ignoramos RUC
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!proveedor.idProveedor) {
      toast.error("Selecciona un proveedor.");
      return;
    }
  
    if (!fechaPedido || detallesCompra.length === 0) {
      toast.error("Completa todos los campos antes de guardar.");
      return;
    }
  
    const compra = {
      idProveedor: proveedor.idProveedor,
      fechaPedido,
      detalle: detallesCompra.map((d) => ({
        idProducto: d.producto.idProducto,
        cantidad: d.cantidad,
        precioCosto: d.precio,
      })),
    };
  
    try {
      await postCompra(compra);
      toast.success("Compra registrada con éxito.");
  
      // Limpia todos los estados
      setProveedor({
        idProveedor: null,
        ruc: "",
        razonSocial: "",
        telefono: "",
        correo: "",
        direccion: "",
        nombreRepresentante: "",
      });
      setFechaPedido("");
      setDetallesCompra([]);
      setSearchTerm("");
  
      // Limpia el Local Storage
      localStorage.removeItem("compraTemporal");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error desconocido.";
      toast.error(errorMessage);
    }
  };
  
  
  

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      {/* Sección del proveedor */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Información del Proveedor</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Razón Social */}
          <div className="relative">
            <label htmlFor="razonSocial" className="block text-gray-700 font-bold">
              Razón Social
            </label>
            <input
              type="text"
              id="razonSocial"
              value={proveedor.razonSocial}
              onChange={(e) => handleRazonSocialChange(e.target.value)}
              onFocus={() => setShowDropdown(true)} // Muestra el desplegable al hacer clic
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // Esconde el desplegable al salir del input
              className="w-full px-4 py-2 border rounded-md"
              disabled={isRUCSelected} // Deshabilitado si se seleccionó un RUC válido
            />
            {showDropdown && filteredProveedores.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded-md w-full max-h-40 overflow-y-auto">
                {filteredProveedores.map((prov, index) => (
                  <li
                    key={index}
                    onClick={() => selectProveedor(prov)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {prov.razonSocial}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* RUC */}
          <div>
            <label htmlFor="ruc" className="block text-gray-700 font-bold">
              RUC
            </label>
            <input
              type="text"
              id="ruc"
              value={proveedor.ruc}
              onChange={(e) => handleRUCChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={isProveedorSelected} // Campo deshabilitado si se seleccionó un proveedor
              required
            />
          </div>
          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-gray-700 font-bold">
              Teléfono
            </label>
            <input
              type="text"
              id="telefono"
              value={proveedor.telefono}
              onChange={(e) => setProveedor({ ...proveedor, telefono: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              disabled={isProveedorSelected || isRUCSelected} // Deshabilitado si se seleccionó un proveedor
            />
          </div>
          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block text-gray-700 font-bold">
              Correo
            </label>
            <input
              type="email"
              id="correo"
              value={proveedor.correo}
              onChange={(e) => setProveedor({ ...proveedor, correo: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              disabled={isProveedorSelected || isRUCSelected} // Deshabilitado si se seleccionó un proveedor
            />
          </div>
          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block text-gray-700 font-bold">
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              value={proveedor.direccion}
              onChange={(e) => setProveedor({ ...proveedor, direccion: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              disabled={isProveedorSelected || isRUCSelected} // Deshabilitado si se seleccionó un proveedor
            />
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Fechas</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Fecha Pedido */}
          <div>
            <label htmlFor="fechaPedido" className="block text-gray-700 font-bold">
              Fecha Pedido
            </label>
            <input
              type="date"
              id="fechaPedido"
              value={fechaPedido}
              onChange={(e) => setFechaPedido(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

        </div>
      </div>

      {/* Productos */}
     <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Seleccionar Productos</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsTyping(e.target.value !== "");
              }}
              placeholder="Buscar productos por descripción o código"
              className="w-full px-4 py-2 border rounded-md"
              onFocus={() => setIsTyping(true)}
              onBlur={() => setTimeout(() => setIsTyping(false), 150)} // Oculta después de 150ms para permitir la selección
            />
            {isTyping && filteredProductos.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded-md w-full max-h-40 overflow-y-auto">
                {filteredProductos.map((producto) => (
                  <li
                    key={producto.idProducto}
                    onClick={() => handleSeleccionarProducto(producto)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {producto.codigo} - {producto.descripcion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={handleAgregarProducto}
            disabled={!selectedProducto}
          >
            Agregar
          </button>
        </div>
      </div>
        <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-200 rounded-lg text-center">
        <thead>
        <tr className="text-left text-gray-500 text-sm bg-gray-100">
        <th></th>
                            <th className="px-6 py-3 text-center border-b w-6/12">Producto</th>
                            <th className="px-6 py-3 text-center border-b w-2/12">Cantidad</th>
                            <th className="px-6 py-3 text-center border-b w-2/4">Precio Unitario</th>
                            <th className="px-6 py-3 text-center border-b w-2/4">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detallesCompra.map((detalle, index) => (
                    <tr
                            key={index}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
                            >          
                            <td className="px-6 py-3 border-b">
                      <button
                      className="w-7 h-7 bg-gray-600 text-white rounded-md hover:bg-gray-400 tex"
                        onClick={() => handleEliminarDetalle(detalle)}
                    >
                      X
                    </button>
                  </td>
                  <td className="px-6 py-3 border-b">
                    {detalle.producto.codigo} - {detalle.producto.descripcion}
                  </td>
                  <td className="px-6 py-3 border-b">
                    <input
                      type="number"
                      value={detalle.cantidad}
                      onChange={(e) =>
                        handleEditarDetalle(detalle, "cantidad", Number(e.target.value))
                      }
                      className="w-full p-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                  </td>
                  <td className="px-6 py-3 border-b">
                  <input
                      type="number"
                      value={detalle.precio}
                      onChange={(e) =>
                        handleEditarDetalle(detalle, "precio", Number(e.target.value))
                      }
                      className="w-full p-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                      style={{ WebkitAppearance: "none" }}
                    />
                  </td>
                  <td className="px-6 py-3 border-b">
                  {(detalle.cantidad * detalle.precio).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
              <td colSpan={4} className="px-6 py-3 text-right">
                Total
                </td>
                <td className="p-1">
                {calcularTotal().toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-2 rounded-md mt-4 hover:bg-green-700"
      >
        Registrar Compra
      </button>
    </form>
  );
};

export default CompraForm;
