"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getCategories, deleteCategory } from "@/services/categoriaService";
import { FiTrash, FiEye } from "react-icons/fi";
import SubcategoriesModal from "./subcategorias/page";
import Image from "next/image";
import { toast } from 'sonner';
import PrivateRoute from "@/components/PrivateRouter";

type Category = {
  idCategoria: number;
  categoria: string;
  estado: boolean;
};

const columns = [
  { header: "ID", accessor: "idCategoria", className: "hidden text-center md:table-cell pl-4", width: "w-2/12" },
  { header: "Categoría", accessor: "categoria", width: "w-4/12" },
  { header: "Subcategorías", accessor: "subcategories", width: "w-3/12" },
  { header: "Acciones", accessor: "actions", width: "w-3/12" },
];

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSubcategoriesModal, setShowSubcategoriesModal] = useState<{
    idCategoria: number | null;
    isOpen: boolean;
  }>({ idCategoria: null, isOpen: false });

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      const activeCategories = response.filter((category: Category) => category.estado);
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  // Search function
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredCategories = categories.filter((category) =>
    category.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastCategory = currentPage * perPage;
  const indexOfFirstCategory = indexOfLastCategory - perPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  const totalPages = Math.ceil(filteredCategories.length / perPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Delete category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory.idCategoria);
      setIsDeleteModalOpen(false);
      toast.success("Categoria eliminada exitosamente");
      fetchCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Render rows in the table
  const renderRow = (item: Category) => (
    <tr
      key={item.idCategoria}
      className="border-b border-gray-200 even:bg-slate-50 text-xs md:text-sm hover:bg-lamaPurpleLight"
    >
      <td className="hidden text-center md:table-cell p-4">{item.idCategoria}</td>
      <td className="">{item.categoria}</td>
      <td>
        <div className="items-center flex gap-2 justify-center">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => setShowSubcategoriesModal({ idCategoria: item.idCategoria, isOpen: true })}
          >
            <FiEye size={20} />
          </button>
          <FormModal
            table="subcategory"
            type="create"
            data={{ idCategoria: item.idCategoria }}
            onUpdate={fetchCategories}
          />
        </div>
      </td>
      <td>
        <div className="flex gap-2 justify-center">
          <FormModal
            table="category"
            type="update"
            data={item}
            id={item.idCategoria}
            onUpdate={fetchCategories}
          />
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500"
            onClick={() => {
              setSelectedCategory(item);
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
    <PrivateRoute slug="/categorias">
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <h1 className="text-lg font-semibold w-full justify-start m-2">Categorias</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <TableSearch onSearch={handleSearch} />
            <FormModal table="category" type="create" onUpdate={fetchCategories} />
          </div>
        </div>
        <Table columns={columns} renderRow={renderRow} data={currentCategories} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md shadow-lg mx-4">
              <h2 className="text-lg font-semibold mb-4">Confirmar eliminación</h2>
              <p className="mb-6">
                ¿Estás seguro de que deseas eliminar la categoría "{selectedCategory?.categoria}"?
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
                  onClick={handleDeleteCategory}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
        {showSubcategoriesModal.isOpen && (
          <SubcategoriesModal
            idCategoria={showSubcategoriesModal.idCategoria!}
            onClose={() => setShowSubcategoriesModal({ idCategoria: null, isOpen: false })}
          />
        )}
      </div>
    </PrivateRoute>
  );
};

export default CategoriesPage;
