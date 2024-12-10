"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createSubcategory, updateSubcategory } from "@/services/subcategoriaService";
import { useState } from "react";

const schema = z.object({
  subcategoria: z.string().min(1, { message: "La subcategoría es obligatoria." }),
});

type Inputs = z.infer<typeof schema>;

const SubcategoryForm = ({
  type,
  data,
  idCategoria,
  onSuccess,
}: {
  type: "create" | "update";
  data?: any;
  idCategoria?: number;
  onSuccess?: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      subcategoria: data?.subcategoria || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      if (type === "create") {
        if (!idCategoria) throw new Error("El ID de la categoría es requerido.");
        await createSubcategory({ ...formData, idCategoria });
      } else if (type === "update" && data?.idSubcategoria) {
        await updateSubcategory(data.idSubcategoria, {
          ...formData,
          idCategoria: data.idCategoria,
        });
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
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Crear Subcategoría" : "Actualizar Subcategoría"}
      </h1>

      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subcategoría"
          name="subcategoria"
          register={register}
          error={errors.subcategoria}
        />
      </div>

      <button
        className="bg-blue-400 text-white p-2 rounded-md"
        disabled={loading}
      >
        {loading ? "Cargando..." : type === "create" ? "Crear" : "Actualizar"}
      </button>
    </form>
  );
};

export default SubcategoryForm;
