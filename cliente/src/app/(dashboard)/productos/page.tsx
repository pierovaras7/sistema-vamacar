"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getProducts, deleteProduct } from "@/services/productoService";
import Image from "next/image";
import { toast } from 'sonner';
import { Producto } from "@/types";
import PrivateRoute from "@/components/PrivateRouter";


const columns = [
  { header: "ID", accessor: "idProducto", width: "w-1/12", className: "text-center" },
  { header: "Descripción", accessor: "descripcion", width: "w-2/12", className: "text-center" },
  { header: "Código", accessor: "codigo", width: "w-1/12", className: "text-center hidden lg:table-cell" },
  { header: "Unidad", accessor: "uni_medida", width: "w-1/12", className: "text-center hidden xl:table-cell" },
  { header: "Precio Costo", accessor: "precioCosto", width: "w-1/12", className: "text-center hidden xl:table-cell" },
  { header: "Precio Min", accessor: "precioMinVenta", width: "w-1/12", className: "text-center hidden 2xl:table-cell" },
  { header: "Precio Max", accessor: "precioMaxVenta", width: "w-1/12", className: "text-center hidden 2xl:table-cell" },
  { header: "Precio Mayor", accessor: "precioXMayor", width: "w-1/12", className: "text-center hidden 2xl:table-cell" },
  { header: "Acciones", accessor: "action", width: "w-2/12", className: "text-center" },
];



const ProductListPage = () => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      const activeProducts = response.filter((product: Producto) => product.estado);     
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

  const renderRow = (item: Producto) => (
    <tr
      key={item.idProducto}
      className="border-b border-gray-200 even:bg-slate-50 text-xs md:text-sm hover:bg-gray-100"
    >
      <td className="p-4 text-center">{item.idProducto}</td>
      <td className="text-center">{item.descripcion}</td>
      <td className="text-center hidden lg:table-cell">{item.codigo}</td>
      <td className="text-center hidden xl:table-cell">{item.uni_medida}</td>
      <td className="text-center hidden xl:table-cell">
        {Number(item.precioCosto)?.toFixed(2) || "N/A"}
      </td>
      <td className="text-center hidden 2xl:table-cell">
        {Number(item.precioMinVenta)?.toFixed(2) || "N/A"}
      </td>
      <td className="text-center hidden 2xl:table-cell">
        {Number(item.precioMaxVenta)?.toFixed(2) || "N/A"}
      </td>
      <td className="text-center hidden 2xl:table-cell">
        {Number(item.precioXMayor)?.toFixed(2) || "N/A"}
      </td>
      <td className="text-center">
        <div className="flex gap-2 justify-center">
          <FormModal
            table="product"
            type="update"
            data={item}
            id={item.idProducto}
            onUpdate={fetchProducts}
          />
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500"
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
    <PrivateRoute slug="/productos">
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-col  md:flex-row items-center justify-between">
          <h1 className="text-lg font-semibold w-full justify-start m-2">Productos</h1>
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
    </PrivateRoute>

  );
};

export default ProductListPage;
