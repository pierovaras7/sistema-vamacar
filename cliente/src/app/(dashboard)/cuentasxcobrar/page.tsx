"use client";

import { useEffect, useState } from "react";
import { getCuentasCobrar } from "@/services/cuentasCobrarService";
import { CuentaCobrar } from "@/types";
import { FaPlus } from "react-icons/fa"; // Importa el ícono de "plus"
import DetallesCuentaCobrar from "@/components/DetallesCuentaCobrar";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import RegistrarPagoModal from "@/components/RegistrarPagoModal";
import CrearCuentaCobrarModal from "@/components/CrearCuentaCobrar";

const columns = [
  { header: "Cliente", accessor: "cliente", width: "w-3/12" },
  { header: "Monto Cuenta", accessor: "montoCuenta", width: "w-3/12" },
  { header: "Estado", accessor: "estado", width: "w-3/12" },
  { header: "Acciones", accessor: "actions", width: "w-3/12" },
];

const CuentasXCobrarPage = () => {
  const [cuentas, setCuentas] = useState<CuentaCobrar[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para manejar la visibilidad del modal

  const fetchCuentas = async () => {
    setLoading(true);
    try {
      const response = await getCuentasCobrar();
      setCuentas(response);
    } catch (error: any) {
      console.error("Error al cargar cuentas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Aplica el filtro solo si searchTerm tiene un valor válido
  const filteredCuentas =
    searchTerm.trim() === ""
      ? cuentas
      : cuentas.filter(
          (cuenta) =>
            cuenta.cliente?.natural?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cuenta.cliente?.juridico?.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const indexOfLastCuenta = currentPage * perPage;
  const indexOfFirstCuenta = indexOfLastCuenta - perPage;
  const currentCuentas = filteredCuentas.slice(indexOfFirstCuenta, indexOfLastCuenta);

  const totalPages = Math.ceil(filteredCuentas.length / perPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const renderRow = (item: CuentaCobrar) => (
    <tr key={item.idCC} className="border-b border-gray-200 even:bg-slate-50 text-sm md:text-md hover:bg-lamaPurpleLight">
      <td>
        {item.cliente?.natural
          ? `${item.cliente.natural.nombres} ${item.cliente.natural.apellidos}`
          : item.cliente?.juridico?.razonSocial || "Sin cliente"}
      </td>
      <td>S/. {item.montoCuenta}</td>
      <td>
        {item.montoCuenta != 0 ? (
          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">Activa</span>
        ) : (
          <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded">Inactiva</span>
        )}
      </td>
      <td className="flex flex-row gap-2 justify-around items-center px-4 py-2">
        <RegistrarPagoModal cuentaCobrar={item} onUpdate={fetchCuentas} />
        {item.detalles && <DetallesCuentaCobrar data={item.detalles} />}
      </td>
    </tr>
  );

  useEffect(() => {
    fetchCuentas();
  }, []);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row items-center justify-between">
          <h1 className="text-lg font-semibold w-full justify-start m-2">Cuentas por Cobrar</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="border rounded-md p-2 text-sm md:text-md w-full"
          />
          {/* Botón para abrir el modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <FaPlus /> {/* Icono de plus */}
          </button>
        </div>
      </div>

      {/* Tabla de cuentas por cobrar */}
      <Table columns={columns} renderRow={renderRow} data={currentCuentas} />

      {/* Paginación */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {/* Modal para crear una nueva cuenta por cobrar */}
      {isModalOpen && (
        <CrearCuentaCobrarModal
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            fetchCuentas(); // Actualiza la lista de cuentas por cobrar al guardar
            setIsModalOpen(false); // Cierra el modal
          }}
        />
      )}
    </div>
  );
};

export default CuentasXCobrarPage;
