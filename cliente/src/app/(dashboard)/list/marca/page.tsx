"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getBrands, deleteBrand } from "@/services/marcaService";
import { FiTrash } from "react-icons/fi";

type Brand = {
  idMarca: number;
  marca: string;
  estado: boolean;
};

const columns = [
  { header: "ID", accessor: "idMarca" },
  { header: "Brand Name", accessor: "marca" },
  { header: "Actions", accessor: "actions" },
];

const BrandListPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await getBrands();
      const activeBrands = data.filter((brand: Brand) => brand.estado);
      setBrands(activeBrands);
      setFilteredBrands(activeBrands);
    } catch (error: any) {
      console.error("Error al cargar marcas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = brands.filter((brand) =>
      brand.marca.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredBrands(filtered);
  };

  const handleDeleteBrand = async (idMarca: number) => {
    try {
      setLoading(true);
      await deleteBrand(idMarca);
      await fetchBrands();
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
          <FormModal table="brand" type="update" data={item} onRefresh={fetchBrands} />
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDeleteBrand(item.idMarca)}
          >
            <FiTrash size={20} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Brands</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end">
            <FormModal table="brand" type="create" onRefresh={fetchBrands} />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={filteredBrands} />
      )}
    </div>
  );
};

export default BrandListPage;
