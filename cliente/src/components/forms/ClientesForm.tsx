"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveCliente, updateCliente } from "@/services/clientesService";
import { saveNatural } from "@/services/naturalesService";
import { saveJuridico } from "@/services/juridicosService";
import InputField from "../InputField";
import { toast } from "sonner";
import { Cliente, Natural, Juridico } from "@/types";

// Esquema de validación con Zod
const schema = z.object({
  idCliente: z.string().optional(),
  tipoCliente: z.enum(["Natural", "Juridico"], { message: "Tipo de cliente es requerido" }),
  telefono: z.string().length(9, { message: "El teléfono debe tener exactamente 9 caracteres." }),
  correo: z.string().email({ message: "Correo no válido" }),
  direccion: z.string().min(1, { message: "Dirección es requerida" }),
  estado: z.boolean().default(true),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  razonSocial: z.string().optional(),
  ruc: z.string().optional(),
  idRepresentante: z.number().optional(),
});

type Inputs = z.infer<typeof schema>;

const ClientesForm = ({
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
    watch,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data || { tipoCliente: "Natural", estado: true },
  });

  const tipoCliente = watch("tipoCliente");

  const onSubmit = handleSubmit(async (data) => {
    try {
      const cliente: Cliente = {
        tipoCliente: data.tipoCliente,
        telefono: data.telefono,
        correo: data.correo,
        direccion: data.direccion,
        estado: true, // Estado siempre será true
      };
  
      let clienteEspecifico: Natural | Juridico;
  
      if (data.tipoCliente === "Natural") {
        clienteEspecifico = {
          nombres: data.nombres!,
          apellidos: data.apellidos!,
          idCliente: id!,
          estado: true, // Estado siempre será true
        };
      } else {
        clienteEspecifico = {
          razonSocial: data.razonSocial!,
          ruc: data.ruc!,
          idCliente: id!,
          idRepresentante: data.idRepresentante!,
          estado: true, // Estado siempre será true
        };
      }
  
      const requestData = {
        ...cliente,
        ...clienteEspecifico,
      };
  
      if (type === "create") {
        await saveCliente(requestData);
        toast.success("Cliente creado exitosamente");
      } else if (type === "update" && id) {
        await updateCliente(id, requestData);
        toast.success("Cliente actualizado exitosamente");
      }
  
      closeModal();
    } catch (error: any) {
      toast.error(error.message || "Error desconocido");
    }
  });
  
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Crear Cliente" : "Actualizar Cliente"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 w-full px-2">
          <label className="text-xs text-gray-500">Tipo de Cliente</label>
          <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" {...register("tipoCliente")}>
            <option value="Natural">Natural</option>
            <option value="Juridico">Juridico</option>
          </select>
          {errors.tipoCliente?.message && <p className="text-xs text-red-400">{errors.tipoCliente.message}</p>}
        </div>

        {tipoCliente === "Natural" && (
          <>
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
          </>
        )}

        {tipoCliente === "Juridico" && (
          <>
            <InputField
              label="Razón Social"
              name="razonSocial"
              register={register}
              error={errors?.razonSocial}
            />
            <InputField
              label="RUC"
              name="ruc"
              register={register}
              error={errors?.ruc}
            />
            <InputField
              label="ID Representante"
              name="idRepresentante"
              register={register}
              error={errors?.idRepresentante}
            />
          </>
        )}

        <InputField
          label="Teléfono"
          name="telefono"
          register={register}
          error={errors?.telefono}
        />
        <InputField
          label="Correo"
          name="correo"
          register={register}
          error={errors?.correo}
        />
        <InputField
          label="Dirección"
          name="direccion"
          register={register}
          error={errors?.direccion}
        />
      </div>

      <button className="bg-blue-700 text-white p-2 rounded-md">
        {type === "create" ? "Crear" : "Actualizar"}
      </button>
    </form>
  );
};

export default ClientesForm;