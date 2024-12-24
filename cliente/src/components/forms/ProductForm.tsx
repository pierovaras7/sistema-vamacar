"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import InputField from "../InputField";
import { createProduct, updateProduct } from "@/services/productoService";
import { getBrands } from "@/services/marcaService";
import { getSubcategories } from "@/services/subcategoriaService";

const schema = z.object({
  descripcion: z.string().min(1, { message: "La descripción es obligatoria." }),
  codigo: z.string().min(1, { message: "El código es obligatorio." }),
  uni_medida: z.string().min(1, { message: "La unidad de medida es obligatoria." }),
  precioCosto: z.preprocess(
    (value) => (typeof value === "string" ? parseFloat(value) : value),
    z.number().positive({ message: "El precio debe ser positivo." })
  ),
  precioMinVenta: z.preprocess(
    (value) => (typeof value === "string" ? parseFloat(value) : value),
    z.number().positive({ message: "El precio debe ser positivo." })
  ),
  precioMaxVenta: z.preprocess(
    (value) => (typeof value === "string" ? parseFloat(value) : value),
    z.number().positive({ message: "El precio debe ser positivo." })
  ),
  precioXMayor: z.preprocess(
    (value) => (typeof value === "string" ? parseFloat(value) : value),
    z.number().positive({ message: "El precio debe ser positivo." })
  ),
  idSubcategoria: z.number().positive({ message: "Seleccione una subcategoría válida." }),
  idMarca: z.number().positive({ message: "Seleccione una marca válida." }),
});

type Inputs = z.infer<typeof schema>;

const ProductForm = ({
  type,
  data,
  id,
  onSuccess,
}: {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
  id?: number;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      descripcion: data?.descripcion || "",
      codigo: data?.codigo || "",
      uni_medida: data?.uni_medida || "",
      precioCosto: data?.precioCosto || 0,
      precioMinVenta: data?.precioMinVenta || 0,
      precioMaxVenta: data?.precioMaxVenta || 0,
      precioXMayor: data?.precioXMayor || 0,
      idSubcategoria: data?.idSubcategoria || 0,
      idMarca: data?.idMarca || 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"subcategory" | "brand">("subcategory");
  const [modalData, setModalData] = useState<any[]>([]); // Arreglo genérico para manejar ambos tipos de datos
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState("");
  const [selectedBrandName, setSelectedBrandName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsData, subcategoriesData] = await Promise.all([getBrands(), getSubcategories()]);
        setBrands(brandsData);
        setSubcategories(subcategoriesData);
      } catch (error) {
        toast.error("Hubo un error al cargar datos.");
      }
    };
    fetchData();
  }, []);

  const openModal = (type: "subcategory" | "brand") => {
    setModalType(type);
    setModalData(type === "subcategory" ? subcategories : brands);
    setIsModalOpen(true);
    
  };

  const selectModalItem = (item: any) => {
    if (modalType === "subcategory") {
      setSelectedSubcategoryName(item.subcategoria);
      setValue("idSubcategoria", item.idSubcategoria);
    } else if (modalType === "brand") {
      setSelectedBrandName(item.marca);
      setValue("idMarca", item.idMarca);
    }
    setIsModalOpen(false);
  };

  const filteredData = modalData.filter((item) =>
    modalType === "subcategory"
      ? item.subcategoria?.toLowerCase().includes(searchTerm.toLowerCase())
      : item.marca?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reiniciar la página cuando se filtran los datos
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

// Obtener datos paginados del filtro
const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage * ITEMS_PER_PAGE < filteredData.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      if (type === "create") {
        await createProduct(formData);
        toast.success("Producto creado exitosamente");
      } else if (type === "update" && data?.idProducto) {
        await updateProduct(data.idProducto, formData);
        toast.success("Producto actualizado exitosamente");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Hubo un error al procesar la operación.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-8 p-6 bg-white shadow-md rounded-lg" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-gray-800">
        {type === "create" ? "Crear Producto" : "Actualizar Producto"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField label="Descripción" name="descripcion" register={register} error={errors.descripcion} />
        <InputField label="Código" name="codigo" register={register} error={errors.codigo} />
        <InputField label="Unidad de Medida" name="uni_medida" register={register} error={errors.uni_medida} />
        <InputField label="Precio de Costo" name="precioCosto" type="number" register={register} error={errors.precioCosto} />
        <InputField label="Precio Mínimo de Venta" name="precioMinVenta" type="number" register={register} error={errors.precioMinVenta} />
        <InputField label="Precio Máximo de Venta" name="precioMaxVenta" type="number" register={register} error={errors.precioMaxVenta} />
        <InputField label="Precio por Mayor" name="precioXMayor" type="number" register={register} error={errors.precioXMayor} />

        <div className="mb-4">
  <label htmlFor="idSubcategoria" className="block text-sm font-medium text-gray-700 mb-2">
    Subcategoría
  </label>
  <div className="flex">
    <input
      type="text"
      value={selectedSubcategoryName}
      readOnly
      className="w-full h-12 p-2 border rounded-l-md" 
    />
    <button
      type="button"
      onClick={() => openModal("subcategory")}
      className="h-12 p-2 bg-blue-500 text-white rounded-r-md" 
    >
      Elegir
    </button>
  </div>
  {errors.idSubcategoria && <p className="text-xs text-red-500">{errors.idSubcategoria.message}</p>}
</div>

<div className="mb-4">
  <label htmlFor="idMarca" className="block text-sm font-medium text-gray-700 mb-2">
    Marca
  </label>
  <div className="flex">
    <input
      type="text"
      value={selectedBrandName}
      readOnly
      className="w-full h-12 p-2 border rounded-l-md" 
    />
    <button
      type="button"
      onClick={() => openModal("brand")}
      className="h-12 p-2 bg-blue-500 text-white rounded-r-md"
    >
      Elegir
    </button>
  </div>
  {errors.idMarca && <p className="text-xs text-red-500">{errors.idMarca.message}</p>}
</div>


      </div>

      <button className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700" disabled={loading}>
        {loading ? "Cargando..." : type === "create" ? "Crear" : "Actualizar"}
      </button>

      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl">
      {/* Botón de cierre */}
      <button
        onClick={() => {
          setIsModalOpen(false);
          setSearchTerm(""); // Limpiar búsqueda
          setCurrentPage(1); // Reiniciar paginación
        }}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        title="Cerrar"
      >
        ✖
      </button>

      <h2 className="text-lg font-bold mb-4 text-center">
        {modalType === "subcategory" ? "Seleccionar Subcategoría" : "Seleccionar Marca"}
      </h2>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={`Buscar ${modalType === "subcategory" ? "subcategoría" : "marca"}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1 w-20">ID</th>
              <th className="border border-gray-300 px-2 py-1">Nombre</th>
              <th className="border border-gray-300 px-2 py-1 w-20">Acción</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-2 py-1 text-center">
                    {modalType === "subcategory" ? item.idSubcategoria : item.idMarca}
                  </td>
                  <td className="px-2 py-1">
                    {modalType === "subcategory" ? item.subcategoria : item.marca}
                  </td>
                  <td className="px-2 py-1 text-center">
                    <button
                      onClick={() => {
                        selectModalItem(item);
                        setSearchTerm(""); // Limpiar búsqueda
                        setCurrentPage(1); // Reiniciar paginación
                        setIsModalOpen(false); // Cerrar modal
                      }}
                      className="text-blue-500 hover:text-blue-700"
                      title="Seleccionar"
                    >
                      ✅
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-2 text-gray-500">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

{/* Paginación */}
<div className="flex justify-between items-center mt-4">
  <button
    type="button" // Evitar que active el formulario
    disabled={currentPage === 1}
    onClick={handlePreviousPage}
    className={`px-3 py-1 rounded-md ${
      currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-700"
    }`}
  >
    Anterior
  </button>
  <span>Página {currentPage}</span>
  <button
    type="button" // Evitar que active el formulario
    disabled={currentPage * ITEMS_PER_PAGE >= filteredData.length}
    onClick={handleNextPage}
    className={`px-3 py-1 rounded-md ${
      currentPage * ITEMS_PER_PAGE >= filteredData.length
        ? "bg-gray-300"
        : "bg-blue-500 text-white hover:bg-blue-700"
    }`}
  >
    Siguiente
  </button>
</div>

 
    </div>
  </div>
)}

    </form>
  );
};

export default ProductForm;