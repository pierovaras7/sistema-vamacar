"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ReactNode, useState } from "react";

// Lazy loading de formularios
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const CategoryForm = dynamic(() => import("./forms/CategoryForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubcategoryForm = dynamic(() => import("./forms/SubcategoryForm"), {
  loading: () => <h1>Loading...</h1>,
});

const BrandForm = dynamic(() => import("./forms/BrandForm"), {
  loading: () => <h1>Loading...</h1>,
});

const ProductForm = dynamic(() => import("./forms/ProductForm"), {
  loading: () => <h1>Loading...</h1>,
});

// Mapear formularios a tablas
const forms: {
  [key: string]: (type: "create" | "update", data?: any, onSuccess?: () => void) => JSX.Element;
} = {
  category: (type, data, onSuccess) => (
    <CategoryForm type={type} data={data} onSuccess={onSuccess} />
  ),
  subcategory: (type, data, onSuccess) => (
    <SubcategoryForm type={type} data={data} idCategoria={data?.idCategoria} onSuccess={onSuccess} />
  ),
  brand: (type, data, onSuccess) => (
    <BrandForm type={type} data={data} onSuccess={onSuccess} />
  ),
  product: (type, data, onSuccess) => (
    <ProductForm type={type} data={data} onSuccess={onSuccess} />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  onRefresh,
  onConfirm,
  children, // Nuevo prop para contenido personalaizado
}: {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "category"
    | "subcategory"
    | "brand"
    | "product";  
  type: "create" | "update" | "delete";
  data?: any;
  id?: number;
  onRefresh?: () => void;
  onConfirm?: () => void;
  children?: ReactNode; // Permite contenido adicional
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onRefresh?.();
  };

  const Form = () => {
    if (type === "delete" && id) {
      return (
        <form className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
            Delete
          </button>
        </form>
      );
    } else if ((type === "create" || type === "update") && forms[table]) {
      return forms[table](type, data, handleSuccess);
    } else {
      return <div>Form not found!</div>;
    }
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
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            {children || <Form />}
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
