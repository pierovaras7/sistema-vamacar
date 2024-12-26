"use client";
import { Trabajador } from "@/types";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { useEffect, useState, useMemo } from "react";
import { getAllTrabajadores } from "@/services/trabajadoresService";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import useAuthStore from "@/stores/AuthStore";
import PrivateRoute from "@/components/PrivateRouter";

const columns = [
  { header: "Nombres", accessor: "nombres", className: "pl-4", width: "w-3/12" },
  { header: "DNI", accessor: "dni", className: "hidden md:table-cell", width: "w-1/12" },
  { header: "Teléfono", accessor: "telefono", className: "hidden md:table-cell", width: "w-1/12" },
  { header: "Área", accessor: "area", className: "hidden md:table-cell", width: "w-1/12" },
  { header: "Dirección", accessor: "direccion", className: "hidden md:table-cell", width: "w-3/12" },
  { header: "Opciones", accessor: "opciones", width: "w-1/12" },
];



const TrabajadoresPage = () => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [filteredTrabajadores, setFilteredTrabajadores] = useState<Trabajador[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el texto del filtro
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(true); // Estado de carga
  const { user } = useAuthStore()

  const refreshTrabajadores = async () => {
    setLoading(true); // Comienza la carga
    try {
      const response = await getAllTrabajadores();
      setTrabajadores(response);
      setFilteredTrabajadores(response); // Inicializa con todos los trabajadores
    } catch (error) {
      console.error("Error al obtener trabajadores:", error);
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };

  useEffect(() => {
    refreshTrabajadores();
  }, []);

  // Filtrar trabajadores según el término de búsqueda
  useEffect(() => {
    const filtered = trabajadores.filter((trabajador) =>
      `${trabajador.nombres} ${trabajador.apellidos}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        (trabajador.dni && trabajador.dni.includes(searchTerm))
    );
    setFilteredTrabajadores(filtered);
  }, [searchTerm, trabajadores]);

  const renderRow = (item: Trabajador) => (
    <tr
      key={item.idTrabajador}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex flex-col md:flex-row md:items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.nombres + " " + item.apellidos}</h3>
          <p className="md:hidden text-gray-500">{item.dni}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.dni}</td>
      <td className="hidden md:table-cell">{item.telefono}</td>
      <td className="hidden md:table-cell">{item.area}</td>
      <td className="hidden md:table-cell">{item.direccion}</td>
      <td>
        <div className="flex flex-wrap items-center gap-2">
          <FormModal
            table="trabajador"
            type="update"
            data={item}
            id={item.idTrabajador}
            onUpdate={refreshTrabajadores}
          />
          <FormModal
            table="trabajador"
            type="delete"
            id={item.idTrabajador}
            onUpdate={refreshTrabajadores}
          />
        </div>
      </td>
    </tr>
  );

  // Filtrar trabajadores para la página actual
  const indexOfLastTrabajador = currentPage * perPage;
  const indexOfFirstTrabajador = indexOfLastTrabajador - perPage;
  const currentTrabajadores = filteredTrabajadores.slice(
    indexOfFirstTrabajador,
    indexOfLastTrabajador
  );

  // Número total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(filteredTrabajadores.length / perPage);
  }, [filteredTrabajadores, perPage]);

  // Función para manejar el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <PrivateRoute slug="/trabajadores">
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Trabajadores</h1>
        <div className="flex flex-wrap items-center gap-4 ml-auto w-full md:w-auto">
          <div className="w-full sm:w-1/3 md:w-auto">
            <TableSearch onSearch={(term) => setSearchTerm(term)} />
          </div>
          <div className="w-full sm:w-1/3 md:w-auto">
            <FormModal table="trabajador" type="create" onUpdate={refreshTrabajadores} />
          </div>
        </div>
      </div>


        <div className="overflow-x-auto">
          <Table columns={columns} renderRow={renderRow} data={currentTrabajadores} />
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

export default TrabajadoresPage;
