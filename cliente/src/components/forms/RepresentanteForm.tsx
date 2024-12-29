"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { toast } from "sonner";
import { saveRepresentante, updateRepresentante } from "@/services/representantesService";

// Esquema de validación con Zod
const schema = z.object({
    idRepresentante: z.string().optional(),
    nombres: z.string().min(1, { message: "Nombres son requeridos" }),
    apellidos: z.string().min(1, { message: "Apellidos son requeridos" }),
    telefono: z.string().length(9, { message: "El teléfono debe tener exactamente 9 caracteres." }),
    estado: z.boolean().default(true),
    dni: z.string().min(1, { message: "DNI es requerido" }), // Asegúrate de incluir el DNI
    cargo: z.string().min(1, { message: "Cargo es requerido" }), // Asegúrate de incluir el cargo
  });
  
type Inputs = z.infer<typeof schema>;
const RepresentanteForm = ({
    type,
    data,
    id,
    closeModal
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
    } = useForm<Inputs>({
      resolver: zodResolver(schema),
      defaultValues: data || { estado: true }, // Aseguramos que el estado sea true por defecto
    });
  
    const onSubmit = handleSubmit(async (data) => {
        // Imprimir los datos del formulario cuando se envíe
        console.log("Datos del formulario:", data);
    
        try {
            const representante = {
                nombres: data.nombres,
                apellidos: data.apellidos,
                telefono: data.telefono,
                estado: data.estado !== undefined ? data.estado : true, // Si el estado no se pasa, se asigna true por defecto
                dni: data.dni,
                cargo: data.cargo,
            };
    
            if (type === "create") {
                console.log("Creando representante...");
                await saveRepresentante(representante);
                toast.success("Representante creado exitosamente");
            } else if (type === "update" && id) {
                console.log("Actualizando representante con ID:", id);
                console.log("Datos para actualizar:", representante);
    
                // Llamar a la función de actualización
                await updateRepresentante(id, representante);
    
                toast.success("Representante actualizado exitosamente");
            }
    
            // Cierra el modal después de la actualización exitosa
            closeModal();
        } catch (error: any) {
            console.error("Error al procesar la solicitud:", error); // Agregar más detalles en el log de error
            toast.error(error.message || "Error desconocido");
        }
    });
    
    return (
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Crear Representante" : "Actualizar Representante"}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nombres"
            name="nombres"
            register={register}
            error={errors?.nombres}
          />
          <InputField
            label="Apellidos"
            name="apellidos"
            register={register}
            error={errors?.apellidos}
          />
          <InputField
            label="DNI"
            name="dni"
            register={register}
            error={errors?.dni}
          />
          <InputField
            label="Teléfono"
            name="telefono"
            register={register}
            error={errors?.telefono}
          />
          <InputField
            label="Cargo"
            name="cargo"
            register={register}
            error={errors?.cargo}
          />
        </div>
  
        <button className="bg-blue-700 text-white p-2 rounded-md">
          {type === "create" ? "Crear" : "Actualizar"}
        </button>
      </form>
    );
  };
  
export default RepresentanteForm;
