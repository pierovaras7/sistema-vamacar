"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getProducts, deleteProduct } from "@/services/productoService";
import Image from "next/image";
import { toast } from 'react-toastify';

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
  estado: boolean;
};

const columns = [
  { header: "ID", accessor: "idProducto", width: "w-1/12" },
  { header: "Descripción", accessor: "descripcion", width: "w-2/12" },
  { header: "Código", accessor: "codigo", width: "w-1/12" },
  { header: "Unidad", accessor: "uni_medida", width: "w-1/12" },
  { header: "Precio Costo", accessor: "precioCosto", width: "w-1/12" },
  { header: "Precio Min", accessor: "precioMinVenta", width: "w-1/12" },
  { header: "Precio Max", accessor: "precioMaxVenta", width: "w-1/12" },
  { header: "Precio Mayor", accessor: "precioXMayor", width: "w-1/12" },
  { header: "Acciones", accessor: "action", width: "w-2/12" },
];

const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      const activeProducts = response.filter((product: Product) => product.estado);     
      setProducts(activeProducts);
    } catch (error: any) {
      console.error("Error al cargar productos:", error.message);
    } 
  };


  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredProducts = products.filter((product) =>
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * perPage;
  const indexOfFirstProduct = indexOfLastProduct - perPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / perPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.idProducto);
      setIsDeleteModalOpen(false);
      fetchProducts();
      toast.success("Producto eliminado exitosamente");
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
          <FormModal
            table="product"
            type="update"
            data={item}
            id={item.idProducto}
            onUpdate={fetchProducts}
          />
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300"
            onClick={() => {
              setSelectedProduct(item);
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
        <h1 className="hidden md:block text-lg font-semibold">Productos</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <FormModal
            table="product"
            type="create"
            onUpdate={fetchProducts}
          />
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4">Cargando...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={currentProducts} />
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmar eliminación</h2>
            <p className="mb-6">
              ¿Estás seguro de que deseas eliminar el producto "
              {selectedProduct.descripcion}"?
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
