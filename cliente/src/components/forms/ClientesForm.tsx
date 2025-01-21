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
import { showErrorsToast } from "@/lib/functions";

const schema = z
  .object({
    tipoCliente: z.enum(["Natural", "Juridico"], { message: "Tipo de cliente es requerido" }),
    telefono: z.string().length(9, { message: "El teléfono debe tener exactamente 9 caracteres." }),
    correo: z.string().email({ message: "Correo no válido" }),
    direccion: z.string().min(1, { message: "Dirección es requerida" }),
    estado: z.boolean().default(true),
    dni: z.string().optional(), // Validación condicional
    nombres: z.string().optional(), // Validación condicional
    apellidos: z.string().optional(), // Validación condicional
    razonSocial: z.string().optional(), // Validación condicional
    ruc: z.string().optional(), // Validación condicional
    representante: z.string().optional(), // Validación condicional
  })
  .superRefine((data, ctx) => {
    if (data.tipoCliente === "Natural") {
      // Validaciones para clientes naturales
      if (!data.dni || !/^\d{8}$/.test(data.dni)) {
        ctx.addIssue({
          code: "custom",
          path: ["dni"],
          message: "El DNI debe tener 8 caracteres numéricos.",
        });
      }
      if (!data.nombres || data.nombres.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["nombres"],
          message: "El campo nombres es requerido.",
        });
      }
      if (!data.apellidos || data.apellidos.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["apellidos"],
          message: "El campo apellidos es requerido.",
        });
      }
    }

    if (data.tipoCliente === "Juridico") {
      // Validaciones para clientes jurídicos
      if (!data.razonSocial || data.razonSocial.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["razonSocial"],
          message: "El campo razón social es requerido.",
        });
      }
      if (!data.ruc || !/^\d{11}$/.test(data.ruc)) {
        ctx.addIssue({
          code: "custom",
          path: ["ruc"],
          message: "El RUC debe tener 11 caracteres numéricos.",
        });
      }
      if (!data.representante || data.representante.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["representante"],
          message: "El campo representante es requerido.",
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
    try {
      // Variable para almacenar el cliente relacionado
      let clienteRelacionado: Natural | Juridico | null = null;
  
      // Crear el cliente base
      const clienteNuevo: Cliente = {
        tipoCliente: data.tipoCliente,
        telefono: data.telefono,
        correo: data.correo,
        direccion: data.direccion,
        estado: true,
      };
  
      // Asignar cliente relacionado dependiendo del tipo de cliente
      if (data.tipoCliente === 'Natural') {
        console.log("aki estoy NATURAL")
        clienteRelacionado = {
          nombres: data.nombres!,
          apellidos: data.apellidos!,
          dni: data.dni!,
          estado: true,
        };
  
        // Asignar el cliente relacionado de tipo Natural
        clienteNuevo.natural = clienteRelacionado;
      } else if (data.tipoCliente === 'Juridico') {
        console.log("aki estoy juridico")
        clienteRelacionado = {
          razonSocial: data.razonSocial!,
          ruc: data.ruc!,
          representante: data.representante!,
          estado: true,
        };
  
        // Asignar el cliente relacionado de tipo Juridico
        clienteNuevo.juridico = clienteRelacionado;
      }
      if(type==="create"){
        console.log("Creando cliente ENVIANDO: ", clienteNuevo);
        const savedCliente = await saveCliente(clienteNuevo);
        console.log('Cliente creado:', savedCliente);
        toast.success("Cliente creado exitosamente.");
      }
      else if(type === "update"){
        console.log(`Actualizando cliente ENVIANDO: ${id}`, clienteNuevo);
        const updatedCliente = await updateCliente(id!,clienteNuevo);
        console.log('Cliente actualizado:', updatedCliente);
        toast.success("Cliente actualizado exitosamente.");
      }
      closeModal();
    } catch (error: any) {
      showErrorsToast(error);
    }
  });
  

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Crear Cliente" : "Actualizar Cliente"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 w-full px-2">
          <label className="text-sm font-medium text-gray-700">Tipo de Cliente</label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none" 
          {...register("tipoCliente")}>
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