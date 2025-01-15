// DetailsTableComponent.tsx
import { Producto } from "@/types";
import React from "react";



type DetailsTableComponentProps = {
  detallesVentaAgregados: DetailVenta[]; // Usamos DetailVenta en vez de Producto
  handleEditarDetalle: (
    detalleVenta: DetailVenta, // Cambié de producto a detalleVenta
    campo: "cantidad" | "precio",
    valor: number
  ) => void;
  calcularTotal: () => number;
  handleEliminarDetalle: (detalleVenta: DetailVenta) => void; // Cambié de producto a detalleVenta
};

const DetailsTableComponent: React.FC<DetailsTableComponentProps> = ({
  detallesVentaAgregados, 
  handleEditarDetalle,
  calcularTotal,
  handleEliminarDetalle
}) => {
  return (
    <div className="mt-6 w-full px-4 flex justify-center">
      <table className="w-10/12 table-auto border-collapse border border-gray-200 rounded-lg text-center">
        <thead>
          <tr className="text-left text-gray-500 text-sm bg-gray-100">
            <th></th>
            <th className="px-6 py-3 text-center border-b w-6/12">Producto</th>
            <th className="px-6 py-3 text-center border-b w-2/12">Cantidad</th>
            <th className="px-6 py-3 text-center border-b w-2/4">Precio Unitario</th>
            <th className="px-6 py-3 text-center border-b w-2/4">Total</th>
          </tr>
        </thead>
        <tbody>
          {detallesVentaAgregados.map((detalleVenta, index) => ( // Usamos detalleVenta en vez de producto
            <tr
              key={index}
              className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
            >
              <td className="px-6 py-3 border-b">
                <button
                  className="w-7 h-7 bg-gray-600 text-white rounded-md hover:bg-gray-400 tex"
                  onClick={() => handleEliminarDetalle(detalleVenta)} // Usamos detalleVenta
                >
                  X
                </button>
              </td>
              <td className="px-6 py-3 border-b">{detalleVenta.producto.descripcion}</td>
              <td className="px-6 py-3 border-b">
                {/* Campo estilizado */}
                <input
                  type="text"
                  value={detalleVenta.cantidad}
                  onInput={(e) =>
                    handleEditarDetalle(
                      detalleVenta, // Usamos detalleVenta
                      "cantidad",
                      parseInt(e.currentTarget.value) || 1
                    )
                  }
                  className="w-full p-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </td>
              <td className="px-6 py-3 border-b">
                <input
                  type="number"
                  min="0"
                  step="0.01" // Permite valores decimales
                  value={detalleVenta.precio} // Usamos el precio de DetailVenta
                  onChange={(e) => {
                    const valor = e.target.value === "" ? "" : parseFloat(e.target.value); // Permite 0 y vacío
                    handleEditarDetalle(detalleVenta, "precio", valor === "" ? 0 : valor); // Usamos detalleVenta
                  }}
                  className="w-full p-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ WebkitAppearance: "none" }} // Para navegadores como Firefox y Safari
                />
              </td>
              <td className="px-6 py-3 border-b">
                S/.{(detalleVenta.cantidad * detalleVenta.precio).toFixed(2)} {/* Usamos detalleVenta */}
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td colSpan={4} className="px-6 py-3 text-right">
              Total
            </td>
            <td className="px-6 py-3"> S/.{calcularTotal().toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DetailsTableComponent;
