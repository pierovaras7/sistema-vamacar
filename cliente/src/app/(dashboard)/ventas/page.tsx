"use client";
import { Venta } from "@/types";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { useEffect, useState, useMemo } from "react";
import PrivateRoute from "@/components/PrivateRouter";
import { anularVenta, getAllVentas } from "@/services/ventaService";
import { PlusCircleIcon, PrinterIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import ComprobanteVenta from "@/components/ComprobanteVenta";

const columns = [
  { header: "Fecha", accessor: "fecha", className: "text-center", width: "w-2/12" },
  { header: "Cliente", accessor: "cliente", className: "text-center", width: "w-2/12" },
  { header: "Total", accessor: "total", className: "text-center", width: "w-2/12" },
  { header: "Tipo", accessor: "tipoventa", className: "text-center hidden md:table-cell", width: "w-2/12" },
  { header: "Estado", accessor: "estado", className: "text-center hidden md:table-cell", width: "w-2/12" },
  { header: "Opciones", accessor: "opciones", className: "text-center hidden md:table-cell", width: "w-2/12" },
];

const VentasPage = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [cargadas, setCargadas] = useState(false);
  const router = useRouter();
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

  const refreshVentas = async (start?: string, end?: string) => {
    setCargadas(true);
    setLoading(true);
    try {
      const response = await getAllVentas(start,end);
      setVentas(response);
      setFilteredVentas(response);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const anularVentaRegistrada = async (idVenta?: number) => {
    try {
      await anularVenta(idVenta);
      toast.success("Venta anulada correctamente.");
      refreshVentas(fechaInicio, fechaFin); // Actualizar lista después de anular
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
        const filtered = ventas.filter((venta) => {
          const search = searchTerm.toLowerCase();
      
          // Verifica si es cliente natural
          const clienteNatural =
            venta.cliente?.natural?.nombres?.toLowerCase().includes(search) ||
            venta.cliente?.natural?.apellidos?.toLowerCase().includes(search);
      
          // Verifica si es cliente jurídico
          const clienteJuridico =
            venta.cliente?.juridico?.razonSocial?.toLowerCase().includes(search);
      
          // Retorna true si alguna de las condiciones es verdadera
          return (clienteNatural || clienteJuridico);
        });
      
        setFilteredVentas(filtered);
      }, [searchTerm]);

  const renderRow = (item: Venta) => (
    <tr
      key={item.idVenta}
      className="text-center border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="text-center py-4 px-2">{item.fecha}</td>
      <td>
        {item.cliente?.natural
          ? `${item.cliente.natural.nombres} ${item.cliente.natural.apellidos}`
          : item.cliente?.juridico?.razonSocial || "Sin cliente"}
      </td>
      <td className="text-center">S/. {item.total}</td>
      <td className="text-center hidden md:table-cell">{item.tipoVenta.toUpperCase()}</td>
      <td className="text-center hidden md:table-cell">
        {item.estado === false ? (
          <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">Anulada</span>
        ) : item.tipoVenta === "credito" ? (
          <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded">Pendiente</span>
        ) : (
          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">Cancelada</span>
        )}
      </td>
      <td className="text-center hidden md:table-cell">
        <div className="flex flex-row gap-2 justify-center">
          {item.estado === true && (
            <>
              <button
                onClick={() => anularVentaRegistrada(item?.idVenta)}
                className="text-gray-700 font-semibold rounded text-xs px-2 py-1 bg-gray-400"
              >
                Anular
              </button>
              <button
                onClick={async () => {
                  const blob = await pdf(<ComprobanteVenta venta={item} />).toBlob();
                  const url = URL.createObjectURL(blob);
                  window.open(url);
                }}
                className="font-semibold rounded text-xs px-2 py-1 bg-blue-400"
              >
                <PrinterIcon className="w-6 h-6 text-blue-700" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const indexOfLastVenta = currentPage * perPage;
  const indexOfFirstVenta = indexOfLastVenta - perPage;
  const currentVentas = filteredVentas.slice(indexOfFirstVenta, indexOfLastVenta);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredVentas.length / perPage);
  }, [filteredVentas, perPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getMinDate = (fechaInicio: string): string => {
    const date = new Date(fechaInicio);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  return (
    <PrivateRoute slug="/ventas">
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-between w-full my-6">
          <div>
            <h1 className="text-lg font-semibold md:w-auto w-full text-center md:text-left m-2">Ventas</h1>
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
                onClick={() => refreshVentas(fechaInicio, fechaFin)}
                className="text-white bg-blue-500 px-4 py-2 rounded-md"
              >
                Buscar
              </button>
            </div>
          </div>
          {cargadas && (
            <div className="flex items-center gap-4 w-full md:w-auto">
              <TableSearch onSearch={(term) => setSearchTerm(term)} />
              <span onClick={() => { router.push('/ventas/create') }} className="cursor-pointer">
                <PlusCircleIcon className="w-6 h-6 text-gray-800" />
              </span>
            </div>)
          }
        </div>
        {!cargadas ? (
          null
        ) : (
          <>
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
          </>
        )}

        
      </div>
    </PrivateRoute>
  );
};

export default VentasPage;
