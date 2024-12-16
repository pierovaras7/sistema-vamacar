"use client";
import PrivateRoute from "@/components/PrivateRoute";
import { useState, useEffect } from "react";

const PermisosPage = () => {
  const [users, setUsers] = useState<any[]>([]); // Lista de usuarios
  const [modules, setModules] = useState<any[]>([]); // Módulos disponibles
  const [selectedUser, setSelectedUser] = useState<number | null>(null); // Usuario seleccionado
  const [selectedModules, setSelectedModules] = useState<number[]>([]); // Módulos seleccionados para el usuario
  const [error, setError] = useState<string>(""); // Mensaje de error

  // Cargar los usuarios
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users || []); // Asegúrate de que users sea un array
      })
      .catch((error) => {
        setError("Error al obtener los usuarios");
      });
  }, []);

  // Cargar los módulos disponibles desde la API
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setModules(data || []); // Asegura que los módulos se almacenen correctamente
      })
      .catch((error) => {
        setError("Error al obtener los módulos disponibles");
      });
  }, []);

  // Cargar los módulos asignados al usuario seleccionado
  useEffect(() => {
    if (selectedUser !== null) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/${selectedUser}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          const assignedModules = data.modules || [];
          // Solo guardamos los ids de los módulos asignados
          setSelectedModules(assignedModules.map((module: any) => module.id));
        })
        .catch((error) => {
          setError("Error al obtener los módulos asignados");
        });
    }
  }, [selectedUser]);

  // Función para agregar un módulo a los permisos del usuario
  const handleAddModule = (moduleId: number) => {
    if (!selectedModules.includes(moduleId)) {
      setSelectedModules((prevModules) => [...prevModules, moduleId]);
    }
  };

  // Función para eliminar un módulo de los permisos del usuario
  const handleRemoveModule = (moduleId: number) => {
    setSelectedModules((prevModules) =>
      prevModules.filter((id) => id !== moduleId)
    );
  };

  // Función para guardar los permisos del usuario
  const handleSavePermissions = () => {
    if (selectedUser !== null) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/${selectedUser}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modules: selectedModules,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert("Permisos guardados correctamente");
        })
        .catch((error) => {
          alert("Error al guardar los permisos");
        });
    }
  };

  // Función para obtener el nombre del módulo usando su ID
  const getModuleNameById = (moduleId: number) => {
    const module = modules.find((mod) => mod.id === moduleId);
    return module ? module.name : "Módulo no encontrado";
  };

  return (
    <PrivateRoute requiredSlug="permisos">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-center mb-6">
          Asignar Permisos a Usuario
        </h1>

        {/* Selector de usuario */}
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">
            Selecciona un usuario
          </label>
          <select
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Selecciona un usuario
            </option>
            {users.map((user) => (
              <option key={user.idUser} value={user.idUser}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mostrar los módulos asignados al usuario */}
        {selectedUser !== null && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Módulos asignados</h2>
            <ul className="space-y-2">
              {selectedModules.length > 0 ? (
                selectedModules.map((moduleId) => {
                  const foundModule = modules.find((mod) => mod.id === moduleId);
                  return (
                    <li
                      key={moduleId}
                      className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
                    >
                      <span>{foundModule?.name || "Nombre no disponible"}</span>
                      <button
                        onClick={() => handleRemoveModule(moduleId)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="text-gray-500">No hay módulos asignados.</li>
              )}
            </ul>
          </div>
        )}

        {/* Agregar más módulos */}
        {selectedUser !== null && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Agregar módulos</h2>
            <ul className="space-y-2">
              {modules
                .filter((module) => !selectedModules.includes(module.id)) // Filtra los módulos ya asignados
                .map((module) => (
                  <li
                    key={module.id}
                    className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
                  >
                    <span>{module.name}</span>
                    <button
                      onClick={() => handleAddModule(module.id)}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Agregar
                    </button>
                  </li>
                ))}
              {modules.filter((module) => !selectedModules.includes(module.id))
                .length === 0 && (
                <li className="text-gray-500">
                  No hay más módulos disponibles para asignar.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Botón para guardar permisos */}
        <div className="mt-4 text-center">
          <button
            onClick={handleSavePermissions}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Guardar permisos
          </button>
        </div>

        {/* Mostrar errores */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </PrivateRoute>
  );
};

export default PermisosPage;
