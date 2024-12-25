"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getBrands, deleteBrand } from "@/services/marcaService";
import Image from "next/image";
import { toast } from 'react-toastify';

type Brand = {
  idMarca: number;
  marca: string;
  estado: boolean;
};

const columns = [
  { header: "ID", accessor: "idMarca", width: "w-1/12" },
  { header: "Marca", accessor: "marca", width: "w-8/12" },
  { header: "Acciones", accessor: "actions", width: "w-3/12" },
];

const BrandListPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchBrands = async () => {
    try {
      const response= await getBrands();
      const activeBrands = response.filter((brand: Brand) => brand.estado);     
      setBrands(activeBrands);
    } catch (error: any) {
      console.error("Error al cargar marcas:", error.message);
    } 
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBrand = currentPage * perPage;
  const indexOfFirstBrand = indexOfLastBrand - perPage;
  const currentBrands = filteredBrands.slice(indexOfFirstBrand, indexOfLastBrand);

  const totalPages = Math.ceil(filteredBrands.length / perPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    try {
      await deleteBrand(selectedBrand.idMarca);
      setIsDeleteModalOpen(false);
      fetchBrands();
      toast.success("Marca eliminada exitosamente");
    } catch (error: any) {
      console.error("Error al eliminar marca:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const renderRow = (item: Brand) => (
    <tr key={item.idMarca} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-gray-100">
      <td className="p-4">{item.idMarca}</td>
      <td>{item.marca}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormModal
            table="brand"
            type="update"
            data={item}
            id={item.idMarca}
            onUpdate={fetchBrands}
          />
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300"
            onClick={() => {
              setSelectedBrand(item);
              setIsDeleteModalOpen(true);
            }}
          >
            <Image src="/delete.png" alt="Eliminar" width={16} height={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Marcas</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <FormModal
            table="brand"
            type="create"
            onUpdate={fetchBrands}
          />
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4">Cargando...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={currentBrands} />
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {/* Modal de Confirmación para Eliminar */}
      {isDeleteModalOpen && selectedBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmar eliminación</h2>
            <p className="mb-6">
              ¿Estás seguro de que deseas eliminar la marca "{selectedBrand.marca}"?
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
                onClick={handleDeleteBrand}
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

export default BrandListPage;
