"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "@/components/InputField";
import { createProveedor, updateProveedor } from "@/services/proveedorService";
import { useState } from "react";
import { toast } from "react-toastify";
import { showErrorsToast } from "@/lib/functions";

const schema = z.object({
  ruc: z.string().min(11, "El RUC debe tener al menos 11 caracteres."),
  razonSocial: z.string().min(1, "La razón social es obligatoria."),
  telefono: z.string().min(1, "El teléfono es obligatorio."),
  correo: z.string().email("Debe ser un correo válido."),
  direccion: z.string().min(1, "La dirección es obligatoria."),
  nombreRepresentante: z.string().min(1, "El nombre del representante es obligatorio."),
});

type Inputs = z.infer<typeof schema>;

const ProviderForm = ({
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
      ruc: data?.ruc || "",
      razonSocial: data?.razonSocial || "",
      telefono: data?.telefono || "",
      correo: data?.correo || "",
      direccion: data?.direccion || "",
      nombreRepresentante: data?.nombreRepresentante || "",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);

    try {
      const proveedorData = {
        ruc: formData.ruc,
        razonSocial: formData.razonSocial,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion,
        nombreRepresentante: formData.nombreRepresentante,
      };

      if (type === "update" && id) {
        await updateProveedor(id, proveedorData);
        toast.success("Proveedor actualizado exitosamente.");
      } else {
        await createProveedor(proveedorData);
        toast.success("Proveedor creado exitosamente.");
      }

      onSuccess?.();
    } catch (error: any) {
      showErrorsToast(error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      {/* Todos los inputs en un solo contenedor */}
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Crear Proveedor" : "Actualizar Proveedor"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="RUC" 
          name="ruc" 
          register={register} 
          error={errors.ruc} 
          className="md:col-span-3"
        />
        <InputField 
          label="Razón Social" 
          name="razonSocial" 
          register={register} 
          error={errors.razonSocial} 
          className="md:col-span-3"
        />
        <InputField 
          label="Teléfono" 
          name="telefono" 
          register={register} 
          error={errors.telefono} 
          className="md:col-span-3"
        />
        <InputField 
          label="Correo" 
          name="correo" 
          register={register} 
          error={errors.correo} 
          className="md:col-span-3"
        />
        <InputField 
          label="Dirección" 
          name="direccion" 
          register={register} 
          error={errors.direccion} 
          className="md:col-span-3"
        />
        <InputField 
          label="Nombre del representante" 
          name="nombreRepresentante" 
          register={register} 
          error={errors.nombreRepresentante} 
          className="md:col-span-3"
        />
      </div>
  
      {/* Botón de acción */}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        disabled={loading}
      >
        {loading ? "Cargando..." : type === "create" ? "Crear" : "Actualizar"}
      </button>
    </form>
  );
  
};

export default ProviderForm;
