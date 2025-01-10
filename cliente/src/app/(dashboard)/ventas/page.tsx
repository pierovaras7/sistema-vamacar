"use client";
import { Trabajador, Venta } from "@/types";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { useEffect, useState, useMemo } from "react";
import { getAllTrabajadores } from "@/services/trabajadoresService";
import useAuthStore from "@/stores/AuthStore";
import PrivateRoute from "@/components/PrivateRouter";
import { anularVenta, getAllVentas } from "@/services/ventaService";
import { PlusCircleIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation"; // Para redirigir si no hay módulos
import { Router } from "next/router";
import { toast } from "sonner";



const columns = [
  { header: "Fecha", accessor: "fecha", className: "text-center hidden md:table-cell", width: "w-2/12" },
  { header: "Cliente", accessor: "cliente", className: "text-center hidden md:table-cell", width: "w-2/12" },
  { header: "Total", accessor: "total", className: "text-center hidden md:table-cell", width: "w-2/12" },
  { header: "Tipo", accessor: "tipoventa", className: "text-center hidden md:table-cell", width: "w-1/12" },
  { header: "Metodo de Pago", accessor: "metodopago", className: "text-center hidden md:table-cell", width: "w-2/12" },
  { header: "Estado", accessor: "estado", className: "text-center hidden md:table-cell", width: "w-1/12" },
  { header: "Opciones", accessor: "opciones", className: "text-center hidden md:table-cell", width: "w-2/12" },
];



const VentasPage = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el texto del filtro
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(true); // Estado de carga
  const { user } = useAuthStore()
  const router = useRouter(); // Para redirigir si no hay módulos

  const refreshVentas = async () => {
    setLoading(true); // Comienza la carga
    try {
      const response = await getAllVentas();
      setVentas(response);
      setFilteredVentas(response); // Inicializa con todos los trabajadores
    } catch (error) {
      console.error("Error al obtener ventas:", error);
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };

  useEffect(() => {
    refreshVentas();
  }, []);

  const anularVenta = async( idVenta : number) => {
    try{
      await anularVenta(idVenta);
      toast.success("Venta anulada correctamente.")
    }catch(error:any){
      console.log(error);
    }
  }

  // Filtrar trabajadores según el término de búsqueda
//   useEffect(() => {
//     const filtered = ventas.filter((venta) =>
//       `${venta.cliente?.nombres}`
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//         (venta.cliente?.dni && trabajador.dni.includes(searchTerm))
//     );
//     setFilteredTrabajadores(filtered);
//   }, [searchTerm, trabajadores]);

  const renderRow = (item: Venta) => (
    <tr
      key={item.idVenta}
      className="text-center border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="text-center hidden md:table-cell p-4">{item.fecha}</td>
      <td>
        {
            item.cliente?.natural
            ? `${item.cliente.natural.nombres} ${item.cliente.natural.apellidos}`
            : item.cliente?.juridico?.razonSocial || "Sin cliente"
        }
      </td>      
      <td className="text-center hidden md:table-cell">S/. {item.total}</td>
      <td className="text-center hidden md:table-cell">{item.tipoVenta.toUpperCase()}</td>
      <td className="text-center hidden md:table-cell">{item.metodoPago.toUpperCase()}</td>
      <td>
        { item.estado ?
          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">Cancelada</span>
          :
          <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded">Inactiva</span>
 
        }
      </td>      
      <td className="text-center hidden md:table-cell">
      <button
        onClick={() => anularVenta(item.idVenta || 0)} // Esta es la corrección
        className="bg-green-400"
      >
        Anular
      </button>

      </td>
    </tr>
  );

  // Filtrar trabajadores para la página actual
  const indexOfLastVenta = currentPage * perPage;
  const indexOfFirstVenta = indexOfLastVenta - perPage;
  const currentVentas= filteredVentas.slice(
    indexOfFirstVenta,
    indexOfLastVenta
  );

  // Número total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(filteredVentas.length / perPage);
  }, [filteredVentas, perPage]);

  // Función para manejar el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <PrivateRoute slug="/ventas">
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Ventas</h1>
        <div className="flex flex-wrap items-center gap-4 ml-auto w-full md:w-auto">
          <div className="w-full sm:w-1/3 md:w-auto">
            <TableSearch onSearch={(term) => setSearchTerm(term)} />
          </div>
          <div className="w-full sm:w-1/3 md:w-auto">
            <span onClick={() => {router.push('/ventas/create')}} className="cursor-pointer">
                <PlusCircleIcon className="w-6 h-6 text-gray-800" />
            </span>
          </div>

        </div>
      </div>


        <div className="overflow-x-auto">
          <Table columns={columns} renderRow={renderRow} data={currentVentas} />
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

export default VentasPage;
