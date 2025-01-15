"use client";

import { useEffect, useState } from "react";
import { getCuentasCobrar } from "@/services/cuentasCobrarService";
import { CuentaCobrar, Inventario } from "@/types";
import { FaPlus } from "react-icons/fa"; // Importa el ícono de "plus"
import DetallesCuentaCobrar from "@/components/DetallesCuentaCobrar";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import RegistrarPagoModal from "@/components/RegistrarPagoModal";
import CrearCuentaCobrarModal from "@/components/CrearCuentaCobrar";
import { getInventarios } from "@/services/inventariosService";
import MovimientosInventario from "@/components/MovimientosInventario";
import RegistrarMovimientoInventarioModal from "@/components/RegistrarMovimientoInventarioModal";
import PrivateRoute from "@/components/PrivateRouter";

const columns = [
  { header: "Cod Producto", accessor: "producto.cod", width: "w-3/12" },
  { header: "Descripcion", accessor: "producto.descripcion", width: "w-3/12" },
  { header: "Stock Minimo", accessor: "stockMinimo", width: "w-2/12" },
  { header: "Stock Actual", accessor: "stockActual", width: "w-2/12" },
  { header: "Acciones", accessor: "acciones", width: "w-2/12" },
];

const InventariosPage = () => {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para manejar la visibilidad del modal

  const fetchInventarios = async () => {
    setLoading(true);
    try {
      const response = await getInventarios();
      setInventarios(response);
    } catch (error: any) {
      console.error("Error al cargar inventarios:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Aplica el filtro solo si searchTerm tiene un valor válido
  const filteredInventarios =
    searchTerm.trim() === ""
      ? inventarios
      : inventarios.filter(
          (inventario) =>
            inventario.producto?.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inventario.producto?.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const indexOfLastInventario = currentPage * perPage;
  const indexOfFirstInventario = indexOfLastInventario - perPage;
  const currentInventarios = filteredInventarios.slice(indexOfFirstInventario, indexOfLastInventario);

  const totalPages = Math.ceil(filteredInventarios.length / perPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const renderRow = (item: Inventario) => (
    <tr key={item.idInventario} className="border-b border-gray-200 even:bg-slate-50 text-xs md:text-md hover:bg-lamaPurpleLight">
      <td className="p-4">{item.producto?.codigo}</td>
      <td>{item.producto?.descripcion}</td>
      <td>{item.stockMinimo}</td>
      <td>{item.stockActual}</td>
      <td className="flex justify-around items-center px-4 py-2">
        <RegistrarMovimientoInventarioModal inventario={item} onUpdate={fetchInventarios}/>
        <MovimientosInventario data={item.movs_inventario} codigo={item.producto?.codigo}/>
      </td>
    </tr>
  );

  useEffect(() => {
    fetchInventarios();
  }, []);

  return (
    <PrivateRoute slug="/inventarios">
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="hidden md:block text-lg font-semibold">Inventarios</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="border rounded-md p-2 text-sm md:text-md"
            />
          </div>
        </div>

        {/* Tabla de inventarios */}
        <Table columns={columns} renderRow={renderRow} data={currentInventarios} />

        {/* Paginación */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      </div>
    </PrivateRoute>
  );
};

export default InventariosPage;