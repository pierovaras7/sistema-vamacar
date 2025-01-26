"use client";

import { useEffect, useState, useMemo } from "react";
import { getCompras, updateEstado, getEstados, anularCompra, exportCompras  } from "@/services/comprasService";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import PrivateRoute from "@/components/PrivateRouter";
import { useRouter } from "next/navigation";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { EyeIcon, CurrencyDollarIcon,TrashIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import { Producto } from "@/types";
import TableSearch from "@/components/TableSearch";
import { DocumentIcon } from "@heroicons/react/16/solid";

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
  const [compraToDelete, setCompraToDelete] = useState<Compra | null>(null); // Compra a eliminar7
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [cargadas, setCargadas] = useState(false);


  // Obtener compras y estados, luego cruzar datos
  const refreshData = async (start?: string, end?: string) => {
    setCargadas(true);
    setLoading(true);
    try {
      const [comprasData, estadosData] = await Promise.all([getCompras(start, end), getEstados()]);
      
      setCompras(comprasData);
      setFilteredCompras(comprasData);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setLoading(false);
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

  // Filtrar compras por el término de búsqueda
  useEffect(() => {
    const filtered = compras.filter((compra) =>
      JSON.stringify(compra).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompras(filtered);
  }, [searchTerm, compras]);

  const exportarCompras = async (start?: string, end?: string) => {
    await exportCompras(start,end);
  };

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

  const getMinDate = (fechaInicio: string): string => {
    const date = new Date(fechaInicio);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  return (
    <PrivateRoute slug="/compras">
      <div className="p-4 bg-white rounded-md mx-5">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-between w-full my-6">
          <div>
            <h1 className="text-lg font-semibold md:w-auto w-full text-center md:text-left m-2">Compras</h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full md:w-auto px-3">
              {/* inputs fechas */}
              <div className="flex flex-col w-full md:w-auto">
                <label htmlFor="fechaInicio" className="text-xs font-semibold">Fecha de Inicio</label>
                <input
                  type="date"
                  id="fechaInicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="border p-2 rounded text-xs"
                />
              </div>
              <div className="flex flex-col w-full md:w-auto">
                <label htmlFor="fechaFin" className="text-xs font-semibold">Fecha de Fin</label>
                <input
                  type="date"
                  id="fechaFin"
                  value={fechaFin}
                  min={fechaInicio ? getMinDate(fechaInicio) : undefined}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="border p-2 rounded text-xs"
                />
              </div>
              <button
                onClick={() => refreshData(fechaInicio, fechaFin)}
                className="text-white bg-blue-500 px-4 py-2 rounded-md"
              >
                Buscar
              </button>
            </div>
          </div>
          {cargadas && (
            <div className="flex items-center gap-4 w-full md:w-auto">
              <TableSearch onSearch={(term) => setSearchTerm(term)} />
              <span onClick={() => { router.push('/compras/create') }} className="cursor-pointer">
                <PlusCircleIcon className="w-6 h-6 text-gray-800" />
              </span>
            </div>)
          }
        </div>
        { !cargadas ? (
          null
        ) : (
          <>
             <div className="flex w-full justify-end">
              <button className="bg-green-700 text-white p-2 rounded-md flex gap-2"
              onClick={() => exportarCompras(fechaInicio, fechaFin)}>
               <DocumentIcon className="w-6 h-6" /> {/* Ícono de documento */}
                Exportar compras a Excel
              </button>
            </div>
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
