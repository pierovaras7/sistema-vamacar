"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField"; // Asumo que este componente ya existe.
import { createCategory, updateCategory } from "@/services/categoriaService";
import { useState } from "react";
import { toast } from 'sonner';

const schema = z.object({
  categoria: z.string().min(1, { message: "La categoría es obligatoria." }),
});

type Inputs = z.infer<typeof schema>;

const CategoryForm = ({
  type,
  data,
  id,
  onSuccess,
}: {
  type: "create" | "update";
  data?: any;
  id?: number;
  onSuccess?: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoria: data?.categoria || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      if (type === "create") {
        await createCategory(formData);
        toast.success("Categoria creada  exitosamente");

      } else if (type === "update" && data?.idCategoria) {
        await updateCategory(data.idCategoria, formData);
        toast.success("Categoria actualizada  exitosamente");

      }
      setErrorMessage("");
      onSuccess?.();
    } catch (error: any) {
      setErrorMessage(
        error.message || "Hubo un error al procesar la operación."
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Crear una nueva categoría" : "Actualizar categoría"}
      </h1>

      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Categoría"
          name="categoria"
          register={register}
          error={errors.categoria}
        />
      </div>

      <button
        className="bg-blue-800 hover:bg-blue-600 text-white p-2 rounded-md"
        disabled={loading}
      >
        {loading ? "Cargando..." : type === "create" ? "Crear" : "Actualizar"}
      </button>
    </form>
  );
};

export default CategoryForm;
