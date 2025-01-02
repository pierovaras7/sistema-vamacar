import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveCliente, updateCliente } from "@/services/clientesService";
import { saveNatural, updateNatural, getNaturalesByCliente, deleteNatural } from "@/services/naturalesService";
import { saveJuridico, updateJuridico, getJuridicosByCliente, deleteJuridico } from "@/services/juridicosService";
import InputField from "../InputField";
import { toast } from "sonner";
import { Cliente, Natural, Juridico, Representante } from "@/types";

const schema = z
  .object({
    tipoCliente: z.enum(["Natural", "Juridico"], { message: "Tipo de cliente es requerido" }),
    telefono: z.string().length(9, { message: "El teléfono debe tener exactamente 9 caracteres." }),
    correo: z.string().email({ message: "Correo no válido" }),
    direccion: z.string().min(1, { message: "Dirección es requerida" }),
    estado: z.boolean().default(true),
    dni: z.string().optional(), // No aplicamos validación directa aquí
    nombres: z.string().optional(),
    apellidos: z.string().optional(),
    razonSocial: z.string().optional(),
    ruc: z.string().optional(),
    representante: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoCliente === "Natural") {
      // Validación para cliente natural
      if (!data.dni || data.dni.length !== 8) {
        ctx.addIssue({
          code: "custom",
          path: ["dni"],
          message: "El DNI debe tener 8 caracteres.",
        });
      }
      if (!data.nombres) {
        ctx.addIssue({
          code: "custom",
          path: ["nombres"],
          message: "Este campo es requerido",
        });
      }
      if (!data.apellidos) {
        ctx.addIssue({
          code: "custom",
          path: ["apellidos"],
          message: "Este campo es requerido",
        });
      }
    }

    if (data.tipoCliente === "Juridico") {
      // Validación para cliente jurídico
      if (!data.razonSocial) {
        ctx.addIssue({
          code: "custom",
          path: ["razonSocial"],
          message: "Este campo es requerido",
        });
      }
      if (!data.ruc) {
        ctx.addIssue({
          code: "custom",
          path: ["ruc"],
          message: "Este campo es requerido",
        });
      }
      if (!data.representante) {
        ctx.addIssue({
          code: "custom",
          path: ["representante"],
          message: "Este campo es requerido",
        });
      }
    }
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
    setValue,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data || { tipoCliente: "Natural", estado: true },
  });

  const [clienteNatural, setClienteNatural] = useState<Natural | null>(null);
  const [clienteJuridico, setClienteJuridico] = useState<Juridico | null>(null);
  const [idTipoCliente, setidTipoCliente] = useState<number | null>(null);


  useEffect(() => {
    if (type === "update" && id) {
      const fetchClienteData = async () => {
        console.log("Fetching cliente data...");
        if (data?.tipoCliente === "Natural") {
          try {
            const naturalesData = await getNaturalesByCliente(id); // Aquí pasamos el idCliente
            if (naturalesData.length > 0) {
              const clienteData = naturalesData[0];
              console.log("Natural Cliente Data:", clienteData);
              setClienteNatural(clienteData);
              setValue("dni", clienteData.dni);
              setValue("nombres", clienteData.nombres);
              setValue("apellidos", clienteData.apellidos);
            }
          } catch (error) {
            toast.error("Error al obtener datos del cliente Natural");
            console.log("Error fetching cliente natural:", error);
          }
        } else if (data?.tipoCliente === "Juridico") {
          try {
            const juridicosData = await getJuridicosByCliente(id);
            if (juridicosData.length > 0) {
              const clienteData = juridicosData[0];
              console.log("Juridico Cliente Data:", clienteData);
              setClienteJuridico(clienteData);
              setValue("razonSocial", clienteData.razonSocial);
              setValue("ruc", clienteData.ruc);
              setValue("representante", clienteData.representante);
            }
          } catch (error) {
            toast.error("Error al obtener datos del cliente Jurídico");
            console.log("Error fetching cliente juridico:", error);
          }
        }
      };

      fetchClienteData();
    }
  }, [type, id, data, setValue]);

  const tipoCliente = watch("tipoCliente");

  const onSubmit = handleSubmit(async (data) => {
    console.log("Submitting form with data:", data);
    const idTipoNatural = clienteNatural?.idNatural;
    const idTipoJuridico = clienteJuridico?.idJuridico;

    try {
      const cliente: Cliente = {
        tipoCliente: data.tipoCliente,
        telefono: data.telefono,
        correo: data.correo,
        direccion: data.direccion,
        estado: true,
      };

      let idCliente;

      if (type === "create") {
        const savedCliente = await saveCliente(cliente);
        console.log("Cliente creado:", savedCliente);
        idCliente = savedCliente.idCliente;
      } else {
        if (!id) {
          console.log("ID del cliente no proporcionado para actualización.");
          return;
        }else{
          updateCliente(id, cliente);
          idCliente = id;
        }
      }

      console.log(idCliente, idTipoNatural, idTipoJuridico);

      // Si es Natural
      if (data.tipoCliente === "Natural" ) {
        const clienteNatural: Natural = {
          nombres: data.nombres!,
          apellidos: data.apellidos!,
          dni: data.dni!,
          idCliente,
          estado: true,
        };

        if(idTipoJuridico){
          await deleteJuridico(idTipoJuridico);
          console.log("Cliente Juridico eliminado:");
          await saveNatural(clienteNatural);
          console.log("Natural cliente guardado:", clienteNatural);
        }

        if(idTipoNatural){
          await updateNatural(idTipoNatural, clienteNatural);
          console.log("Natural cliente actualizado:", clienteNatural);
        }
        
      }else {
        const clienteJuridico: Juridico = {
          razonSocial: data.razonSocial!,
          ruc: data.ruc!,
          idCliente,
          representante: data.representante!,
          estado: true,
        };

        if(idTipoNatural){
          await deleteNatural(idTipoNatural);
          console.log("Cliente Natural eliminado:");
          await saveJuridico(clienteJuridico);
          console.log("Juridico cliente guardado:", clienteJuridico);
        }

        if(idTipoJuridico){
          await updateJuridico(idTipoJuridico, clienteJuridico);
          console.log("Juridico cliente actualizado:", clienteJuridico);
        }
        
      }
        
      toast.success(
        `${type === "create" ? "Cliente creado" : "Cliente actualizado"} exitosamente`
      );
      closeModal();
    } catch (error: any) {
      console.error("Error en la actualización:", error);
      toast.error(error.message || "Error desconocido");
    }
  });
  
  
  console.log("Errores:", errors);

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
              label="DNI"
              name="dni"
              register={register}
              error={errors?.dni}
            />
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
              label="RUC"
              name="ruc"
              register={register}
              error={errors?.ruc}
            />
            <InputField
              label="Razón Social"
              name="razonSocial"
              register={register}
              error={errors?.razonSocial}
            />
            <InputField
              label="Representante"
              name="representante"
              register={register}
              error={errors?.representante}
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