"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { FiTrash } from "react-icons/fi";
import { getCategories, deleteCategory } from "@/services/categoriaService";
import { FiPlus, FiEye } from "react-icons/fi";
import SubcategoriesModal from "./subcategoria/page";
import { AiOutlinePlus } from "react-icons/ai";

type Category = {
  idCategoria: number;
  categoria: string;
  estado: boolean;
};

const columns = [
  { header: "ID", accessor: "idCategoria" },
  { header: "Category Name", accessor: "categoria" },
  { header: "Subcategories", accessor: "subcategories" },
  { header: "Actions", accessor: "action" },
];

const CategoryListPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showSubcategoriesModal, setShowSubcategoriesModal] = useState<{
    idCategoria: number | null;
    isOpen: boolean;
  }>({ idCategoria: null, isOpen: false });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      const activeCategories = data.filter((category: Category) => category.estado);
      setCategories(activeCategories);
      setFilteredCategories(activeCategories);
    } catch (error: any) {
      console.error("Error al cargar categorías:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = categories.filter((category) =>
      category.categoria.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      setLoading(true);
      await deleteCategory(selectedCategory.idCategoria);
      setSelectedCategory(null);
      setIsDeleteModalOpen(false);
      await fetchCategories();
    } catch (error: any) {
      console.error("Error al eliminar categoría:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderRow = (item: Category) => {
    return (
      <>
        <tr key={item.idCategoria} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
          <td className="p-4">{item.idCategoria}</td>
          <td>{item.categoria}</td>
          <td>
            <div className="flex items-center gap-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() =>
                  setShowSubcategoriesModal({ idCategoria: item.idCategoria, isOpen: true })
                }
              >
                <FiEye size={20} />
              </button>
              <FormModal
                table="subcategory"
                type="create"
                data={{ idCategoria: item.idCategoria }}
                onRefresh={fetchCategories}
              />
            </div>
          </td>
          <td>
            <div className="flex items-center gap-2">
              <FormModal table="category" type="update" data={item} onRefresh={fetchCategories} />
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setSelectedCategory(item);
                  setIsDeleteModalOpen(true);
                }}
              >
                <FiTrash size={20} />
              </button>
            </div>
          </td>
        </tr>
      </>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Categories</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end">
            <FormModal table="category" type="create" onRefresh={fetchCategories} />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={filteredCategories} />
      )}
      <Pagination />
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmar eliminación</h2>
            <p className="mb-6">
              ¿Estás seguro de que deseas eliminar la categoría "{selectedCategory?.categoria}"?
            </p>
            <div className="flex gap-4 justify-end">
              <button className="bg-gray-300 text-black px-4 py-2 rounded-md" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={handleDeleteCategory}>
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
  );
};

export default CategoryListPage;