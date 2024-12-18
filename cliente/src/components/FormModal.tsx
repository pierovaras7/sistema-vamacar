"use client";

import { deleteTrabajador } from "@/services/trabajadoresService";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

// Lazy loading para el formulario de Trabajador
const TrabajadorForm = dynamic(() => import("./forms/TrabajadorForm"), {
  loading: () => <h1>Loading...</h1>,
  ssr: false,
});

// Mapeo de formularios por tabla
const forms: {
  [key: string]: (
    type: "create" | "update",
    data?: any,
    id?: number,
    closeModal?: () => void
  ) => JSX.Element;
} = {
  trabajador: (type, data, id, closeModal) => {
    const handleClose = closeModal || (() => {});
    return <TrabajadorForm type={type} data={data} id={id} closeModal={handleClose} />;
  },
};

const FormModal = ({
  table,
  type,
  data,
  id,
  onUpdate,
}: {
  table:
    | "teacher"
    | "student"
    | "trabajador"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number;
  onUpdate: () => void;
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaGreen"
      : "bg-lamaRed";

  const [open, setOpen] = useState(false);

  const closeModal = () => {
    setOpen(false);
    onUpdate(); // Actualizar lista al cerrar modal
  };

  const Form = () => {
    const handleDelete = async () => {
      if (id) {
        try {
          await deleteTrabajador(id);
          setOpen(false);
          toast.success("El trabajador fue eliminado exitosamente");
          onUpdate();
        } catch (error) {
          console.error("Error eliminando trabajador:", error);
          toast.error("Error al eliminar el trabajador. Intenta de nuevo.");
        }
      }
    };

    return type === "delete" && id ? (
      <div className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          ¿Estás seguro de borrar este registro de {table}?
        </span>
        <button
          className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center"
          onClick={handleDelete}
        >
          Eliminar
        </button>
      </div>
    ) : type === "create" || type === "update" ? (
      forms[table](type, data, id, closeModal)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
  <div className="w-screen h-screen fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-lg shadow-lg relative w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-6 overflow-y-auto max-h-[80vh] my-8">
      <Form />
      <div
        className="absolute top-4 right-4 cursor-pointer"
        onClick={() => setOpen(false)}
      >
        <Image src="/close.png" alt="Cerrar" width={14} height={14} />
      </div>
    </div>
  </div>
)}



    </>
  );
};

export default FormModal;
