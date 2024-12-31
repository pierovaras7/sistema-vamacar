import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { DetailVenta, Producto, Sede, Venta } from "@/types";
import InputField from "../InputField";
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from "@heroicons/react/24/outline";
import SearchDropdown from "../SearchDropdown";
import { saveVenta } from "@/services/ventaService";
import useAuthStore from "@/stores/AuthStore";
import { getAllSedes } from "@/services/trabajadoresService";

const schema = z.object({
  fecha: z.string().min(1, { message: "Fecha de venta es requerida." }),
  montoPagado: z
    .coerce
    .number({
      invalid_type_error: "Monto pagado debe ser un número.",
    })
    .min(0)
    .optional(),
  total: z.number().min(0),
  metodoPago: z.enum(["efectivo", "tarjeta", "yape", "plin"], {
    message: "Método de pago requerido.",
  }),
  tipoVenta: z.enum(["contado", "credito"], {
    message: "Tipo de Venta es un campo requerido.",
  }),
  sede: z
  .string()
  .refine((value) => value.trim() !== "", {
    message: "Sede es un campo requerido."
  })
  .optional()  // Esto permite que el campo sea opcional
  }).superRefine((data, ctx) => {
  // Validación condicional para montoPagado solo si tipoVenta es "credito"
  if (data.tipoVenta === "credito" && data.montoPagado === undefined) {
    ctx.addIssue({
      path: ["montoPagado"], // Apunta al campo montoPagado
      message: "Monto pagado es requerido cuando el tipo de venta es 'credito'.",
      code: z.ZodIssueCode.custom,
    });
  }
});


type Inputs = z.infer<typeof schema>;

type VentaFormProps = {
  productosBase: Producto[]
}

const VentasForm = ({
  data,
  productosBase,
}: {
  data?: Inputs;
  productosBase: Producto[];
}) => {
  const [showDataVenta, setShowDataVenta] = useState(true);
  const [showDataCliente, setShowDataCliente] = useState(true); // Estado para la sección de cliente
  const [showDataDetails, setShowDataDetails] = useState(true); // Estado para la sección de detalles
  const [detallesVentaAgregados, setDetallesVentaAgregados] = useState<DetailVenta[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [resetDropdown, setResetDropdown] = useState(false);
  const { user, isAdmin } = useAuthStore();

  const { reset } = useForm<Inputs>();

  const [sedeSeleccionada, setSedeSeleccionada] = useState<Sede>(); 
    const [sedes, setSedes] = useState<Sede[]>();
  
    const getSedes = async () =>{
      try {
        const response = await getAllSedes();
        setSedes(response);
      } catch {
        console.error("Error al cargar las sedes");
      }
    }
  
    useEffect(()=>{
      getSedes();
    },[])
  
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const sedeSeleccionada = sedes?.find(sede => sede.idSede === Number(event.target.value));
      if (sedeSeleccionada) {
        setSedeSeleccionada(sedeSeleccionada);
      }
    };

  // Valores predeterminados
  const dValues = {
    fecha: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
    montoPagado: undefined,      // Número predeterminado
    metodoPago: "tarjeta" as const, // Valor dentro de las opciones del enum
    tipoVenta: "contado" as const,  // Valor dentro de las opciones del enum
    total: 0
  };

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch, // Agregar watch aquí
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: dValues
  });

  const onSubmit = handleSubmit(async (data) => {

    if(detallesVentaAgregados.length == 0){
      toast.warning("Ingrese productos a la venta.");
      return;
    }

    try{
      const venta: Venta = {
        fecha: data.fecha,
        metodoPago: data.metodoPago,
        total: data.total,
        tipoVenta: data.tipoVenta,
        detalles: detallesVentaAgregados,
        ...(data.tipoVenta === "credito" && data.montoPagado !== undefined && { montoPagado: data.montoPagado }),
        trabajador: user?.trabajador,
        sede: sedeSeleccionada ?? user?.trabajador?.sede
      };
      
      console.log(venta);
      
      await saveVenta(venta);
      toast.success("Venta creada exitosamente");
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

    toast.success("Venta registrada exitosamente.");
    reset(dValues);
    setDetallesVentaAgregados([]);
    setShowDataVenta(true);
  });
  

  const handleSelectProducto = (producto: Producto) => {
      setSelectedProducto(producto);
  };
  
  const handleAgregarProducto = () => {
    if (selectedProducto) {
      const detalleVenta: DetailVenta = {
        idDetalleVenta: Date.now(), // Asignar un ID único para el detalle de la venta
        producto: selectedProducto,
        precio: selectedProducto.precioMaxVenta, // Usamos el precio del producto directamente en el detalle
        cantidad: 1, // Inicializamos con cantidad 1
        subtotal: selectedProducto.precioMaxVenta * 1, // Inicializamos el subtotal (cantidad * precio)
      };

      // Aquí buscamos por producto.idProducto en lugar de idProducto directamente
      const productoExiste = detallesVentaAgregados.find(
        (p) => p.producto.idProducto === selectedProducto.idProducto
      );

      if (productoExiste) {
        setDetallesVentaAgregados((prev) =>
          prev.map((p) =>
            p.producto.idProducto === selectedProducto.idProducto
              ? { 
                  ...p, 
                  cantidad: p.cantidad + 1, 
                  subtotal: (p.cantidad + 1) * p.precio // Actualizamos el subtotal
                }
              : p
          )
        );
      } else {
        setDetallesVentaAgregados((prev) => [...prev, detalleVenta]);
      }
    }
    setSelectedProducto(null);
    setResetDropdown(true); // Resetea el dropdown
  };
  
    // Función para editar el detalle de venta
    const handleEditarDetalle = (
      detalleVenta: DetailVenta, // El detalle de venta completo
      campo: "cantidad" | "precio", // El campo que queremos editar
      valor: number // El nuevo valor para el campo
    ) => {
      setDetallesVentaAgregados((prev) =>
        prev.map((detalle) =>
          detalle.idDetalleVenta === detalleVenta.idDetalleVenta // Comparar por el ID único
            ? {
                ...detalle,
                [campo]: valor, // Actualizamos el campo especificado
                subtotal: campo === "cantidad"
                  ? valor * detalle.precio // Si editamos la cantidad, recalculamos el subtotal
                  : detalle.cantidad * valor, // Si editamos el precio, recalculamos el subtotal
            }
            : detalle // Si no es el detalle a actualizar, lo dejamos igual
        )
      );
    };
  
    const calcularTotal = () => {
        return detallesVentaAgregados.reduce(
          (total, detalleVenta) => total + (detalleVenta.subtotal || 0),
          0
        );
      };
      
    const handleEliminarDetalle = (detalleVenta: DetailVenta) => {
      setDetallesVentaAgregados((prev) => prev.filter((detalle) => detalle !== detalleVenta));
    };

  // Dentro de tu componente o efecto
  useEffect(() => {
    setValue("total", calcularTotal());
  }, [calcularTotal]); 

  return (
    <div className="w-full flex justify-center">
      <form className="w-full md:w-3/4 grid grid-cols-2 md:grid-cols-12" onSubmit={onSubmit}>

      {/* Sección de cliente */}
      {/* <h1 className="md:col-span-8 text-xl font-semibold flex flex-col justify-center">Datos del Cliente</h1>
        <div
          className="text-center md:col-span-4 flex justify-end items-center gap-2 cursor-pointer"
          onClick={() => setShowDataCliente((prev) => !prev)}
        >
          <span className="text-sm font-medium">
            {showDataCliente ? "Ocultar cliente" : "Mostrar cliente"}
          </span>
          {showDataCliente ? (
            <ChevronDoubleUpIcon className="h-6 w-6 text-green-600" />
          ) : (
            <ChevronDoubleDownIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>

        <div
          className={`col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 py-6 transition-all duration-500 ease-in-out transform overflow-hidden ${
            showDataCliente
              ? "max-h-[1000px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 translate-y-4"
          }`}
        >
          <InputField
            label="Cliente"
            name="cliente"
            type="text"
            register={register}
            error={errors?.cliente}
          />
        </div> */}
      
      
       {/* Sección de Datos de la venta */}
        <h1 className="md:col-span-8 text-xl font-semibold flex flex-col justify-center">Datos de la venta</h1>
        <div
          className="text-center md:col-span-4 flex justify-end items-center gap-2 cursor-pointer"
          onClick={() => setShowDataVenta((prev) => !prev)}
        >
          <span className="text-sm font-medium">
            {showDataVenta ? "Ocultar sección" : "Mostrar sección"}
          </span>
          {showDataVenta ? (
            <ChevronDoubleUpIcon className="h-6 w-6 text-green-600" />
          ) : (
            <ChevronDoubleDownIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>

        <div
          className={`col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 py-6 transition-all duration-500 ease-in-out transform overflow-hidden ${
            showDataVenta
              ? "max-h-[1000px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 translate-y-4"
          }`}
        >
          <InputField
            label="Fecha de Venta"
            name="fecha"
            type="date"
            register={register}
            error={errors?.fecha}
          />
          <div className="flex flex-col gap-2 px-2 w-full">
            <label className="text-sm text-gray-500">Tipo de Venta</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
              {...register("tipoVenta")}
            >
              <option value="contado">Contado</option>
              <option value="credito">Credito</option>
            </select>
            {errors.tipoVenta?.message && (
              <p className="text-xs text-red-400">{errors.tipoVenta.message}</p>
            )}
          </div>
            {watch("tipoVenta") === "credito" && (
                <div className="flex flex-col gap-2 px-2 w-full">
                <label className="text-sm text-gray-500">Monto Pagado</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
                    {...register("montoPagado")}
                    placeholder="Ingrese el monto a pagar"
                />
                {errors.montoPagado?.message && (
                    <p className="text-xs text-red-400">{errors.montoPagado.message}</p>
                )}
                </div>
            )}

          <div className="flex flex-col gap-2 px-2 w-full">
            <label className="text-sm text-gray-500">Método de Pago</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
              {...register("metodoPago")}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </select>
            {errors.metodoPago?.message && (
              <p className="text-xs text-red-400">{errors.metodoPago.message}</p>
            )}
          </div>

          {isAdmin && (<div className="flex flex-col gap-2 w-full px-2">
            <label className="text-sm font-medium text-gray-700">Sede</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
              {...register("sede")}
              value={sedeSeleccionada?.idSede} 
              onChange={handleChange}
            >
              <option value="" selected>
                Selecciona una sede
              </option>
              {sedes?.map((sede) => (
                <option key={sede.idSede} value={sede.idSede}>
                  {sede.direccion}
                </option>
              ))}
            </select>

            {errors.sede?.message && (
              <p className="text-sm text-red-500">{errors.sede.message}</p>
            )}

          </div>
          )}
        </div>



        <h1 className="md:col-span-8 text-xl font-semibold flex flex-col justify-center">Detalles de Venta</h1>
        {/* Sección de detalles Venta */}
        <div
          className="text-center md:col-span-4 flex justify-end items-center gap-2 cursor-pointer"
          onClick={() => setShowDataDetails((prev) => !prev)}
        >
          <span className="text-sm font-medium">
            {showDataDetails ? "Ocultar detalles" : "Mostrar detalles"}
          </span>
          {showDataDetails ? (
            <ChevronDoubleUpIcon className="h-6 w-6 text-green-600" />
          ) : (
            <ChevronDoubleDownIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>

        <div
          className={`col-span-12 grid grid-cols-1 gap-4 py-6 transition-all duration-500 ease-in-out transform overflow-hidden ${
            showDataDetails
              ? "max-h-[1000px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 translate-y-4"
          }`}
        >
            <div className="flex flex-col">
                <div className="grid grid-cols-12 w-full gap-2 mb-4">
                    <div className="col-span-10">
                        <SearchDropdown
                        productos={productosBase}
                        onSelect={handleSelectProducto}
                        reset={resetDropdown}
                    />
                    </div>
                    <button type="button" className="col-span-2 bg-blue-800 hover:bg-blue-600 text-white rounded-md"
                        onClick={() => {
                            handleAgregarProducto()
                        }}
                    >
                        Seleccionar
                    </button>
                </div>
                
                <table className="w-full table-auto border-collapse border border-gray-200 rounded-lg text-center">
                    <thead>
                    <tr className="text-left text-gray-500 text-sm bg-gray-100">
                        <th></th>
                        <th className="px-6 py-3 text-center border-b w-6/12">Producto</th>
                        <th className="px-6 py-3 text-center border-b w-2/12">Cantidad</th>
                        <th className="px-6 py-3 text-center border-b w-2/4">Precio Unitario</th>
                        <th className="px-6 py-3 text-center border-b w-2/4">Subtotal</th>
                    </tr>
                    </thead>
                    <tbody>
                    {detallesVentaAgregados.map((detalleVenta, index) => (
                        <tr
                        key={index}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
                        >
                        <td className="px-6 py-3 border-b">
                            <button
                            className="w-7 h-7 bg-gray-600 text-white rounded-md hover:bg-gray-400 tex"
                            onClick={() => handleEliminarDetalle(detalleVenta)}
                            >
                            X
                            </button>
                        </td>
                        <td className="px-6 py-3 border-b">{detalleVenta.producto.codigo} - {detalleVenta.producto.descripcion}</td>
                        <td className="px-6 py-3 border-b">
                            <input
                            type="text"
                            value={detalleVenta.cantidad}
                            onInput={(e) =>
                                handleEditarDetalle(
                                detalleVenta,
                                "cantidad",
                                parseInt(e.currentTarget.value) || 1
                                )
                            }
                            className="w-full p-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </td>
                        <td className="px-6 py-3 border-b">
                            <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={detalleVenta.precio}
                            onChange={(e) => {
                                const valor = e.target.value === "" ? "" : parseFloat(e.target.value);
                                handleEditarDetalle(detalleVenta, "precio", valor === "" ? 0 : valor);
                            }}
                            className="w-full p-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                            style={{ WebkitAppearance: "none" }}
                            />
                        </td>
                        <td className="px-6 py-3 border-b">
                            {(detalleVenta.cantidad * detalleVenta.precio).toFixed(2)}
                        </td>
                        </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={4} className="px-6 py-3 text-right">
                        Total
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          className="bg-gray-100 font-bold w-1/2 text-center"
                          value={calcularTotal()} // O actualizar el estado con setValue
                          readOnly // Para evitar edición manual
                        />
                      </td>
                    </tr>

                    </tbody>
                </table>
            </div>
        <div>

        </div>
        </div>
        
        <button
            type="submit"
            className="col-span-2 bg-blue-800 hover:bg-blue-600 text-white rounded-md"
        >
        Registrar Venta
        </button>
      </form>
    </div>
  );
};

export default VentasForm;
