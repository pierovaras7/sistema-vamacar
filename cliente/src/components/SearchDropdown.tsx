import { Producto } from "@/types";
import React, { useState, useEffect } from "react";


type SearchDropdownProps = {
  productos: Producto[];
  onSelect: (producto: Producto) => void;
  reset: boolean;  // Prop de reset
};

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  productos,
  onSelect,
  reset,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>(productos);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isListOpen, setIsListOpen] = useState(false); // Controla la visibilidad de la lista

  useEffect(() => {
    setFilteredProductos(
      productos?.filter((producto) =>
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, productos]);

  useEffect(() => {
    if (reset) {
      setSearchTerm(""); // Limpia la búsqueda
      setSelectedProducto(null); // Resetea el producto seleccionado
      setIsListOpen(false); // Cierra la lista cuando se resetee
    }
  }, [reset]);

  const handleSelectProducto = (producto: Producto) => {
    setSearchTerm(producto.descripcion); // Mantiene el nombre del producto en el input
    setSelectedProducto(producto); // Guarda el producto seleccionado
    onSelect(producto); // Llama a la función onSelect con el producto
    setIsListOpen(false); // Cierra la lista al seleccionar un producto
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsListOpen(true); // Abre la lista al escribir en el input
        }}
        placeholder="Buscar producto..."
        className="w-full px-2 py-4 border rounded-lg"
      />
      {isListOpen && searchTerm && (
        <ul className="absolute w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredProductos?.map((producto) => (
            <li
              key={producto.idProducto}
              onClick={() => handleSelectProducto(producto)}  // Llama a la función de selección
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {producto.descripcion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchDropdown;
