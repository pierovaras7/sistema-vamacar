"use client";

import { deleteTrabajador } from "@/services/trabajadoresService";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

// USE LAZY LOADING



const TrabajadorForm = dynamic(() => import("./forms/TrabajadorForm"), {
  loading: () => <h1>Loading...</h1>,
  ssr: false,
});
const CategoryForm = dynamic(() => import("./forms/CategoryForm"), {
  loading: () => <h1>Loading...</h1>,
  ssr: false,
});
const SubcategoryForm = dynamic(() => import("./forms/SubcategoryForm"), {
  loading: () => <h1>Loading...</h1>,
  ssr: false,
});
const BrandForm = dynamic(() => import("./forms/BrandForm"), {
  loading: () => <h1>Loading...</h1>,
  ssr: false,
});

const ProductForm = dynamic(() => import("./forms/ProductForm"), {
  loading: () => <h1>Loading...</h1>,
  ssr: false,
});


const forms: {
  [key: string]: (type: "create" | "update", data?: any, id?: number, closeModal?: () => void) => JSX.Element;
} = {
  trabajador: (type, data, id, closeModal) =>
    <TrabajadorForm type={type} data={data} id={id} closeModal={closeModal || (() => {})} />,
  category: (type, data, id, closeModal) =>
    <CategoryForm type={type} data={data} id={id} onSuccess={() => closeModal?.()} />,
  subcategory: (type, data, id, closeModal) =>
    <SubcategoryForm type={type} data={data}       idCategoria={data?.idCategoria || id}  onSuccess={() => closeModal?.()} />,
  brand: (type, data, id, closeModal) =>
    <BrandForm
      type={type}
      data={data}
      id={id}
      onSuccess={() => closeModal?.()}
    />,
    product: (type, data, id, closeModal) =>
      <ProductForm
        type={type}
        data={data}
        id={id}
        onSuccess={() => closeModal?.()}
      />,
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
    | "category"
    | "brand"
    | "subcategory"
    | "product"
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
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const closeModal = () => {
    setOpen(false); // Define closeModal aquí
    onUpdate(); // Actualizar la lista de trabajadores al cerrar el modal
  }
  const Form = () => {

    const handleDelete = async () => {
      if(id){
        try {
          await deleteTrabajador(id);
          setOpen(false);
          toast.success("El trabajador fue eliminado exitosamente");
          onUpdate();
        } catch (error) {
          console.error("Error deleting item:", error);
        }
      }
    };
  
    return type === "delete" && id ? (
      <div className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          ¿Estas segro de borrar este registro de {table}?
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
        onClick={() => {
          setOpen(true); // Lógica existente
        }}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;