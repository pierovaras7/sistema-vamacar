"use client";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import InputField from "@/components/InputField";
import useAuthStore from "@/stores/AuthStore";
import { toast } from "sonner";
import { showErrorsToast } from "@/lib/functions";

// Definimos el esquema de validación con Zod
const esquemaValidacion = (isAdmin: boolean) =>
  z
    .object({
      username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
      password: z.string().optional(),
      password_confirmation: z.string().optional(),
      nombres: z.string().optional(),  // Hacer opcional para ambos casos (admin o no admin)
      apellidos: z.string().optional(),  // Hacer opcional para ambos casos
      telefono: z.string().optional(),
      sexo: z.enum(["M", "F", "SE"]).optional(),  // Hacer opcional
      direccion: z.string().optional(),
      dni: z.string().optional(),  // Hacer opcional
      fechaNacimiento: z.string().optional(),  // Hacer opcional
    })
    .refine((datos) => datos.password === datos.password_confirmation, {
      message: "Las contraseñas no coinciden",
      path: ["password_confirmation"], // El campo que muestra el error
    });


type ProfilePayload = z.infer<ReturnType<typeof esquemaValidacion>>;

const PaginaPerfil: React.FC = () => {
  const { user, isAdmin, logout, updateProfile} = useAuthStore();
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  const defaultValues = {
    username: user?.username || "",
    password: "",
    password_confirmation: "",
    ...(isAdmin
      ? {} 
      : {
          nombres: user?.trabajador?.nombres || "",
          apellidos: user?.trabajador?.apellidos || "",
          telefono: user?.trabajador?.telefono || "",
          sexo: user?.trabajador?.sexo as "M" | "F" | "SE" | undefined,
          direccion: user?.trabajador?.direccion || "",
          dni: user?.trabajador?.dni || "",
          fechaNacimiento: user?.trabajador?.fechaNacimiento?.split('T')[0] || "",
        }),
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty},
  } = useForm<ProfilePayload>({
    resolver: zodResolver(esquemaValidacion(isAdmin)),
    defaultValues,
    
  });

  const formRef = useRef(defaultValues);

  const onSubmit = async (datos: ProfilePayload) => {
    try {
      if (user) {
        const initialValues = formRef.current;

        console.log(initialValues);
        
        const hasChanged = Object.keys(initialValues).some(
          (key) => initialValues[key as keyof ProfilePayload] !== datos[key as keyof ProfilePayload]
        );
  
        if (!hasChanged) {
          toast.info("No se han realizado cambios en el formulario");
          return;
        }
  
        await updateProfile(user.idUser, datos);

        if (datos.password) {
          setIsPasswordChanged(true);
          setIsModalOpen(true);
        }
  
        toast.success("Perfil actualizado con éxito");
      }
    } catch (error: any) {
      showErrorsToast(error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    logout();
  };

  return (
    <div className="container w-full rounded-xl mx-2 p-2 md:px-8 md:py-4 bg-white">
      <h1 className="text-2xl font-semibold mb-6">Actualizar Perfil</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Datos de Usuario */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Datos de Usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Username"
              name="username"
              register={register}
              error={errors.username}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password}
            />
            <InputField
              label="Confirmar password"
              name="password_confirmation"
              type="password"
              register={register}
              error={errors.password_confirmation}
            />
          </div>
        </div>

        {!isAdmin && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Datos Personales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Nombres"
                name="nombres"
                register={register}
                error={errors.nombres}
              />
              <InputField
                label="Apellidos"
                name="apellidos"
                register={register}
                error={errors.apellidos}
              />
              <InputField
                label="Teléfono"
                name="telefono"
                register={register}
                error={errors.telefono}
              />
              <div className="flex flex-col gap-2 w-full px-2">
                <label className="text-sm font-medium text-gray-700">Sexo</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
                  {...register("sexo")}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="SE">Sin especificar</option>
                </select>
                {errors.sexo?.message && (
                  <p className="text-xs text-red-400">{errors.sexo.message}</p>
                )}
              </div>
              <InputField
                label="Dirección"
                name="direccion"
                register={register}
                error={errors.direccion}
              />
              <InputField
                label="DNI"
                name="dni"
                register={register}
                error={errors.dni}
              />
              <InputField
                label="Fecha de Nacimiento"
                name="fechaNacimiento"
                type="date"
                register={register}
                error={errors.fechaNacimiento}
              />
            </div>
          </div>
        )}
        
        <button
          type="submit"
          className={`px-4 py-2 rounded w-full md:w-auto transition-colors duration-300 ${
            !isSubmitting
              ? "bg-blue-800 hover:bg-blue-600 text-white"
              : "bg-gray-200 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Actualizando..." : "Actualizar"}
        </button>
      </form>

      {/* Modal de contraseña cambiada */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Se ha actualizado la contraseña
            </h2>
            <p className="mb-4">
              Para continuar, por favor, vuelve a iniciar sesión con tu nueva contraseña.
            </p>
            <button
              onClick={closeModal}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaPerfil;
