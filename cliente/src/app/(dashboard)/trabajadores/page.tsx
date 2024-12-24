"use client"
import { Trabajador } from "@/types/auth";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllTrabajadores } from "@/services/trabajadoresService";

const columns = [
  {
    header: "Info",
    accessor: "info",
    className: "pl-4",
    width: 'w-3/12'
  },
  {
    header: "DNI",
    accessor: "dni",
    className: "hidden md:table-cell",
    width: 'w-1/12'
  },
  {
    header: "Telefono",
    accessor: "telefono",
    className: "hidden md:table-cell",
    width: 'w-1/12'
  },
  {
    header: "Area",
    accessor: "area",
    className: "hidden md:table-cell",
    width: 'w-1/12'
  },
  {
    header: "Direccion",
    accessor: "direccion",
    className: "hidden md:table-cell",
    width: 'w-3/12'
  },
  {
    header: "Opciones",
    accessor: "opcion",
    width: 'w-1/12'
  },
];

const TrabajadoresPage = () => {
  // Estado para almacenar los trabajadores
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10); // Cuántos trabajadores mostrar por página

  //Función para obtener y actualizar los trabajadores
  const refreshTrabajadores = async () => {
    try {
      const response = await getAllTrabajadores(); // Llama al servicio para obtener los datos
      setTrabajadores(response); // Actualiza el estado con los nuevos datos
    } catch (error) {
      console.error("Error al obtener trabajadores:", error);
    }
  };

  // Efecto para inicializar los trabajadores
  useEffect(() => {
    refreshTrabajadores(); // Llama a la función al montar el componente
  }, []);

  // Filtrar trabajadores para la página actual
  const indexOfLastTrabajador = currentPage * perPage;
  const indexOfFirstTrabajador = indexOfLastTrabajador - perPage;
  const currentTrabajadores = trabajadores.slice(indexOfFirstTrabajador, indexOfLastTrabajador);

  // Número total de páginas
  const totalPages = Math.ceil(trabajadores.length / perPage);

  // Función para manejar el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderRow = (item: Trabajador) => (
    <tr
      key={item.idTrabajador}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.nombres + ' ' + item.apellidos}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.dni}</td>
      <td className="hidden md:table-cell">{item.telefono}</td>
      <td className="hidden md:table-cell">{item.area}</td>
      <td className="hidden md:table-cell">{item.direccion}</td>
      <td>
        <div className="flex items-center gap-2">
            <FormModal table="trabajador" type="update" data={item} id={item.idTrabajador} onUpdate={refreshTrabajadores}/>
            <FormModal table="trabajador" type="delete" id={item.idTrabajador} onUpdate={refreshTrabajadores}/>
        </div>
      </td>

    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Trabajadores</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormModal table="trabajador" type="create" onUpdate={refreshTrabajadores}/>
            
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={currentTrabajadores} />
      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />    
    </div>
  );
};

export default TrabajadoresPage;
