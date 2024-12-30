"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { saveRepresentante, updateRepresentante } from "@/services/representantesService";
import { toast } from "sonner";
import { useEffect } from "react";

// 🛡️ Esquema de validación con Zod
const schema = z.object({
  idRepresentante: z.string().optional(),
  nombres: z.string().min(1, { message: "Nombres son requeridos" }),
  apellidos: z.string().min(1, { message: "Apellidos son requeridos" }),
  dni: z
    .string()
    .length(8, { message: "El DNI debe tener exactamente 8 caracteres." })
    .regex(/^\d+$/, { message: "El DNI debe contener solo números." }),
  telefono: z
    .string()
    .length(9, { message: "El teléfono debe tener exactamente 9 caracteres." })
    .regex(/^\d+$/, { message: "El teléfono debe contener solo números." }),
  cargo: z.string().min(1, { message: "Cargo es requerido" }),
  estado: z.boolean().default(true),
});

type Inputs = z.infer<typeof schema>;

const RepresentanteForm = ({
  type,
  data,
  id,
  closeModal,
}: {
  type: "create" | "update";
  data?: Inputs;
  id?: number;
  closeModal: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      dni: '',
      telefono: '',
      cargo: '',
      estado: true,
    },
  });

  // Usar useEffect para actualizar los valores cuando `data` cambie
  useEffect(() => {
    if (type === "update" && data) {
      setValue("nombres", data.nombres);
      setValue("apellidos", data.apellidos);
      setValue("dni", data.dni);
      setValue("telefono", data.telefono);
      setValue("cargo", data.cargo);
      setValue("estado", data.estado ?? true);
    }
  }, [type, data, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.log("📝 [Formulario] Datos capturados:", formData);

      const representante = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        telefono: formData.telefono,
        cargo: formData.cargo,
        estado: formData.estado ?? true,
      };

      if (type === "create") {
        console.log("📦 [Formulario] Creando representante...");
        await saveRepresentante(representante);
        toast.success("Representante creado exitosamente");
      } else if (type === "update" && id) {
        console.log("🔄 [Formulario] Actualizando representante con ID:", id);
        await updateRepresentante(id, representante);
        toast.success("Representante actualizado exitosamente");
      } else {
        throw new Error("ID no proporcionado para la actualización");
      }

      closeModal();
    } catch (error: any) {
      console.error("❌ [Formulario] Error:", error.message || error);
      toast.error(error.message || "Error desconocido");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Crear Representante" : "Actualizar Representante"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Nombres" name="nombres" register={register} error={errors?.nombres} />
        <InputField label="Apellidos" name="apellidos" register={register} error={errors?.apellidos} />
        <InputField label="DNI" name="dni" register={register} error={errors?.dni} />
        <InputField label="Teléfono" name="telefono" register={register} error={errors?.telefono} />
        <InputField label="Cargo" name="cargo" register={register} error={errors?.cargo} />
      </div>

      <button className="bg-blue-700 text-white p-2 rounded-md">
        {type === "create" ? "Crear" : "Actualizar"}
      </button>
    </form>
  );
};

export default RepresentanteForm;
