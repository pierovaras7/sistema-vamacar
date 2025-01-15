import { Notificacion } from "@/hooks/useNotificaciones"
import { Inventario, User } from "@/types"
import { ExclamationCircleIcon } from "@heroicons/react/16/solid"
import Image from "next/image"
import Router, { useRouter } from "next/navigation"
import { useState } from "react"

interface NavbarProps {
  user: User | null
  notificaciones: Notificacion[] | undefined
}

const Navbar: React.FC<NavbarProps> = ({ user, notificaciones }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router  = useRouter();

  return (
    <div className="flex items-center gap-6 p-4 justify-end w-full relative">
      <div
        className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        <Image src="/announcement.png" alt="" width={20} height={20} />
        <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
          {notificaciones?.length}
        </div>
      </div>

      {/* Dropdown que aparece al hacer clic */}
      {isDropdownOpen && (
        <div className="absolute top-14 right-0 bg-white shadow-lg rounded-md w-64 md:w-96 p-2 z-50">
          <h3 className="text-sm font-bold mb-2">Notificaciones</h3>
          <ul className="space-y-2">
            {notificaciones && notificaciones.length > 0 ? (
              notificaciones.map((notificacion, index) => (
                <li
                  key={index}
                  className={`border px-1 py-3 text-xs grid grid-cols-12 items-center justify-center ${
                    notificacion.tipo === "STOCK"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-white text-gray-700"
                  }`}
                  onClick={() => {
                    // Asegúrate de que la notificación tenga la propiedad 'ruta' o algo similar
                    setIsDropdownOpen(false);
                    router.push(notificacion.ruta); // Redirige a la ruta definida en la notificación
                  }}
                >
                  <div className="col-span-2 flex justify-center items-center">
                    <ExclamationCircleIcon className="h-5 w-5" />
                  </div>
                  <div className="col-span-10 flex justify-center">
                    {notificacion.mensaje}
                  </div>
                </li>
              ))
              
            ) : (
              <li className="text-sm text-gray-500">No hay notificaciones</li>
            )}
          </ul>
        </div>
      )}

        <div className='flex flex-col'>
          <span className="text-xs leading-3 font-medium">{user?.name}</span>
          <span className="text-[10px] text-gray-500 text-right">{user?.username}</span>
        </div>
        <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/>
    </div>

  )
}

export default Navbar