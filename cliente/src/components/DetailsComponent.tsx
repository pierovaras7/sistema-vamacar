// import React, { useState } from "react";
// import SearchDropdown, { Producto } from "./SearchDropdown";

// const productosBase = [
//   { id: 1, nombre: "Manzana", precio: 14, cantidad: 1 },
//   { id: 2, nombre: "Banana", precio: 12, cantidad: 1 },
//   { id: 3, nombre: "Naranja", precio: 10, cantidad: 1 },
//   { id: 4, nombre: "Uva", precio: 15, cantidad: 1 },
//   { id: 5, nombre: "Pera", precio: 13, cantidad: 1 },
// ];

// const DetailsComponent = () => {
//   const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
//     null
//   );
//   const [productosAgregados, setProductosAgregados] = useState<Producto[]>([]);
//   const [resetDropdown, setResetDropdown] = useState(false);


//   const handleSelectProducto = (producto: Producto) => {
//     setSelectedProducto(producto);
//   };

//   const handleAgregarProducto = () => {
//     if (selectedProducto) {
//       const productoExiste = productosAgregados.find(
//         (p) => p.id === selectedProducto.id
//       );
//       if (productoExiste) {
//         // Incrementa la cantidad si el producto ya existe en la lista
//         setProductosAgregados((prev) =>
//           prev.map((p) =>
//             p.id === selectedProducto.id
//               ? { ...p, cantidad: p.cantidad + 1 }
//               : p
//           )
//         );
//       } else {
//         // Agrega el producto nuevo
//         setProductosAgregados((prev) => [...prev, { ...selectedProducto }]);
//       }
//     }
//     setSelectedProducto(null); // Limpia el dropdown
//   };

//   const handleEditarProducto = (
//     id: number,
//     campo: "cantidad" | "precio",
//     valor: number
//   ) => {
//     setProductosAgregados((prev) =>
//       prev.map((p) =>
//         p.id === id ? { ...p, [campo]: valor } : p // Permite asignar cualquier valor válido
//   )
//     );
//   };

//   const calcularTotal = () =>
//     productosAgregados.reduce(
//       (total, producto) => total + producto.cantidad * producto.precio,
//       0
//     ); 
  


//   return (
//     <div className="p-8 rounded-lg shadow-lg mx-6 my-3 bg-white flex flex-col items-center">
//       <h2 className="text-2xl font-extrabold text-gray-800 mb-6">
//         Detalle de Venta
//       </h2>

//       {/* Componente de búsqueda */}
//       <div className="flex items-center gap-4 mb-6 w-full justify-center">
//         <div className="w-2/3">
//           <SearchDropdown
//             productos={productosBase}
//             onSelect={handleSelectProducto}
//             reset={resetDropdown}
//             />
//         </div>
//         <button
//           className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
//           onClick={() => {
//             handleAgregarProducto(),
//             setResetDropdown(true)
//             }
//           }
//           disabled={!selectedProducto}
        
//         >
//           Agregar
//         </button>
//       </div>

//       {/* Tabla de productos */}
//       <div className="overflow-x-auto mt-6 w-full flex justify-center">
//         <table className="w-3/4 table-auto border-collapse border border-gray-200 rounded-lg text-center">
//           <thead>
//             <tr className="text-left text-gray-500 text-sm bg-gray-100">
//               <th className="px-6 py-3 text-center border-b w-6/12">Producto</th>
//               <th className="px-6 py-3 text-center border-b w-2/12">Cantidad</th>
//               <th className="px-6 py-3 text-center border-b w-2/4">Precio Unitario</th>
//               <th className="px-6 py-3 text-center border-b w-2/4">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {productosAgregados.map((producto, index) => (
//               <tr
//                 key={index}
//                 className={`${
//                   index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                 } hover:bg-gray-100`}
//               >
//                 <td></td>
//                 <td className="px-6 py-3 border-b">{producto.nombre}</td>
//                 <td className="px-6 py-3 border-b">
//                   {/* Campo estilizado */}
//                   <input
//                     type="text"
//                     value={producto.cantidad}
//                     onInput={(e) =>
//                       handleEditarProducto(
//                         producto.id,
//                         "cantidad",
//                         parseInt(e.currentTarget.value) || 1
//                       )
//                     }
//                     className="w-full p-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                 </td>
//                 <td className="px-6 py-3 border-b">
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01" // Permite valores decimales
//                     value={producto.precio} // No formateamos para mantener el valor en tiempo real
//                     onChange={(e) => {
//                       const valor = e.target.value === "" ? "" : parseFloat(e.target.value); // Permite 0 y vacío
//                       handleEditarProducto(producto.id, "precio", valor === "" ? 0 : valor); // Usa 0 si está vacío
//                     }}
//                     className="w-full p-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
//                     style={{WebkitAppearance: "none"}} // Para navegadores como Firefox y Safari
//                   />
//                 </td>
//                 <td className="px-6 py-3 border-b">
//                   S/.{(producto.cantidad * producto.precio).toFixed(2)}
//                 </td>
//               </tr>
//             ))}
//             <tr className="bg-gray-100 font-bold">
//               <td colSpan={3} className="px-6 py-3 text-right">
//                 Total
//               </td>
//               <td className="px-6 py-3"> S/.{calcularTotal().toFixed(2).replace('.', ',')}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DetailsComponent;
