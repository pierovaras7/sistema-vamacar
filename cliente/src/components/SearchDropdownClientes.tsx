import { Cliente } from "@/types";
import React, { useState, useEffect } from "react";


type SearchDropdownClientesProps = {
  clientes: Cliente[];
  onSelect: (cliente: Cliente) => void;
  reset: boolean; // Prop de reset
};

const SearchDropdownClientes: React.FC<SearchDropdownClientesProps> = ({
  clientes,
  onSelect,
  reset,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>(clientes);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isListOpen, setIsListOpen] = useState(false); // Controla la visibilidad de la lista

  useEffect(() => {
    setFilteredClientes(
      clientes.filter((cliente) => {
        const searchText = searchTerm.toLowerCase();
  
        if (cliente.tipoCliente === "Natural" && cliente.natural) {
          // Filtrar por nombres, apellidos o dni si es Persona Natural
          return (
            cliente.natural.nombres.toLowerCase().includes(searchText) ||
            cliente.natural.apellidos.toLowerCase().includes(searchText) ||
            cliente.natural.dni.toLowerCase().includes(searchText) // Añadido filtro por DNI
          );
        } else if (cliente.tipoCliente === "Juridico" && cliente.juridico) {
          // Filtrar por razonSocial o ruc si es Persona Jurídica
          return (
            cliente.juridico.razonSocial.toLowerCase().includes(searchText) ||
            cliente.juridico.ruc.toLowerCase().includes(searchText) // Añadido filtro por RUC
          );
        }
  
        return false; // No se incluye si no coincide con los criterios
      })
    );
  }, [searchTerm, clientes]);
  
  

  useEffect(() => {
    if (reset) {
      setSearchTerm(""); // Limpia la búsqueda
      setSelectedCliente(null); // Resetea el cliente seleccionado
      setIsListOpen(false); // Cierra la lista cuando se resetee
    }
  }, [reset]);

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente); // Guarda el cliente seleccionado
    onSelect(cliente); // Llama a la función onSelect con el cliente
    setIsListOpen(false); // Cierra la lista al seleccionar un cliente
  };
  
  return (
    <div className="relative p-2 py-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsListOpen(true); // Abre la lista al escribir en el input
        }}
        placeholder="Buscar cliente..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
      />
      {isListOpen && searchTerm && (
        <ul className="absolute w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredClientes.map((cliente) => (
            <li
                key={cliente.idCliente}
                onClick={() => handleSelectCliente(cliente)}  // Llama a la función de selección
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
                {cliente.tipoCliente === "Natural" && cliente.natural ? (
                // Mostrar el nombre completo (nombres + apellidos) si es Persona Natural
                <div className="font-bold">
                  {cliente.natural.dni} - {cliente.natural.nombres} {cliente.natural.apellidos}
                </div>
                ) : cliente.tipoCliente === "Juridico" && cliente.juridico ? (
                // Mostrar razón social si es Persona Jurídica
                <div className="font-bold">
                   {cliente.juridico.ruc} - {cliente.juridico.razonSocial}
                </div>
                ) : null}
            </li>
            ))}
        </ul>
        )}
    </div>
  );
};

export default SearchDropdownClientes;
