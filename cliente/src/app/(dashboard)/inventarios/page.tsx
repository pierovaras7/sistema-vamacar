"use client";

import { useEffect, useRef, useState } from "react";
import { Inventario } from "@/types";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { getInventarios } from "@/services/inventariosService";
import MovimientosInventario from "@/components/MovimientosInventario";
import RegistrarMovimientoInventarioModal from "@/components/RegistrarMovimientoInventarioModal";
import PrivateRoute from "@/components/PrivateRouter";
import { DocumentIcon } from "@heroicons/react/16/solid";
import { toast } from "sonner";

const columns = [
  { header: "Cod Producto", accessor: "producto.cod", width: "w-3/12" },
  { header: "Descripcion", accessor: "producto.descripcion", width: "w-3/12" },
  { header: "Stock Minimo", accessor: "stockMinimo", width: "w-2/12" },
  { header: "Stock Actual", accessor: "stockActual", width: "w-2/12" },
  { header: "Acciones", accessor: "acciones", width: "w-2/12" },
];

const InventariosPage = () => {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
 const [uploadErrors, setUploadErrors] = useState<{ row: any; error: string[] }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInventarios = async () => {
    setLoading(true);
    try {
      const response = await getInventarios();
      setInventarios(response);
    } catch (error: any) {
      console.error("Error al cargar inventarios:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Aplica el filtro solo si searchTerm tiene un valor válido
  const filteredInventarios =
    searchTerm.trim() === ""
      ? inventarios
      : inventarios.filter(
          (inventario) =>
            inventario.producto?.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inventario.producto?.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const indexOfLastInventario = currentPage * perPage;
  const indexOfFirstInventario = indexOfLastInventario - perPage;
  const currentInventarios = filteredInventarios.slice(indexOfFirstInventario, indexOfLastInventario);

  const totalPages = Math.ceil(filteredInventarios.length / perPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const renderRow = (item: Inventario) => (
    <tr key={item.idInventario} className="border-b border-gray-200 even:bg-slate-50 text-xs md:text-md hover:bg-lamaPurpleLight">
      <td className="p-4">{item.producto?.codigo}</td>
      <td>{item.producto?.descripcion}</td>
      <td>{item.stockMinimo}</td>
      <td>{item.stockActual}</td>
      <td className="flex justify-around items-center px-4 py-2">
        <RegistrarMovimientoInventarioModal inventario={item} onUpdate={fetchInventarios}/>
        <MovimientosInventario data={item.movs_inventario} codigo={item.producto?.codigo}/>
      </td>
    </tr>
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => 
    {
        const file = event.target.files ? event.target.files[0] : null;
  
        // Verifica si hay un archivo antes de enviar la solicitud
        if (!file) {
            alert("Por favor, selecciona un archivo.");
            return;
        }
  
        const formData = new FormData();
        formData.append("file", file);
  
        setIsUploading(true);
  
        try {
            const response = await fetch("http://localhost:8000/api/auth/inventarios/import", {
                method: "POST",
                body: formData,
            });
  
            const result = await response.json();
  
            console.log(result)
            if (result.errors && result.errors.length > 0) {
              setUploadErrors(result.errors); 
            } else if(result.error) {
              toast.error(result.error); 
            }else {
              toast.success(result.message); 
            }
            event.target.value = "";
            fetchInventarios();
        } catch (error) {
            console.error("Error al subir el archivo", error);
        }  finally {
          setIsUploading(false);
          setSelectedFile(null); 
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
          }
        }
    };

  useEffect(() => {
    fetchInventarios();
  }, []);

  return (
    <PrivateRoute slug="/inventarios">
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="hidden md:block text-lg font-semibold">Inventarios</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="border rounded-md p-2 text-sm md:text-md"
            />
          </div>
        </div>
        <div className="flex flex-col justify-start my-3">
          <a href="https://docs.google.com/spreadsheets/d/1zZ02kd24BTvMPS4gMbleRIGFQXY9_bUq/edit?usp=sharing&ouid=107824534272396672832&rtpof=true&sd=true" target="_blank" className="text-xs underline m-2">Ver formato</a>
          <button
            className="bg-green-600 text-white text-xs p-2 rounded-md w-64 flex gap-3"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <DocumentIcon className="w-4 h-4" /> {/* Ícono de documento */}
            Ajustar inventario desde Excel
          </button>
          
          {/* Input file oculto */}
          <input
            id="fileInput"
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />      
        </div>

        {/* Tabla de inventarios */}
        <Table columns={columns} renderRow={renderRow} data={currentInventarios} />

        {/* Paginación */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

        {/* Modal para mostrar los errores */}
        {uploadErrors.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-1/2 max-h-[90vh] flex flex-col">
            
            {/* Título fijo */}
            <h2 className="text-lg font-semibold mb-4">Errores al cargar archivo</h2>
        
            {/* Contenedor scrollable */}
            <div className="overflow-y-auto max-h-64 px-2 border-t border-b">
              <ul className="space-y-2">
                {uploadErrors.map((error, index) => (
                  <li key={index} className="text-gray text-xs">
                    El producto <b>{error.row.codigo} - {error.row.descripcion}</b> no pudo cargarse correctamente. 
                    <p>Errores: {error.error}</p>
                  </li>
                ))}
              </ul>
            </div>
        
            {/* Botón fijo */}
            <button
              className="mt-4 bg-gray-300 text-black px-4 py-2 rounded-md"
              onClick={() => setUploadErrors([])} // Cerrar el modal
            >
              Cerrar
            </button>
          </div>
        </div>
        
        )}

      </div>
    </PrivateRoute>
  );
};

export default InventariosPage;