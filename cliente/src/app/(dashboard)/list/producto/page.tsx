"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination"; // Si usas paginación
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { FiTrash } from "react-icons/fi";
import { getProducts, deleteProduct } from "@/services/productoService";

type Product = {
  idProducto: number;
  descripcion: string;
  codigo: string;
  uni_medida: string;
  precioCosto: number;
  precioMinVenta: number;
  precioMaxVenta: number;
  precioXMayor: number;
  idSubcategoria: number;
  idMarca: number;
};

const columns = [
  { header: "ID", accessor: "idProducto" },
  { header: "Descripción", accessor: "descripcion" },
  { header: "Código", accessor: "codigo" },
  { header: "Unidad", accessor: "uni_medida" },
  { header: "Precio Costo", accessor: "precioCosto" },
  { header: "Precio Min", accessor: "precioMinVenta" },
  { header: "Precio Max", accessor: "precioMaxVenta" },
  { header: "Precio Mayor", accessor: "precioXMayor" },
  { header: "Acciones", accessor: "action" },
];

const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error: any) {
      console.error("Error al cargar productos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = products.filter((product) =>
      product.descripcion.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      await deleteProduct(selectedProduct.idProducto);
      setSelectedProduct(null);
      setIsDeleteModalOpen(false);
      await fetchProducts();
    } catch (error: any) {
      console.error("Error al eliminar producto:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderRow = (item: Product) => (
    <tr
      key={item.idProducto}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-gray-100"
    >
      <td className="p-4">{item.idProducto}</td>
      <td>{item.descripcion}</td>
      <td>{item.codigo}</td>
      <td>{item.uni_medida}</td>
      <td>{Number(item.precioCosto)?.toFixed(2) || "N/A"}</td>
      <td>{Number(item.precioMinVenta)?.toFixed(2) || "N/A"}</td>
      <td>{Number(item.precioMaxVenta)?.toFixed(2) || "N/A"}</td>
      <td>{Number(item.precioXMayor)?.toFixed(2) || "N/A"}</td>
      <td>
        <div className="flex gap-2">
          <FormModal table="product" type="update" data={item} onRefresh={fetchProducts} />
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              setSelectedProduct(item);
              setIsDeleteModalOpen(true);
            }}
          >
            <FiTrash size={20} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Todos los Productos</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end">
            <FormModal table="product" type="create" onRefresh={fetchProducts} />
          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-4">Cargando...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={filteredProducts} />
      )}

      {/* Paginación */}
      <Pagination />

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmar eliminación</h2>
            <p className="mb-6">
              ¿Estás seguro de que deseas eliminar el producto "
              {selectedProduct?.descripcion}"?
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
                onClick={handleDeleteProduct}
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

export default ProductListPage;
