import Image from "next/image";

const TableSearch = ({ onSearch }: { onSearch: (term: string) => void }) => {
  return (
    <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder="Buscar..."
        className="w-[200px] p-2 bg-transparent outline-none"
        onChange={(e) => {
          onSearch(e.target.value)
          console.log(e.target.value)
        }} // Captura el texto ingresado
      />
    </div>
  );
};

export default TableSearch;
