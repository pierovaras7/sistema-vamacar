"use client";

import { deleteTrabajador } from "@/services/trabajadoresService";
import { deleteRepresentante} from "@/services/representantesService";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

// USE LAZY LOADING

// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TrabajadorForm = dynamic(() => import("./forms/TrabajadorForm"), {
  loading: () => <h1>Loading...</h1>,
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

const ClientesForm = dynamic(() => import("./forms/ClientesForm"), {
  loading: () => <h1>Loading...</h1>,
  ssr: false,
});

const RepresentanteForm = dynamic(() => import("./forms/RepresentanteForm"), {
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
  ) => JSX.Element;} = {
  trabajador: (type, data, id, closeModal) => {
    const handleClose = closeModal || (() => {});
    return <TrabajadorForm type={type} data={data} id={id} closeModal={handleClose} />;
  },
  cliente: (type, data, id, closeModal) => {
    const handleClose = closeModal || (() => {});
    return <ClientesForm type={type} data={data} id={id} closeModal={handleClose} />;
  },
  representante: (type, data, id, closeModal) => {
    const handleClose = closeModal || (() => {});
    return <RepresentanteForm type={type} data={data} id={id} closeModal={handleClose} />;
  },
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
    "trabajador"
    | "category"
    | "brand"
    | "subcategory"
    | "product"
    | "cliente"
    | "representante"
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
          console.log(`🛠️ [Componente] Eliminando elemento de la tabla: ${table}, ID: ${id}`);
          
          if (table === "trabajador") {
            await deleteTrabajador(id);
            toast.success("El trabajador fue eliminado exitosamente");
          } else if (table === "representante") {
            await deleteRepresentante(id);
            toast.success("El representante fue desactivado exitosamente");
          } else {
            console.warn("⚠️ [Componente] Tabla no reconocida para eliminación:", table);
          }
    
          setOpen(false);
          onUpdate(); // Actualiza la lista
        } catch (error: any) {
          console.error("❌ [Componente] Error al eliminar elemento:", error.message || error);
          toast.error("Error al eliminar elemento");
        }
      }
    };
    
    return type === "delete" && id ? (
      <div>
        <h2 className="text-lg font-semibold mb-4">Confirmar eliminación</h2>
        <p className="mb-6">
         ¿Estás seguro de que deseas eliminar este registro de la tabla {table}?
        </p>
        <div className="flex gap-4 justify-end">
        <button
            className="bg-gray-300 text-black px-4 py-2 rounded-md"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={handleDelete}
          >
            Confirmar
          </button>
        </div>
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
        <div className="fixed inset-0 px-4 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg relative w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-6 overflow-y-auto max-h-[80vh]">
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