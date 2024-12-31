import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveCliente, updateCliente } from "@/services/clientesService";
import { saveNatural, updateNatural, getNaturalesByCliente } from "@/services/naturalesService";
import { saveJuridico, updateJuridico, getJuridicosByCliente } from "@/services/juridicosService";
import InputField from "../InputField";
import { toast } from "sonner";
import { Cliente, Natural, Juridico, Representante } from "@/types";
import { getAllRepresentantes } from "@/services/representantesService";

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
  const [clienteNatural, setClienteNatural] = useState<Natural | null>(null);
  const [clienteJuridico, setClienteJuridico] = useState<Juridico | null>(null);

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
              setValue("idRepresentante", clienteData.idRepresentante);
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
    try {
      const cliente: Cliente = {
        tipoCliente: data.tipoCliente,
        telefono: data.telefono,
        correo: data.correo,
        direccion: data.direccion,
        estado: true,
      };

      let idCliente: number;

      if (type === "create") {
        const savedCliente = await saveCliente(cliente);
        console.log("Cliente creado:", savedCliente);
        idCliente = savedCliente.idCliente;
      } else {
        if (!id) {
          console.log("ID del cliente no proporcionado para actualización.");
          return;
        }
        console.log("Updating cliente with id:", id);
        idCliente = id!;
      }

      // Si es Natural
      if (data.tipoCliente === "Natural") {
        const clienteNatural: Natural = {
          nombres: data.nombres!,
          apellidos: data.apellidos!,
          idCliente,
          estado: true,
        };

        // Primero actualizamos los datos del cliente Natural
        if (type === "create") {
          await saveNatural(clienteNatural);
          console.log("Natural cliente guardado:", clienteNatural);
        } else {
          await updateNatural(clienteNatural.idCliente, clienteNatural);
          console.log("Natural cliente actualizado:", clienteNatural);
        }

        // Luego actualizamos los datos generales del cliente
        await updateCliente(idCliente, cliente);
        console.log("Cliente actualizado:", cliente);

      // Si es Jurídico
      } else {
        const idRepresentante = data.idRepresentante
          ? parseInt(data.idRepresentante as unknown as string, 10)
          : undefined;

        if (idRepresentante === undefined || isNaN(idRepresentante)) {
          throw new Error("El ID del representante debe ser un número válido.");
        }

        const clienteJuridico: Juridico = {
          razonSocial: data.razonSocial!,
          ruc: data.ruc!,
          idCliente,
          idRepresentante,
          estado: true,
        };

        // Primero actualizamos los datos del cliente Jurídico
        if (type === "create") {
          await saveJuridico(clienteJuridico);
          console.log("Juridico cliente guardado:", clienteJuridico);
        } else {
          await updateJuridico(clienteJuridico.idCliente, clienteJuridico);
          console.log("Juridico cliente actualizado:", clienteJuridico);
        }

        // Luego actualizamos los datos generales del cliente
        await updateCliente(idCliente, cliente);
        console.log("Cliente actualizado:", cliente);
      }

      toast.success(
        `${type === "create" ? "Cliente creado" : "Cliente actualizado"} exitosamente`
      );
      closeModal();
    } catch (error: any) {
      toast.error(error.message || "Error desconocido");
      console.log("Error en la actualización:", error);
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
                {...register("idRepresentante")}
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
