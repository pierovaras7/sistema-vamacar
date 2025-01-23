"use client";

import { useEffect, useState, useMemo } from "react";
import { getCompras, updateEstado, getEstados, anularCompra  } from "@/services/comprasService";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import PrivateRoute from "@/components/PrivateRouter";
import { useRouter } from "next/navigation";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { EyeIcon, CurrencyDollarIcon,TrashIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import { Producto } from "@/types";

interface DetalleCompra {
  idProducto: number;
  producto: Producto;
  cantidad: string;
  precioCosto: string;
  subtotal: string;
}

interface Proveedor {
  idProveedor: number;
  razonSocial: string;
}

interface Compra {
  idCompra: number;
  fechaPedido: string;
  fechaPago: string;
  tipoCompra: string;
  total: string;
  proveedor: Proveedor;
  detalle_compra: DetalleCompra[];
  estado?: boolean; // Campo para el estado (agregado dinámicamente)
}

const columns = [
  { header: "Fecha Pedido", accessor: "fechaPedido", width: "w-1/12" },
  { header: "Fecha Pago", accessor: "fechaPago", width: "w-1/12" },
  { header: "Proveedor", accessor: "razonSocial", width: "w-3/12" },
  { header: "Tipo Compra", accessor: "tipoCompra", width: "w-1/12" },
  { header: "Total", accessor: "total", width: "w-2/12" },
  { header: "Estado", accessor: "estado", width: "w-2/12" },
  { header: "Opciones", accessor: "opciones", width: "w-2/12" },
];

const ComprasPage = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [filteredCompras, setFilteredCompras] = useState<Compra[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const router = useRouter();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false); // Estado para el modal de confirmación
  const [compraToDelete, setCompraToDelete] = useState<Compra | null>(null); // Compra a eliminar

  // Obtener compras y estados, luego cruzar datos
  const refreshData = async () => {
    setLoading(true);
    try {
      const [comprasData, estadosData] = await Promise.all([getCompras(), getEstados()]);

      // // Mapear compras y añadir el estado correspondiente
      // const comprasWithEstado = comprasData.map((compra: Compra) => {
      //   const estadoObj = estadosData.find(
      //     (estado: { idCompra: number; estado: number }) => estado.idCompra === compra.idCompra
      //   );
      //   return {
      //     ...compra,
      //     estado: estadoObj?.estado === 1, // Convertir a booleano
      //   };

      // });


      
      setCompras(comprasData);
      setFilteredCompras(comprasData);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar el estado de una compra
  const handlePagar = async (idCompra: number) => {
    try {
      await updateEstado(idCompra, true); // Cambiar estado a "Pagado"
      await refreshData(); // Refrescar datos automáticamente
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  const handleEliminarCompra = async () => {
    if (compraToDelete) {
      try {
        await anularCompra(compraToDelete.idCompra); // Eliminar compra
        await refreshData(); // Refrescar datos
        setIsConfirmDeleteOpen(false); // Cerrar el modal de confirmación
      } catch (error) {
        console.error("Error al eliminar la compra:", error);
      }
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    refreshData();
  }, []);

  // Filtrar compras por el término de búsqueda
  useEffect(() => {
    const filtered = compras.filter((compra) =>
      JSON.stringify(compra).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompras(filtered);
  }, [searchTerm, compras]);


  // Renderizar filas de la tabla
  const renderRow = (compra: Compra) => (
    <tr key={compra.idCompra} className="text-center border-b hover:bg-gray-100 text-sm">
      <td className="py-4">{compra.fechaPedido.split("T")[0]}</td> {/* Mostrar solo la fecha */}
      <td>{compra.fechaPago.split("T")[0]}</td>   {/* Mostrar solo la fecha */}
      <td>{compra.proveedor?.razonSocial}</td>
      <td>{compra.tipoCompra}</td>
      <td>{compra.total}</td>
      <td>
        <span
          className={`px-2 py-1 rounded ${
            compra.estado ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {compra.estado === true ? "Registrada" : "Anulada"}
        </span>
      </td>
      <td>
        <div className="flex flex-row gap-2 justify-center">        
          <button
            className="text-blue-600 hover:underline flex items-center"
            onClick={() => setSelectedCompra(compra)}
          >
            <EyeIcon className="w-5 h-5 mr-1" />
          </button>
          {compra.estado && ( // Mostrar el botón solo si el estado no es "Pagado"
            <button
              className="text-red-600 hover:underline flex items-center"
              onClick={() => {
                setCompraToDelete(compra);
                setIsConfirmDeleteOpen(true); // Abrir modal de confirmación
              }}
            >
              <TrashIcon className="w-5 h-5 mr-1" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  const indexOfLastCompra = currentPage * perPage;
  const indexOfFirstCompra = indexOfLastCompra - perPage;
  const currentCompras = filteredCompras.slice(indexOfFirstCompra, indexOfLastCompra);

  const totalPages = useMemo(
    () => Math.ceil(filteredCompras.length / perPage),
    [filteredCompras, perPage]
  );

  return (
    <PrivateRoute slug="/compras">
      <div className="p-4 bg-white rounded-md mx-5">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold">Compras</h1>
          <div>
            <button
              onClick={() => router.push("/compras/create")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Nueva Compra
            </button>
          </div>
        </div>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <Table columns={columns} renderRow={renderRow} data={currentCompras} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>

      {/* Modal para Detalle */}
      {selectedCompra && (
        <Modal
          title={`Detalle de Compra #${selectedCompra.idCompra}`}
          onClose={() => setSelectedCompra(null)}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Nombre</th>
                <th className="border px-4 py-2">Cantidad</th>
                <th className="border px-4 py-2">Precio Costo</th>
                <th className="border px-4 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedCompra.detalle_compra.map((detalle) => (
                <tr key={detalle.idProducto}>
                  <td className="border px-4 py-2">{detalle.producto?.descripcion}</td>
                  <td className="border px-4 py-2">{detalle.cantidad}</td>
                  <td className="border px-4 py-2">{detalle.precioCosto}</td>
                  <td className="border px-4 py-2">{detalle.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

    {isConfirmDeleteOpen && (
        <Modal
          title="Confirmar Eliminación"
          onClose={() => setIsConfirmDeleteOpen(false)}
        >
          <p>¿Estás seguro de que deseas eliminar esta compra?</p>
          <div className="mt-4 flex justify-end space-x-4">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
              onClick={handleEliminarCompra}
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
      
    </PrivateRoute>
  );
};

export default ComprasPage;
