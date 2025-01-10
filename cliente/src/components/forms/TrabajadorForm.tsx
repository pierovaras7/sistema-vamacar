"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { getAllSedes, saveTrabajador, updateTrabajador } from "@/services/trabajadoresService";
import { toast } from "sonner";
import { Sede, Trabajador } from "@/types";
import { useEffect, useState } from "react";
import useSedes from "@/hooks/useSedes";

// Calcular la mayoría de edad (18 años)
const isAdult = (dateString: string): boolean => {
  const today = new Date();
  const birthDate = new Date(dateString);
  const age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  return age > 18 || (age === 18 && hasHadBirthdayThisYear);
};

// Definir el esquema de validación con zod
const schema = z.object({
  id: z.string().optional(), // ID opcional para actualización
  nombres: z.string().min(1, { message: "Nombre es un campo requerido." }),
  apellidos: z.string().min(1, { message: "Apellidos es un campo requerido." }),
  telefono: z
    .string()
    .length(9, { message: "El teléfono debe tener exactamente 9 caracteres." })
    .regex(/^\d+$/, { message: "El teléfono debe contener solo números." }),
  sexo: z.enum(["M", "F"], { message: "Sexo es un campo requerido." }),
  sede: z.string().nonempty({ message: "Sede es un campo requerido." }),
  direccion: z.string().min(1, { message: "Dirección es requerida." }),
  dni: z
    .string()
    .length(8, { message: "DNI debe tener 8 caracteres." })
    .regex(/^\d+$/, { message: "DNI debe contener solo caracteres numéricos." }),
  area: z.enum(['atencion'], { message: "Área es un campo requerido." }),
  fechaNacimiento: z
  .string()
  .min(1, { message: "Fecha de nacimiento es requerida." })
  .refine(isAdult, { message: "Debe ser mayor de edad." }),  
  turno: z.enum(['mañana', 'tarde'], { message: "Turno es un campo requerido." }),
  salario: z
    .string() // Espera un string
    .transform((val) => parseFloat(val)) // Convierte el string a un número
    .refine((val) => !isNaN(val), { message: "Salario debe ser un número." }) // Asegúrate de que sea un número
    .refine((val) => val >= 0, { message: "Salario debe ser mayor o igual a 0." }),
  crearCuenta: z.boolean().optional(),
});

type Inputs = z.infer<typeof schema>;


const TrabajadorForm = ({
  type,
  data,
  id,
  closeModal,
}: {
  type: "create" | "update";
  data?: any;
  id?: number;
  closeModal: () => void,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data
    ? { ...data, 
      fechaNacimiento: data.fechaNacimiento?.split('T')[0],
      crearCuenta: data.crearCuenta || false 
    }
    : { crearCuenta: false },
  });

  const { sedes } = useSedes();
  const [sedeSeleccionada, setSedeSeleccionada] = useState<Sede>(); 

  useEffect(() => {
    if (data?.sede?.idSede) {
      const sedePorDefecto = sedes?.find(sede => sede.idSede === data.sede.idSede);
      if (sedePorDefecto) {
        setSedeSeleccionada(sedePorDefecto);  // Establece la sede seleccionada al cargar el formulario
      }
      setValue("sede", data.sede.idSede.toString());
    }
  }, [data, sedes]);  // Este useEffect se ejecuta cuando `data` o `sedes` cambian

  
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sedeSeleccionada = sedes?.find(sede => sede.idSede === Number(event.target.value));
    if (sedeSeleccionada) {
      setSedeSeleccionada(sedeSeleccionada);
    }
  };
   
  const onSubmit = handleSubmit(async (data) => {
    try {
      const trabajador: Trabajador = {
        nombres: data.nombres,
        apellidos: data.apellidos,
        telefono: data.telefono,
        sexo: data.sexo,
        direccion: data.direccion,
        dni: data.dni,
        area: data.area,
        fechaNacimiento: new Date(data.fechaNacimiento).toISOString(),
        turno: data.turno,
        salario: data.salario,
        sede: sedeSeleccionada
      };

      const requestData = {
        ...trabajador,
        crearCuenta: data.crearCuenta, // Aquí se pasa el valor del checkbox
      };

      if (type === "create") {
        // Crear un nuevo trabajador
        await saveTrabajador(requestData);
        toast.success("Trabajador creado exitosamente");
      } else if (type === "update" && id) {
        // Actualizar un trabajador existente
        await updateTrabajador(id, trabajador);
        toast.success("Trabajador actualizado exitosamente");
      }

      closeModal(); // Cerrar el modal después de guardar
    } catch (error: any) {
      // Si tienes un error de validación con un formato JSON.stringify, procesarlo
      const errorMessage = error.message ? error.message : 'Error desconocido';

      try {
        const validationErrors = JSON.parse(errorMessage);
        if (validationErrors) {
          // Muestra los errores específicos de validación
          Object.keys(validationErrors).forEach((field) => {
            const messages = validationErrors[field];
            // Aquí puedes usar los mensajes de error, por ejemplo, mostrarlos en un toast o en una lista
            messages.forEach((msg: string) => {
              // Utilizamos una expresión regular para extraer el mensaje después del primer ':'
              const cleanMessage = msg.replace(/^.*?:\s*/, ''); // Esto elimina todo hasta el primer ":"
              toast.error(cleanMessage); // Mostrar el mensaje limpio en el toast
            });          
          });
        }
      } catch (e) {
        // Si no es un error de validación, muestra el error genérico
        toast.error(errorMessage);
      }
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Crear Trabajador" : "Actualizar Trabajador"}
      </h1>
      <div className="flex flex-col md:grid grid-cols-4">
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
          label="Teléfono"
          name="telefono"
          register={register}
          error={errors?.telefono}
        />
        <InputField
          label="Dirección"
          name="direccion"
          register={register}
          error={errors?.direccion}
        />
        <InputField
          label="DNI"
          name="dni"
          register={register}
          error={errors?.dni}
        />
        <div className="flex flex-col gap-2 w-full px-2 mb-2">
          <label className="text-sm font-medium text-gray-700">Sexo</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
            {...register("sexo")}
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
          {errors.sexo?.message && (
            <p className="text-sm text-red-500">{errors.sexo.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 px-2 w-full mb-2">
          <label className="text-sm font-medium text-gray-700">Area</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
            {...register("area")}
          >
            {type === "create" ? <option value="">Seleccionar una opción</option> : ""}
            <option value="atencion">Atencion</option>
          </select>
          {errors.area?.message && (
            <p className="text-sm text-red-500">{errors.area.message}</p>
          )}
        </div>
        <InputField
          label="Fecha de Nacimiento"
          name="fechaNacimiento"
          type="date"
          register={register}
          error={errors?.fechaNacimiento}
        />
        <div className="flex flex-col gap-2 px-2 w-full mb-2">
          <label className="text-sm font-medium text-gray-700">Turno</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
            {...register("turno")}
          >
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
          </select>
          {errors.turno?.message && (
            <p className="text-sm text-red-500">{errors.turno.message}</p>
          )}
        </div>
        <InputField
          label="Salario"
          name="salario"
          type="number"
          step={0.01}
          register={register}
          error={errors?.salario}
        />
        <div className="flex flex-col gap-2 w-full px-2 mb-2">
          <label className="text-sm font-medium text-gray-700">Sede</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
            {...register("sede")}
            onChange={handleChange}
            value={sedeSeleccionada?.idSede}
          >
            <option value="">
              Selecciona una sede
            </option>
            {sedes?.map((sede) => (
              <option key={sede.idSede} value={sede.idSede}>
                {sede.direccion}
              </option>
            ))}
          </select>

          {errors.sede?.message && (
            <p className="text-sm text-red-500">{errors.sede.message}</p>
          )}
        </div>
        <div className="flex gap-2 px-4 py-3 w-full col-span-2">
          <label className="text-sm">
            <input type="checkbox" {...register("crearCuenta")} /> Crear cuenta en el sistema
          </label>
          {errors.crearCuenta && (
            <p className="text-sm text-red-500">{errors.crearCuenta.message}</p>
          )}
        </div>
      </div>
      <button className="bg-blue-700 text-white p-2 rounded-md">
        {type === "create" ? "Crear" : "Actualizar"}
      </button>
    </form>
  );
};

export default TrabajadorForm;
