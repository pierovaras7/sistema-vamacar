"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createProduct, updateProduct } from "@/services/productoService";
import { getBrands } from "@/services/marcaService"; 
import { getSubcategories } from "@/services/subcategoriaService"; 
import { useEffect, useState } from "react";

const schema = z.object({
  descripcion: z.string().min(1, { message: "La descripción es obligatoria." }),
  codigo: z.string().min(1, { message: "El código es obligatorio." }),
  uni_medida: z.string().min(1, { message: "La unidad de medida es obligatoria." }),
  precioCosto: z.preprocess((value) => parseFloat(value as string), z.number().positive({ message: "El precio debe ser positivo." })),
  precioMinVenta: z.preprocess((value) => parseFloat(value as string), z.number().positive({ message: "El precio debe ser positivo." })),
  precioMaxVenta: z.preprocess((value) => parseFloat(value as string), z.number().positive({ message: "El precio debe ser positivo." })),
  precioXMayor: z.preprocess((value) => parseFloat(value as string), z.number().positive({ message: "El precio debe ser positivo." })),
  idSubcategoria: z.preprocess((value) => parseInt(value as string, 10), z.number().int().positive({ message: "Seleccione una subcategoría válida." })),
  idMarca: z.preprocess((value) => parseInt(value as string, 10), z.number().int().positive({ message: "Seleccione una marca válida." })),
});

type Inputs = z.infer<typeof schema>;

const ProductForm = ({
  type,
  data,
  onSuccess,
}: {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
}) => {
  const {
    register,
    handleSubmit,
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
  const [errorMessage, setErrorMessage] = useState("");
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsData, subcategoriesData] = await Promise.all([getBrands(), getSubcategories()]);
        setBrands(brandsData);
        setSubcategories(subcategoriesData);
      } catch (error: any) {
        setErrorMessage(error.message || "Hubo un error al cargar datos.");
      }
    };
    fetchData();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      if (type === "create") {
        await createProduct(formData);
      } else if (type === "update" && data?.idProducto) {
        await updateProduct(data.idProducto, formData);
      }
      setErrorMessage("");
      onSuccess?.();
    } catch (error: any) {
      setErrorMessage(error.message || "Hubo un error al procesar la operación.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-8 p-6 bg-white shadow-md rounded-lg" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-gray-800">
        {type === "create" ? "Crear Producto" : "Actualizar Producto"}
      </h1>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField
          label="Descripción"
          name="descripcion"
          register={register}
          error={errors.descripcion}
          className="max-w-2xl" // Opcional, ajusta el ancho máximo para columnas específicas
          />
        <InputField
          label="Código"
          name="codigo"
          register={register}
          error={errors.codigo}
          className="max-w-2xl" // Opcional, ajusta el ancho máximo para columnas específicas
          />
        <InputField
          label="Unidad de Medida"
          name="uni_medida"
          register={register}
          error={errors.uni_medida}
          className="max-w-2xl" // Opcional, ajusta el ancho máximo para columnas específicas
          />
        <InputField
          label="Precio de Costo"
          name="precioCosto"
          type="number"
          register={register}
          error={errors.precioCosto}
          inputProps={{ step: "0.1" }}
          className="max-w-2xl" // Opcional, ajusta el ancho máximo para columnas específicas
          />
        <InputField
          label="Precio Mínimo de Venta"
          name="precioMinVenta"
          type="number"
          register={register}
          error={errors.precioMinVenta}
          inputProps={{ step: "0.1" }}
          className="max-w-2xl" // Opcional, ajusta el ancho máximo para columnas específicas
          />
        <InputField
          label="Precio Máximo de Venta"
          name="precioMaxVenta"
          type="number"
          register={register}
          error={errors.precioMaxVenta}
          inputProps={{ step: "0.1" }}
          className="max-w-2xl" // Opcional, ajusta el ancho máximo para columnas específicas
          />
        <InputField
          label="Precio por Mayor"
          name="precioXMayor"
          type="number"
          register={register}
          error={errors.precioXMayor}
          inputProps={{ step: "0.1" }}
          className="max-w-2xl" // Opcional, ajusta el ancho máximo para columnas específicas
          />
<div>
  <label htmlFor="idSubcategoria" className="block text-sm font-medium text-gray-700">
    Subcategoría
  </label>
  <select
    id="idSubcategoria"
    {...register("idSubcategoria", {
      setValueAs: (value) => (value === "" ? undefined : Number(value)), // Convierte a número
    })}
    className="w-full p-2 border rounded-md"
  >
    <option value="">Seleccione una subcategoría</option>
    {subcategories.map((subcategory: any) => (
      <option key={subcategory.idSubcategoria} value={subcategory.idSubcategoria}>
        {subcategory.subcategoria}
      </option>
    ))}
  </select>
  {errors.idSubcategoria && <p className="text-xs text-red-500">{errors.idSubcategoria.message}</p>}
</div>

<div>
  <label htmlFor="idMarca" className="block text-sm font-medium text-gray-700">
    Marca
  </label>
  <select
    id="idMarca"
    {...register("idMarca", {
      setValueAs: (value) => (value === "" ? undefined : Number(value)), // Convierte a número
    })}
    className="w-full p-2 border rounded-md"
  >
    <option value="">Seleccione una marca</option>
    {brands.map((brand: any) => (
      <option key={brand.idMarca} value={brand.idMarca}>
        {brand.marca}
      </option>
    ))}
  </select>
  {errors.idMarca && <p className="text-xs text-red-500">{errors.idMarca.message}</p>}
</div>
      </div>

      <button
        className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Cargando..." : type === "create" ? "Crear" : "Actualizar"}
      </button>
    </form>
  );
};

export default ProductForm;
