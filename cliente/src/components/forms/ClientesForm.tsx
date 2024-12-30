import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveCliente, updateCliente } from "@/services/clientesService";
import { saveNatural, updateNatural } from "@/services/naturalesService";
import { saveJuridico, updateJuridico } from "@/services/juridicosService";
import InputField from "../InputField";
import { toast } from "sonner";
import { Cliente, Natural, Juridico, Representante } from "@/types";
import { getAllRepresentantes } from "@/services/representantesService";  // Importa el servicio de representantes

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
    setValue,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data || { tipoCliente: "Natural", estado: true },
  });

  const [representantes, setRepresentantes] = useState<Representante[]>([]);

  useEffect(() => {
    const fetchRepresentantes = async () => {
      try {
        const data = await getAllRepresentantes();
        setRepresentantes(data);
      } catch (error) {
        toast.error("Error al obtener los representantes");
      }
    };

    fetchRepresentantes();
  }, []);

  const tipoCliente = watch("tipoCliente");

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Primero, guarda el cliente general (sin los datos específicos de tipo)
      const cliente: Cliente = {
        tipoCliente: data.tipoCliente,
        telefono: data.telefono,
        correo: data.correo,
        direccion: data.direccion,
        estado: true, // Estado siempre será true
      };
  
      // Guarda el cliente general y obtiene la respuesta con el idCliente
      const savedCliente = await saveCliente(cliente);
      const idCliente = savedCliente.idCliente;  // Asumiendo que el backend retorna el idCliente
  
      let clienteEspecifico: Natural | Juridico;
  
      // Si es un cliente "Natural", guarda los datos específicos de Natural
      if (data.tipoCliente === "Natural") {
        clienteEspecifico = {
          nombres: data.nombres!,
          apellidos: data.apellidos!,
          idCliente: idCliente,  // Asigna el idCliente obtenido
          estado: true, // Estado siempre será true
        };
  
        // Guardamos los datos específicos de "Natural"
        await saveNatural(clienteEspecifico);
      } else {
        // Si es un cliente "Juridico", guarda los datos específicos de Juridico
        // Convertimos a número si el valor no es vacío y aseguramos que sea un número
        const idRepresentante = data.idRepresentante ? parseInt(data.idRepresentante as unknown as string, 10) : undefined;
  
        // Verifica si la conversión fue exitosa y si el valor es un número
        if (isNaN(idRepresentante!)) {
          throw new Error("El ID del representante debe ser un número válido.");
        }
  
        clienteEspecifico = {
          razonSocial: data.razonSocial!,
          ruc: data.ruc!,
          idCliente: idCliente,  // Asigna el idCliente obtenido
          idRepresentante: idRepresentante!, // Ahora ya es un número
          estado: true, // Estado siempre será true
        };
  
        // Guardamos los datos específicos de "Juridico"
        await saveJuridico(clienteEspecifico);
      }
  
      // Si es un "create", el cliente será creado y luego se guardan los datos específicos
      toast.success(`${type === "create" ? "Cliente creado" : "Cliente actualizado"} exitosamente`);
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
          <div className="flex flex-col gap-2 w-full px-2">
            <label className="text-xs text-gray-500">Representante</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("idRepresentante", {
                setValueAs: (value) => {
                  // Convertir el valor a número o undefined si no hay selección
                  return value ? parseInt(value, 10) : undefined;
                }
              })}
            >
              <option value="">Selecciona un representante</option>
              {representantes.map((representante) => (
                <option key={representante.idRepresentante} value={representante.idRepresentante}>
                  {representante.nombres} {representante.apellidos}
                </option>
              ))}
            </select>
            {errors.idRepresentante?.message && (
              <p className="text-xs text-red-400">{errors.idRepresentante.message}</p>
            )}
        </div>

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
