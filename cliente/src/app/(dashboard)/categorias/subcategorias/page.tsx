"use client";

import { useEffect, useState } from "react";
import Table from "@/components/Table";
import {
  getSubcategoriesByCategory,
  deleteSubcategory,
  updateSubcategory,
} from "@/services/subcategoriaService";
import { FiEdit, FiTrash } from "react-icons/fi";
import { toast } from 'sonner';
import Image from "next/image";

type Subcategory = {
  idSubcategoria: number;
  subcategoria: string;
  idCategoria: number;
};

const ITEMS_PER_PAGE = 5; // Cantidad de elementos por página

const SubcategoriesModal = ({
  idCategoria,
  onClose,
}: {
  idCategoria: number;
  onClose: () => void;
}) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({ subcategoria: "" });
  const [formError, setFormError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const data = await getSubcategoriesByCategory(idCategoria);
      setSubcategories(data);
      setFilteredSubcategories(data); // Inicializamos con todos los datos
    } catch (error) {
      console.error("Error al cargar subcategorías:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, [idCategoria]);

  // Filtrar subcategorías por búsqueda
  useEffect(() => {
    const filtered = subcategories.filter((sub) =>
      sub.subcategoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubcategories(filtered);
    setCurrentPage(1); // Reiniciar a la primera página al buscar
  }, [searchTerm, subcategories]);

  const handleDelete = async () => {
    if (!selectedSubcategory) return;

    try {
      await deleteSubcategory(selectedSubcategory.idSubcategoria);
      setShowDeleteModal(false);
      setSelectedSubcategory(null);
      toast.success("Subcategoria eliminada exitosamente.");

      // Actualizamos el estado local
      setSubcategories((prev) =>
        prev.filter((sub) => sub.idSubcategoria !== selectedSubcategory.idSubcategoria)
      );
    } catch (error) {
      console.error("Error al eliminar subcategoría:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subcategoria.trim()) {
      setFormError("La subcategoría es obligatoria.");
      return;
    }

    try {
      if (selectedSubcategory) {
        await updateSubcategory(selectedSubcategory.idSubcategoria, {
          subcategoria: formData.subcategoria,
          idCategoria: selectedSubcategory.idCategoria,
        });
        setShowEditModal(false);
        await fetchSubcategories();
        toast.success("Subcategoria actualizada exitosamente.")
      }
    } catch (error) {
      console.error("Error al actualizar subcategoría:", error);
    }
  };

  // Lógica de paginación
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSubcategories = filteredSubcategories.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage * ITEMS_PER_PAGE < filteredSubcategories.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const columns = [
    { header: "ID",accessor: "idSubcategoria", className: "hidden text-center md:table-cell pl-4" },
    { header: "Subcategoria", accessor: "subcategoria", className: "text-center"},
    { header: "Acciones", accessor: "actions",  className: "text-center"},
  ];

  const renderRow = (item: Subcategory) => (
    <tr key={item.idSubcategoria} className="border-b border-gray-200 text-sm">
      <td className="hidden md:table-cell text-center p-4">{item.idSubcategoria}</td>
      <td  className= "p-2 text-center">{item.subcategoria}</td>
      <td>
        <div className="flex gap-2 justify-center">
          <button
            className="text-green-500 hover:text-green-700"
            onClick={() => {
              setSelectedSubcategory(item);
              setFormData({ subcategoria: item.subcategoria });
              setShowEditModal(true);
            }}
          >
            <FiEdit size={20} />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              setSelectedSubcategory(item);
              setShowDeleteModal(true);
            }}
          >
            <FiTrash size={20} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
        <h1 className="text-xl font-semibold mb-4">Subcategorías</h1>
        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar subcategorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md text-sm md:text-md"
          />
        </div>
        {/* Tabla */}
        {loading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : paginatedSubcategories.length === 0 ? (
          <div className="text-center py-4">Aún no hay subcategorías para esta categoría.</div>
        ) : (
          <Table columns={columns} data={paginatedSubcategories} renderRow={renderRow} />
        )}
        {/* Paginación */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={handlePreviousPage}
            className={`px-4 py-2 text-xs rounded-md ${currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-700"}`}
          >
            Anterior
          </button>
          <span className="text-xs">Página {currentPage}</span>
          <button
            disabled={currentPage * ITEMS_PER_PAGE >= filteredSubcategories.length}
            onClick={handleNextPage}
            className={`px-4 py-2 text-xs rounded-md ${
              currentPage * ITEMS_PER_PAGE >= filteredSubcategories.length
                ? "bg-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-700"
            }`}
          >
            Siguiente
          </button>
        </div>
        <div className="absolute top-4 right-4 cursor-pointer" onClick={onClose} 
          > 
          <Image src="/close.png" alt="Cerrar" width={14} height={14} /> 
        </div>
      </div>
      {showEditModal && selectedSubcategory && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-[90%] md:w-[50%] lg:w-[40%]">
            <h2 className="text-xl font-semibold mb-4">Editar Subcategoría</h2>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                Subcategoría
                <input
                  type="text"
                  className="p-2 border rounded-md"
                  value={formData.subcategoria}
                  onChange={(e) =>
                    setFormData({ subcategoria: e.target.value })
                  }
                />
                {formError && <span className="text-red-500 text-sm">{formError}</span>}
              </label>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-300 text-black px-4 py-2 rounded-md"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-800 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedSubcategory && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmar eliminación</h2>
            <p className="mb-6">
              ¿Estás seguro de que deseas eliminar la subcategoría "
              {selectedSubcategory.subcategoria}"?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={handleDelete}
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

export default SubcategoriesModal;
