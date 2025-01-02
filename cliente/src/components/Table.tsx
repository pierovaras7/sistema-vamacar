"use client"
import React, { useState } from 'react';

const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string; width?: string; styles?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });

  // Función para manejar el cambio de orden
  const handleSort = (column: string) => {

    if (column === 'opciones') return; // Excluimos la columna "Opciones" de la ordenación

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: column, direction });
  };

  // Función para ordenar los datos
  const sortedData = React.useMemo(() => {
    const sorted = [...data];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  }, [data, sortConfig]);

  return (
    <table className="w-full mt-4 text-center">
      <thead>
      <tr className="text-left text-gray-500 text-sm">
        {columns.map((col) => (
          <th
            key={col.accessor}
            className={`${col.className} ${col.width ? col.width : 'w-auto'} text-center`}
            onClick={() => handleSort(col.accessor)} // Añadimos el evento de clic
            style={{ cursor: 'pointer' }} // Opcional: para indicar que se puede hacer clic
          >
            {col.header}
            {col.header !== "opciones" && sortConfig.key === col.accessor ? ( // Verifica si la columna no es "Opciones"
              sortConfig.direction === 'asc' ? (
                <span> ↑</span>
              ) : (
                <span> ↓</span>
              )
            ) : null}
          </th>
        ))}
      </tr>

      </thead>
      <tbody>{sortedData.map((item) => renderRow(item))}</tbody>
    </table>
  );
};

export default Table;
