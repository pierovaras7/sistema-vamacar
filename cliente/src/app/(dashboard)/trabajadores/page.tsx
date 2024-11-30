"use client"
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Trabajador } from "@/types/auth";
import Image from "next/image";
import Link from "next/link";
import { useDashboard } from "@/context/DashboardContext"; // Ajusta la ruta según corresponda

const columns = [
  {
    header: "Info",
    accessor: "info",
    className: "pl-4",
  },
  {
    header: "DNI",
    accessor: "dni",
    className: "hidden md:table-cell",
  },
  {
    header: "Telefono",
    accessor: "telefono",
    className: "hidden md:table-cell",
  },
  {
    header: "Rol",
    accessor: "rol",
    className: "hidden md:table-cell",
  },
  {
    header: "Area",
    accessor: "area",
    className: "hidden md:table-cell",
  },
  {
    header: "Direccion",
    accessor: "direccion",
    className: "hidden md:table-cell",
  },
  {
    header: "Opciones",
    accessor: "opcion",
  },
];

const TeacherPage = () => {
  const { trabajadores, refreshTrabajadores } = useDashboard();
  const teachersData = trabajadores;
  const renderRow = (item: Trabajador) => (
    <tr
      key={item.idTrabajador}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {/* <Image
          src={item.photo}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        /> */}
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.nombres + '' + item.apellidos}</h3>
          {/* <p className="text-xs text-gray-500">{item?.email}</p> */}
        </div>
      </td>
      <td className="hidden md:table-cell">{item.dni}</td>
      <td className="hidden md:table-cell">{item.telefono}</td>
      <td className="hidden md:table-cell">Roles</td>
      <td className="hidden md:table-cell">{item.area}</td>
      <td className="hidden md:table-cell">{item.direccion}</td>
      <td>
        {/* <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormModal table="teacher" type="delete" id={item.id}/>
          )}
        </div> */}
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {/* {role === "admin" && (
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              //   <Image src="/plus.png" alt="" width={14} height={14} />
              // </button>
              <FormModal table="teacher" type="create"/>
            )} */}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={teachersData} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default TeacherPage;
// "use client"
// import React, { useEffect } from 'react';
// import { useDashboard } from '@/context/DashboardContext';

// const TrabajadoresList = () => {
//   const { trabajadores, refreshTrabajadores } = useDashboard();

//   useEffect(() => {
//     refreshTrabajadores();
//   }, [refreshTrabajadores]);

//   return (
//     <ul>
//       {trabajadores.map(trabajador => (
//         <li key={trabajador.idTrabajador}>{trabajador.nombres}</li>
//       ))}
//     </ul>
//   );
// };

// export default TrabajadoresList;

