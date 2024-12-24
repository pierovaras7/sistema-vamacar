// components/Search.tsx
import React from 'react';

interface SearchProps {
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const InputSearch: React.FC<SearchProps> = ({ handleSearch, placeholder }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}  // Usamos el placeholder recibido como prop
      onChange={handleSearch}
      className="w-full truncate p-2 border border-gray-300 rounded-lg text-xs"
    />
  );
};

export default InputSearch;
