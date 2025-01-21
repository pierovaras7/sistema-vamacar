"use client";

import { useEffect, useState } from "react";
import { getCuentasPorPagar, updateEstado } from "@/services/comprasService";
import { FaMoneyBillWave } from "react-icons/fa";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";

const columns = [
  { header: "Proveedor", accessor: "proveedor", width: "w-2/12" },
  { header: "Monto Pago", accessor: "montoPago", width: "w-2/12" },
  { header: "Estado", accessor: "estado", width: "w-2/12" },
  { header: "Fecha Pedido", accessor: "fechaPedido", width: "w-2/12" },
  { header: "Fecha Pago", accessor: "fechaPago", width: "w-2/12" },
  { header: "Acciones", accessor: "actions", width: "w-2/12" },
];

const CuentasPorPagarPage = () => {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCuentas = async () => {
    setLoading(true);
    try {
      const response = await getCuentasPorPagar();
      setCuentas(response);
    } catch (error: any) {
      console.error("Error al cargar cuentas por pagar:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => setSearchTerm(term);

  const handlePagar = async (idCompra: number) => {
    try {
      await updateEstado(idCompra, true); // Cambia el estado a "pagado"
      await fetchCuentas(); // Recarga las cuentas por pagar
    } catch (error: any) {
      console.error("Error al actualizar el estado de pago:", error.message);
    }
  };



  
  const filteredCuentas = searchTerm
    ? cuentas.filter((cuenta) =>
        cuenta.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cuentas;

  const indexOfLastCuenta = currentPage * perPage;
  const indexOfFirstCuenta = indexOfLastCuenta - perPage;
  const currentCuentas = filteredCuentas.slice(indexOfFirstCuenta, indexOfLastCuenta);

  const totalPages = Math.ceil(filteredCuentas.length / perPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const renderRow = (item: any) => (
    <tr
      key={item.idCP}
      className="border-b border-gray-200 even:bg-slate-50 text-sm md:text-md hover:bg-gray-100"
    >
      <td className="p-4">{item.proveedor || "Proveedor no identificado"}</td>
      <td>S/. {item.montoPago}</td>
      <td>
        {item.estado ? (
          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
            Pagada
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded">
            Pendiente
          </span>
        )}
      </td>
      <td>{item.fechaPedido.split("T")[0]}</td>
      <td>{item.fechaPago.split("T")[0]}</td>
      <td className="h-full">
        {/* Mostrar botón "Pagar" solo si el estado es "Pendiente" */}
        {!item.estado && (
          <button
            onClick={() => handlePagar(item.idCompra)} // Asegúrate de usar idCompra
            className="text-blue-500 hover:text-blue-700 flex items-center gap-1 m-auto"
            title="Pagar"
          >
            <FaMoneyBillWave className="text-lg" />
            <span className="text-sm font-medium">Pagar</span>
          </button>
        )}
      </td>
    </tr>
  );

  useEffect(() => {
    fetchCuentas();
  }, []);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-lg font-semibold w-full justify-start m-2">Cuentas por Pagar</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar proveedor..."
            className="border rounded-md p-2 text-sm md:text-md w-full"
          />
        </div>
      </div>

      {/* Tabla de cuentas por pagar */}
      <Table columns={columns} renderRow={renderRow} data={currentCuentas} />

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CuentasPorPagarPage;
