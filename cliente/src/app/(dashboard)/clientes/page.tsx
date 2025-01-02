"use client";
import { Cliente } from "@/types";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { useEffect, useState, useMemo } from "react";
import { getAllClientes } from "@/services/clientesService";
import useAuthStore from "@/stores/AuthStore";
import PrivateRoute from "@/components/PrivateRouter";

const columns = [
  { header: "Tipo", accessor: "tipoCliente", className: "pl-4", width: "w-1/12" },
  { header: "DNI - RUC", accessor: "", className: "hidden md:table-cell", width: "w-2/12" },
  { header: "Nombres - Razon Social", accessor: "nombres", className: "hidden md:table-cell", width: "w-2/12" },
  { header: "Telefono", accessor: "telefono", className: "hidden md:table-cell", width: "w-1/12" },
  { header: "Correo", accessor: "correo", className: "hidden md:table-cell", width: "w-2/12" },
  { header: "Direccion", accessor: "direccion", className: "hidden md:table-cell", width: "w-2/12" },
  { header: "Opciones", accessor: "opciones", width: "w-2/12" },
];

const ClientesPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const refreshClientes = async () => {
    setLoading(true);
    try {
      const response = await getAllClientes();
      setClientes(response);
      setFilteredClientes(response);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshClientes();
  }, []);

  // Filtrar clientes según el término de búsqueda
  useEffect(() => {
    const filtered = clientes.filter((cliente) =>
      cliente.tipoCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono.includes(searchTerm) ||
      cliente.correo.toLowerCase().includes(searchTerm)
    );
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  const renderRow = (item: Cliente) => {

    // const dniRuc = item.natural ? item.natural.dni : item.juridico?.ruc;

    // console.log(dniRuc);
    return (
    <tr
      key={item.idCliente}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 font-semibold">{item.tipoCliente}</td>
      <td className="hidden md:table-cell">
        {item.tipoCliente.toUpperCase() === "NATURAL"  ? item.natural?.dni : item.juridico?.ruc}
      </td>      
      <td className="hidden md:table-cell">
        {item.tipoCliente.toUpperCase() === "NATURAL" 
          ? `${item.natural?.nombres} ${item.natural?.apellidos}` 
          : item.juridico?.razonSocial}
      </td>      
      <td className="hidden md:table-cell">{item.telefono}</td>
      <td className="hidden md:table-cell">{item.correo}</td>
      <td className="hidden md:table-cell">{item.direccion}</td>
      <td>
        <div className="flex flex-wrap items-center gap-2 justify-center">
          <FormModal
            table="cliente"
            type="update"
            data={item}
            id={item.idCliente}
            onUpdate={refreshClientes}
          />
          <FormModal
            table="cliente"
            type="delete"
            id={item.idCliente}
            onUpdate={refreshClientes}
          />
        </div>
      </td>
    </tr>
    )
  };

  // Paginar clientes
  const indexOfLastCliente = currentPage * perPage;
  const indexOfFirstCliente = indexOfLastCliente - perPage;
  const currentClientes = filteredClientes.slice(
    indexOfFirstCliente,
    indexOfLastCliente
  );


  const totalPages = useMemo(() => {
    return Math.ceil(filteredClientes.length / perPage);
  }, [filteredClientes, perPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <PrivateRoute slug="/clientes">
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">Clientes</h1>
          <div className="flex flex-wrap items-center gap-4 ml-auto w-full md:w-auto">
            <div className="w-full sm:w-1/3 md:w-auto">
              <TableSearch onSearch={(term) => setSearchTerm(term)} />
            </div>
            <div className="w-full sm:w-1/3 md:w-auto">
              <FormModal table="cliente" type="create" onUpdate={refreshClientes} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table columns={columns} renderRow={renderRow} data={currentClientes} />
        </div>

        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </PrivateRoute>
  );
};

export default ClientesPage;
