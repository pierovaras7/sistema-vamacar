import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCuentaCobrar } from "@/services/cuentasCobrarService";
import { Cliente } from "@/types";
import { getAllClientes } from "@/services/clientesService";
import { toast } from "sonner";
import SearchDropdownClientes from "./SearchDropdownClientes";
import InputField from "./InputField";

const cuentaCobrarSchema = z.object({
  motivo: z.string().nonempty("El motivo es obligatorio."),
  montoCuenta: z
  .string() // Espera un string
  .transform((val) => parseFloat(val)) // Convierte el string a un número
  .refine((val) => !isNaN(val), { message: "El monto es un campo requerido." }) // Asegúrate de que sea un número
  .refine((val) => val > 0, { message: "El monto debe ser mayor a 0." }),});

type FormValues = z.infer<typeof cuentaCobrarSchema>;

interface CrearCuentaCobrarModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CrearCuentaCobrarModal: React.FC<CrearCuentaCobrarModalProps> = ({
  onClose,
  onSave,
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelected, setClienteSelected] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetDropdown, setResetDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(cuentaCobrarSchema),
  });

  const fetchClientes = async () => {
    try {
      const response = await getAllClientes();
      setClientes(response);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      if (clienteSelected) {
        await createCuentaCobrar({
          cliente: clienteSelected,
          motivo: data.motivo,
          montoCuenta: data.montoCuenta,
        });
        onSave();
        reset();
        onClose();
        toast.success("Cuenta por cobrar registrada correctamente.");
      } else {
        toast.warning("No ha elegido un cliente.");
      }
    } catch (error: any) {
      toast.error(error.toString())
      console.error("Error al crear cuenta por cobrar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setClienteSelected(cliente);
    setResetDropdown(true); // Resetea el dropdown
  };

  const handleDeselectCliente = () => {
    setClienteSelected(null);
    setResetDropdown(false); // Vuelve a habilitar el dropdown
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="px-2 text-lg font-semibold mb-4">Crear Cuenta por Cobrar</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {!clienteSelected ? (
            <SearchDropdownClientes
              clientes={clientes}
              onSelect={handleSelectCliente}
              reset={resetDropdown}
            />
          ) : (
            <div className="px-2 mb-2 w-full grid grid-cols-12">
              <div className="col-span-10">
                <div className="font-bold">Cliente Seleccionado:</div>
                <div className="my-1">
                  {clienteSelected.tipoCliente === "Natural"
                  ? `${clienteSelected.natural?.nombres} ${clienteSelected.natural?.apellidos}`
                  : clienteSelected.juridico?.razonSocial}
                </div>{" "}
              </div>
              <div className="col-span-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleDeselectCliente}
                  className="bg-red-500 font-semibold h-6 w-6 rounded-lg"
                >
                  X
                </button>
              </div>
              
            </div>
          )}

          <div className="flex flex-col gap-2 px-2 mb-2 w-full">
            <label htmlFor="motivo" className="text-sm font-medium text-gray-700">
              Detalle
            </label>
            <select
              id="motivo"
              {...register("motivo")}
              className="`border border-gray-500 rounded-md p-2 w-full">
              <option value="Prestamo">Prestamo</option>
              <option value="Deuda Pendiente">Deuda pendiente</option>
            </select>
          </div>

          <InputField
            label="Monto"
            name="montoCuenta"
            type="number"
            step={0.01}
            register={register}
            error={errors?.montoCuenta}
          />


          <div className="flex justify-end gap-4 p-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearCuentaCobrarModal;
