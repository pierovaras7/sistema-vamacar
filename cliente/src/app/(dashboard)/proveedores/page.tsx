"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getProveedores, deleteProveedor } from "@/services/proveedorService";
import { getRepresentante } from "@/services/representanteService";
import { FiTrash, FiEdit } from "react-icons/fi";
import { toast } from "react-toastify";

type Proveedor = {
  idProveedor: number;
  ruc: string;
  razonSocial: string;
  telefono: string;
  correo: string;
  direccion: string;
  nombreRepresentante:string;
  estado: boolean; // Campo estado
};



const columns = [
  { header: "RUC", accessor: "ruc", className: "text-center",width: "w-1/12" },
  { header: "Razón Social", accessor: "razonSocial", className: "text-center", width: "w-2/12" },
  { header: "Teléfono", accessor: "telefono", className: "hidden md:table-cell text-center", width: "w-1/12" },
  { header: "Correo", accessor: "correo", className: "hidden md:table-cell text-center", width: "w-2/12" },
  { header: "Direccion", accessor: "direccion", className: "hidden md:table-cell text-center", width: "w-2/12" },
  { header: "Representante", accessor: "Representante", className: "hidden md:table-cell text-center", width: "w-2/12" },
  { header: "Acciones", accessor: "actions", className: "", width: "w-2/12" },
];

const ProvidersPage = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchProveedores = async () => {
    try {
      const response = await getProveedores();
      const activeProveedores = response.filter((proveedor: Proveedor) => proveedor.estado); // Filtrar por estado: true
      setProveedores(activeProveedores);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredProveedores = proveedores.filter((proveedor) =>
    proveedor.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProveedor = currentPage * perPage;
  const indexOfFirstProveedor = indexOfLastProveedor - perPage;
  const currentProveedores = filteredProveedores.slice(
    indexOfFirstProveedor,
    indexOfLastProveedor
  );

  const totalPages = Math.ceil(filteredProveedores.length / perPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleDeleteProveedor = async () => {
    if (!selectedProveedor || !selectedProveedor.idProveedor) {
      toast.error("No se ha seleccionado un proveedor válido para eliminar.");
      return;
    }
  
    try {
      await deleteProveedor(selectedProveedor.idProveedor);
      setIsDeleteModalOpen(false);
      fetchProveedores();
      toast.success("Proveedor eliminado exitosamente");
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Proveedor no encontrado.");
      } else {
        toast.error("Hubo un error al eliminar el proveedor.");
      }
    }
  };
  
  useEffect(() => {
    fetchProveedores();
  }, []);

  const renderRow = (item: Proveedor) => (
    <tr key={item.idProveedor} className="border-b border-gray-200 even:bg-gray-50 text-sm hover:bg-gray-100">
      <td className="text-center py-4">{item.ruc}</td>
      <td className="text-center">{item.razonSocial}</td>
      <td className="hidden md:table-cell text-center">{item.telefono}</td>
      <td className="hidden md:table-cell text-center">{item.correo}</td>
      <td className="hidden md:table-cell text-center">{item.direccion}</td>
      <td className="hidden md:table-cell text-center">{item.nombreRepresentante}</td>
      <td>
        <div className="flex items-center gap-2 justify-center">
          <FormModal
            table="provider"
            type="update"
            data={item}
            id={item.idProveedor}
            onUpdate={fetchProveedores}
          />
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white"
            onClick={() => {
              setSelectedProveedor(item);
              setIsDeleteModalOpen(true);
            }}
          >
            <FiTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
  

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="grid grid-cols-12 gap-4">
        <h1 className="col-span-12 md:col-span-9 text-lg font-semibold">Proveedores</h1>
        <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-4">
          <TableSearch onSearch={handleSearch} />
          <FormModal table="provider" type="create" onUpdate={fetchProveedores} />
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={currentProveedores} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmar eliminación</h2>
            <p className="mb-6">
              ¿Estás seguro de que deseas eliminar el proveedor "{selectedProveedor?.razonSocial}"?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={handleDeleteProveedor}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvidersPage;
