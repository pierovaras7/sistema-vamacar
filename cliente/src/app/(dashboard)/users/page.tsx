"use client"
import InputSearch from "@/components/InputSearch";
import PrivateRoute from "@/components/PrivateRouter";
import useModules from "@/hooks/useModules";
import { getAllUsers, getModules, updateUser } from "@/services/usersService";
import useDashboardStore from "@/stores/DashboardStore";
import { User, Module } from "@/types";
import { useState, useEffect } from "react";
import { FaPen } from "react-icons/fa";
import { toast } from "sonner";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const { modules } = useModules(); 
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatedModules, setUpdatedModules] = useState<Module[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [lastSelectedUserId, setLastSelectedUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response);
      setFilteredUsers(response); // Inicializar el estado de usuarios filtrados
      if (response.length > 0) {
        const userToSelect = lastSelectedUserId
          ? response.find(user => user.idUser === lastSelectedUserId)
          : response[0];

        setSelectedUser(userToSelect);
        setFormData({
          name: userToSelect?.name || "",
          username: userToSelect?.username || "",
          password: "**********",
        });
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setUpdatedModules(selectedUser.modules || []);
      setFormData({
        name: selectedUser.name,
        username: selectedUser.username,
        password: "**********",
      });
    }
  }, [selectedUser]);

  const handleUpdate = async () => {
    if (selectedUser) {
      const userUpdated: User = {
        idUser: selectedUser.idUser,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        modules: updatedModules,
      };
      try {
        await updateUser(userUpdated, userUpdated.idUser);
        setSelectedUser(userUpdated);
        toast.success("Usuario actualizado con éxito");
        setIsEditing(false);
        fetchUsers(); // Refresca la lista de usuarios después de la actualización
      } catch (error: any) {
        // Si tienes un error de validación con un formato JSON.stringify, procesarlo
        const errorMessage = error.message ? error.message : 'Error desconocido';
  
        try {
          const validationErrors = JSON.parse(errorMessage);
          if (validationErrors) {
            // Muestra los errores específicos de validación
            Object.keys(validationErrors).forEach((field) => {
              const messages = validationErrors[field];
              // Aquí puedes usar los mensajes de error, por ejemplo, mostrarlos en un toast o en una lista
              messages.forEach((msg: string) => {
                // Utilizamos una expresión regular para extraer el mensaje después del primer ':'
                const cleanMessage = msg.replace(/^.*?:\s*/, ''); // Esto elimina todo hasta el primer ":"
                toast.error(cleanMessage); // Mostrar el mensaje limpio en el toast
              });          
            });
          }
        } catch (e) {
          // Si no es un error de validación, muestra el error genérico
          toast.error(errorMessage);
        }
      }
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && selectedUser) {
      setFormData({
        name: selectedUser.name,
        username: selectedUser.username,
        password: "",
      });
    }
  };

  const handleModuleChange = (module: Module) => {
    setUpdatedModules((prev) =>
      prev.some((m) => m.idModule === module.idModule)
        ? prev.filter((m) => m.idModule !== module.idModule)
        : [...prev, module]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value.toLowerCase();
    setFilteredUsers(
      users.filter(user =>
        user.name.toLowerCase().includes(searchQuery)
      )
    );
  };

  return (
    <PrivateRoute slug="/users">
      <div className="bg-white p-4 rounded-lg flex flex-col md:flex-row m-4 mt-0">
        {/* Lista de Usuarios */}
        <div className="w-full md:w-1/4 bg-white border-r border-gray-300 rounded-lg mb-4 md:mb-0">
          <h2 className="text-sm md:text-xl font-bold p-4 border-b border-gray-300">Lista de Usuarios</h2>
          <div className="p-4">
            <InputSearch 
              handleSearch={handleSearch} 
              placeholder={`Buscar por nombre`} 
            />
          </div>
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li
                key={user.idUser}
                className={`truncate p-4 cursor-pointer hover:bg-gray-200 text-sm ${
                  (selectedUser && selectedUser.idUser === user.idUser) || lastSelectedUserId === user.idUser
                    ? "bg-gray-200 font-semibold"
                    : ""
                }`}
                onClick={() => {
                  setSelectedUser(user);
                  setLastSelectedUserId(user.idUser);
                  setIsEditing(false);
                  setFormData({
                    name: user.name,
                    username: user.username,
                    password: "**********",
                  });
                }}
              >
                {user.name}
              </li>
            ))}
          </ul>
        </div>
  
        {/* Detalles del Usuario */}
        <div className="w-full md:w-3/4 p-4 md:p-6">
          {selectedUser ? (
            <div>
              <h2 className="text-lg md:text-2xl font-bold mb-4 flex items-center">
                Detalles del Usuario
                <button
                  onClick={handleEditToggle}
                  className="ml-4 text-blue-600 hover:text-blue-800"
                >
                  <FaPen size={20} />
                </button>
              </h2>
  
              <form>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 font-semibold">Nombre:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border ${isEditing ? "border-gray-400" : "border-transparent"} rounded`}
                  />
                </div>
  
                <div className="mb-4">
                  <label className="text-xs text-gray-500 font-semibold">Username:</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border ${isEditing ? "border-gray-400" : "border-transparent"} rounded`}
                  />
                </div>
  
                <div className="mb-4">
                  <label className="text-xs text-gray-500 font-semibold">Password:</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border ${isEditing ? "border-gray-400" : "border-transparent"} rounded`}
                  />
                </div>
  
                <h3 className="text-lg md:text-xl font-bold mb-2">Módulos Accesibles</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4 px-2 md:px-8 py-3">
                  {modules.map((module) => (
                    <label key={module.idModule} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={updatedModules.some((m) => m.idModule === module.idModule)}
                        onChange={() => handleModuleChange(module)}
                        disabled={!isEditing}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      {module.name}
                    </label>
                  ))}
                </div>
  
                {isEditing && (
                  <div className="flex flex-col items-center md:items-end w-full">
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="px-4 py-2 w-full md:w-1/6 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <p className="text-gray-700">Selecciona un usuario para ver los detalles.</p>
          )}
        </div>
      </div>
    </PrivateRoute>
  );
  
};

export default UsersPage;
