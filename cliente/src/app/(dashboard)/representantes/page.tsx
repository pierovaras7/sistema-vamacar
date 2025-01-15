"use client";
import { Representante } from "@/types";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { useEffect, useState, useMemo } from "react";
import { getAllRepresentantes } from "@/services/representantesService";
import useAuthStore from "@/stores/AuthStore";
import PrivateRoute from "@/components/PrivateRouter";

const columns = [
  { header: "Nombres", accessor: "nombres", className: "pl-4", width: "w-3/12" },
  { header: "Apellidos", accessor: "apellidos", className: "pl-4", width: "w-3/12" },
  { header: "DNI", accessor: "dni", className: "hidden md:table-cell", width: "w-2/12" },
  { header: "Cargo", accessor: "cargo", className: "hidden md:table-cell", width: "w-2/12" },
  { header: "Teléfono", accessor: "telefono", className: "hidden md:table-cell", width: "w-2/12" },
  { header: "Estado", accessor: "estado", className: "hidden md:table-cell", width: "w-2/12" },
  { header: "Opciones", accessor: "opciones", width: "w-2/12" },
];

const RepresentantesPage = () => {
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [filteredRepresentantes, setFilteredRepresentantes] = useState<Representante[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const refreshRepresentantes = async () => {
    setLoading(true);
    try {
      const response = await getAllRepresentantes();
      setRepresentantes(response);
      setFilteredRepresentantes(response);
    } catch (error) {
      console.error("Error al obtener representantes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRepresentantes();
  }, []);

  // Filtrar representantes según el término de búsqueda
  useEffect(() => {
    const filtered = representantes.filter((representante) =>
      representante.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      representante.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      representante.dni.includes(searchTerm) ||
      representante.telefono.includes(searchTerm)
    );
    setFilteredRepresentantes(filtered);
  }, [searchTerm, representantes]);

  const renderRow = (item: Representante) => (
    <tr
      key={item.idRepresentante}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 font-semibold">{item.nombres}</td>
      <td className="p-4">{item.apellidos}</td>
      <td className="hidden md:table-cell">{item.dni}</td>
      <td className="hidden md:table-cell">{item.cargo}</td>
      <td className="hidden md:table-cell">{item.telefono}</td>
      <td className="hidden md:table-cell">{item.estado ? "Activo" : "Inactivo"}</td>
      <td>
        <div className="flex flex-wrap items-center gap-2">
          <FormModal
            table="representante"
            type="update"
            data={item}
            id={item.idRepresentante}
            onUpdate={refreshRepresentantes}
          />
          <FormModal
            table="representante"
            type="delete"
            id={item.idRepresentante}
            onUpdate={refreshRepresentantes}
          />
        </div>
      </td>
    </tr>
  );

  // Paginar representantes
  const indexOfLastRepresentante = currentPage * perPage;
  const indexOfFirstRepresentante = indexOfLastRepresentante - perPage;
  const currentRepresentantes = filteredRepresentantes.slice(
    indexOfFirstRepresentante,
    indexOfLastRepresentante
  );

  const totalPages = useMemo(() => {
    return Math.ceil(filteredRepresentantes.length / perPage);
  }, [filteredRepresentantes, perPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <PrivateRoute slug="/representantes">
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">Representantes</h1>
          <div className="flex flex-wrap items-center gap-4 ml-auto w-full md:w-auto">
            <div className="w-full sm:w-1/3 md:w-auto">
              <TableSearch onSearch={(term) => setSearchTerm(term)} />
            </div>
            <div className="w-full sm:w-1/3 md:w-auto">
              <FormModal table="representante" type="create" onUpdate={refreshRepresentantes} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table columns={columns} renderRow={renderRow} data={currentRepresentantes} />
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

export default RepresentantesPage;
