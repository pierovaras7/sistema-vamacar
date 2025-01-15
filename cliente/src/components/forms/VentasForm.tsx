import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Cliente, DetailVenta, Juridico, Natural, Producto, Sede, Venta } from "@/types";
import InputField from "../InputField";
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from "@heroicons/react/24/outline";
import SearchDropdown from "../SearchDropdown";
import { findCliente, saveVenta } from "@/services/ventaService";
import useAuthStore from "@/stores/AuthStore";
import { getAllSedes } from "@/services/trabajadoresService";
import { saveCliente } from "@/services/clientesService";
import { saveNatural } from "@/services/naturalesService";
import { saveJuridico } from "@/services/juridicosService";

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
  metodoPago: z.string().min(1,{
    message: "Método de pago requerido.",
  }),
  tipoVenta: z.string().min(1,{
    message: "Tipo de Venta es un campo requerido.",
  }),
  sede: z
  .string()
  .refine((value) => value.trim() !== "", {
    message: "Sede es un campo requerido."
  })
  .optional(),  // Esto permite que el campo sea opcional
    tipoCliente: z.string().min(1,{ message: "Tipo de cliente es requerido" }),
    telefono: z.string().length(9, { message: "El teléfono debe tener exactamente 9 caracteres." }),
    correo: z.string().email({ message: "Correo no válido" }),
    direccion: z.string().min(1, { message: "Dirección es requerida" }),
    estado: z.boolean().default(true),
    dni: z.string().optional(), // No aplicamos validación directa aquí
    nombres: z.string().optional(),
    apellidos: z.string().optional(),
    razonSocial: z.string().optional(),
    ruc: z.string().optional(),
    representante: z.string().optional(),
  }).superRefine((data, ctx) => {
  // Validación condicional para montoPagado solo si tipoVenta es "credito"
  if (data.tipoVenta === "credito" && data.montoPagado === undefined) {
    ctx.addIssue({
      path: ["montoPagado"], // Apunta al campo montoPagado
      message: "Monto pagado es requerido cuando el tipo de venta es 'credito'.",
      code: z.ZodIssueCode.custom,
    });
  }
  if (data.tipoCliente === "Natural") {
    // Validación para cliente natural
    if (!data.dni || data.dni.length !== 8) {
      ctx.addIssue({
        code: "custom",
        path: ["dni"],
        message: "El DNI debe tener 8 caracteres.",
      });
    }
    if (!data.nombres) {
      ctx.addIssue({
        code: "custom",
        path: ["nombres"],
        message: "Este campo es requerido",
      });
    }
    if (!data.apellidos) {
      ctx.addIssue({
        code: "custom",
        path: ["apellidos"],
        message: "Este campo es requerido",
      });
    }
  }
  if (data.tipoCliente === "Juridico") {
    // Validación para cliente jurídico
    if (!data.razonSocial) {
      ctx.addIssue({
        code: "custom",
        path: ["razonSocial"],
        message: "Este campo es requerido",
      });
    }
    if (!data.ruc) {
      ctx.addIssue({
        code: "custom",
        path: ["ruc"],
        message: "Este campo es requerido",
      });
    }
    if (!data.representante) {
      ctx.addIssue({
        code: "custom",
        path: ["representante"],
        message: "Este campo es requerido",
      });
    }
  }
});

type Inputs = z.infer<typeof schema>;

const VentasForm = ({
  data,
  productosBase,
}: {
  data?: Inputs;
  productosBase: Producto[];
}) => {
  const [showDataVenta, setShowDataVenta] = useState(true);
  const [showDataCliente, setShowDataCliente] = useState(true); 
  const [showDataDetails, setShowDataDetails] = useState(true); 
  const [detallesVentaAgregados, setDetallesVentaAgregados] = useState<DetailVenta[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [resetDropdown, setResetDropdown] = useState(false);
  const { user, isAdmin } = useAuthStore();
  const { reset } = useForm<Inputs>();
  const [cliente, setCliente] = useState<Cliente>();
  const [sedeSeleccionada, setSedeSeleccionada] = useState<Sede>(); 
  const [sedes, setSedes] = useState<Sede[]>();
  const [tipoCliente, setTipoCliente] = useState<String>();
  const [isEditing, setIsEditing] = useState(true);
  const [thereCliente, setThereCliente] = useState(false);
  

  const getSedes = async () =>{
    try {
      const response = await getAllSedes();
      setSedes(response);
    } catch {
      console.error("Error al cargar las sedes");
    }
  }

  useEffect(() => {
    getSedes();
    const ventaTemporalGuardada = localStorage.getItem("ventaTemporal");
    if (ventaTemporalGuardada) {
      const ventaTemporalData: Venta = JSON.parse(ventaTemporalGuardada);
      console.log(ventaTemporalData);
      setDetallesVentaAgregados(ventaTemporalData.detalles || []);
      setVentaTemporal(ventaTemporalData);
      setSedeSeleccionada(ventaTemporalData.sede);
      setCliente(ventaTemporalData.cliente);
      setTipoCliente(ventaTemporalData.cliente?.tipoCliente);
      setValue("tipoCliente", ventaTemporalData.cliente?.tipoCliente || "");
    }
  }, []); 

  const [ventaTemporal, setVentaTemporal] = useState<Venta>({
    fecha: new Date().toISOString().split("T")[0],
    metodoPago: "tarjeta",
    total: 0,
    tipoVenta: "contado",
    detalles: [],
    cliente: undefined,
    trabajador: user?.trabajador,
    sede: undefined,
  });

  useEffect(() => {
      actualizarDetallesVenta(detallesVentaAgregados);
  }, [detallesVentaAgregados]); 

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sedeSeleccionada = sedes?.find(sede => sede.idSede === Number(event.target.value));
    
    if (sedeSeleccionada) {
      // Anidar el objeto 'sedeSeleccionada' dentro de 'venta'
      actualizarVenta({
        sede: sedeSeleccionada, // Se pasa 'sedeSeleccionada' como un objeto anidado dentro de 'sede'
      });
    }
  };

  const dValues = {
    fecha: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
    montoPagado: undefined,      // Número predeterminado
    metodoPago: "tarjeta" as const, // Valor dentro de las opciones del enum
    tipoVenta: "contado" as const,  // Valor dentro de las opciones del enum
    total: 0
  };


  const actualizarDetallesVenta = (nuevosDetalles: DetailVenta[]) => {
    setVentaTemporal((prevVenta) => {
      const ventaActualizada = {
        ...prevVenta,
        detalles: nuevosDetalles, 
      };
      localStorage.setItem("ventaTemporal", JSON.stringify(ventaActualizada));
      return ventaActualizada;
    });
  };

  const actualizarCliente = (nuevoCliente: Partial<Cliente> | undefined) => {
    setVentaTemporal((prevVenta) => {
      const clienteActualizado = nuevoCliente
        ? { ...prevVenta.cliente, 
          ...nuevoCliente,
          natural: {
            ...prevVenta.cliente?.natural,  // Mantener valores previos de 'natural'
            dni: nuevoCliente.natural?.dni ?? prevVenta.cliente?.natural?.dni,  // Si hay nuevo 'dni', actualizarlo
            nombres: nuevoCliente.natural?.nombres ?? prevVenta.cliente?.natural?.nombres,  // Si hay nuevos 'nombres', actualizarlos
            apellidos: nuevoCliente.natural?.apellidos ?? prevVenta.cliente?.natural?.apellidos,  // Si hay nuevos 'apellidos', actualizarlos
          },
          juridico: {
            ...prevVenta.cliente?.juridico,  // Mantener valores previos de 'juridico'
            ruc: nuevoCliente.juridico?.ruc ?? prevVenta.cliente?.juridico?.ruc,  // Si hay nuevo 'ruc', actualizarlo
            razonSocial: nuevoCliente.juridico?.razonSocial ?? prevVenta.cliente?.juridico?.razonSocial,  // Si hay nuevo 'ruc', actualizarlo
            representante: nuevoCliente.juridico?.representante ?? prevVenta.cliente?.juridico?.representante,
          },
        
        } as Cliente
        : {
          tipoCliente: prevVenta.cliente?.tipoCliente,
          natural: {
            dni: prevVenta.cliente?.tipoCliente === "Natural" ? prevVenta.cliente?.natural?.dni : undefined, // Mantener el DNI si es tipo Natural
          },
          juridico: {
            ruc: prevVenta.cliente?.tipoCliente === "Jurídico" ? prevVenta.cliente?.juridico?.ruc : undefined, // Mantener el RUC si es tipo Jurídico
          }
        } as Cliente ; 
  
      const ventaActualizada = {
        ...prevVenta,
        cliente: clienteActualizado, // Asignamos el cliente actualizado (o undefined)
      };
      localStorage.setItem("ventaTemporal", JSON.stringify(ventaActualizada));
      return ventaActualizada; // Devuelve la nueva venta para actualizar el estado
    });
  };
  
  const actualizarVenta = (nuevaVenta: Partial<Venta> | undefined) => {
    setVentaTemporal((prevVenta) => {
      const ventaActualizada = {
        ...prevVenta,    
        ...nuevaVenta, // Asignamos el cliente actualizado (o undefined)
      };
      localStorage.setItem("ventaTemporal", JSON.stringify(ventaActualizada));
      return ventaActualizada; // Devuelve la nueva venta para actualizar el estado
    });
  };

  const handleInputChangeDataCliente = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
  
    // Verificamos si el nombre del campo tiene alguna relación con 'natural' o 'juridico'
    const updatedCliente: Partial<Cliente> = {};
  
    // Si el campo pertenece a 'natural', asignamos los valores a 'natural'
    if (name === "dni" || name === "nombres" || name === "apellidos") {
      updatedCliente.natural = {
        ...(updatedCliente.natural || {}), // Si ya existe 'natural', mantenemos los datos anteriores
        [name]: value, // Asignamos el valor correspondiente al campo de 'natural'
      };
    } 
    // Si el campo pertenece a 'juridico', asignamos los valores a 'juridico'
    else if (name === "ruc" || name === "razonSocial" || name === "representante") {
      updatedCliente.juridico = {
        ...(updatedCliente.juridico || {}), // Si ya existe 'juridico', mantenemos los datos anteriores
        [name]: value, // Asignamos el valor correspondiente al campo de 'juridico'
      };
    } else {
      // Si el campo no es ni de 'natural' ni de 'juridico', lo asignamos directamente
      (updatedCliente as any)[name] = value;
    }
  
    // Llamamos a actualizarCliente para que se gestione la actualización en el estado
    actualizarCliente(updatedCliente);
  };

  const handleInputChangeDataVenta = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target; // Extraer el nombre y valor del input
    
    // Usamos keyof Cliente para asegurarnos de que 'name' sea una clave válida de Cliente
    actualizarVenta({
      [name as keyof Cliente]: value, // Actualizar solo el campo que cambió, con un tipo seguro
    });
  };
  

  const handleInputChangeDNIRUC = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const dniRucValue = event.target.value;
      if (!tipoCliente) {
      console.warn("Seleccione el tipo de cliente antes de buscar.");
      return;
    }
    const minLength = 2;
    if (dniRucValue.length >= minLength) {
      try {
        const response = await findCliente(dniRucValue);
        console.log(response);
        setCliente(response);
        setThereCliente(true);
        setIsEditing(false);
      } catch (error) {
        console.error("Cliente no encontrado:", error);
        setCliente(undefined);
        setIsEditing(true);
      }
    }
  };
  
  const handleTipoClienteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTipo = event.target.value as "Natural" | "Juridico";
    handleInputChangeDataCliente(event);
    setTipoCliente(selectedTipo);
    setCliente(undefined);
  };

  useEffect(() => {
    if (cliente) {
      // Si hay cliente, se actualizan los campos
      if (tipoCliente === "Natural" && cliente.natural) {
        setValue("dni", cliente.natural.dni || "");
        setValue("nombres", cliente.natural.nombres || "");
        setValue("apellidos", cliente.natural.apellidos || "");
      }
  
      if (tipoCliente === "Juridico" && cliente.juridico) {
        setValue("ruc", cliente.juridico.ruc || "");
        setValue("razonSocial", cliente.juridico.razonSocial || "");
        setValue("representante", cliente.juridico.representante || "");
      }
  
      // Campos comunes
      setValue("telefono", cliente.telefono || "");
      setValue("correo", cliente.correo || "");
      setValue("direccion", cliente.direccion || "");
      actualizarCliente(cliente);
    } else {
      // Si no hay cliente, limpiar los campos
      setValue("nombres", "");
      setValue("apellidos", "");
      setValue("razonSocial", "");
      setValue("representante", "");
      setValue("telefono", "");
      setValue("correo", "");
      setValue("direccion", "");
      actualizarCliente(undefined);
    }
  }, [cliente]); 

  useEffect(() => {
    if (ventaTemporal) {
      setValue("fecha", ventaTemporal.fecha)
      setValue("tipoVenta", ventaTemporal.tipoVenta)
      setValue("metodoPago", ventaTemporal.metodoPago)
      setValue("montoPagado", ventaTemporal.montoPagado)
      setValue("sede", sedeSeleccionada?.idSede?.toString())
    }
  }, [ventaTemporal]); 
  
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch, 
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: dValues
  });

  const handleSelectProducto = (producto: Producto) => {
      setSelectedProducto(producto);
  };

  const handleAgregarDetalle = () => {
    if (selectedProducto) {
      const stockDisponible = Math.max(selectedProducto.stockActual || 0, 0);
      const precioVenta = Math.max(selectedProducto.precioMaxVenta || 0, 0);
  
      if (precioVenta === 0) {
        toast.error("El producto seleccionado tiene un precio inválido.");
        return;
      }
  
      const detalleVenta: DetailVenta = {
        idDetalleVenta: Date.now(),
        producto: selectedProducto,
        precio: precioVenta,
        cantidad: 1,
        subtotal: precioVenta,
      };
  
      const productoExiste = detallesVentaAgregados.find(
        (p) => p.producto.idProducto === selectedProducto.idProducto
      );
  
      let nuevosDetalles;
      if (productoExiste) {
        if (productoExiste.cantidad < stockDisponible) {
          nuevosDetalles = detallesVentaAgregados.map((p) =>
            p.producto.idProducto === selectedProducto.idProducto
              ? {
                  ...p,
                  cantidad: p.cantidad + 1,
                  subtotal: (p.cantidad + 1) * p.precio,
                }
              : p
          );
          toast.success("Producto actualizado. Cantidad + 1");
        } else {
          toast.error("No puedes agregar más de este producto, supera el stock disponible.");
          return;
        }
      } else {
        if (stockDisponible >= detalleVenta.cantidad) {
          nuevosDetalles = [...detallesVentaAgregados, detalleVenta];
          toast.success("Producto agregado correctamente.");
        } else {
          toast.error("No puedes agregar este producto, no hay suficiente stock disponible.");
          return;
        }
      }
      setDetallesVentaAgregados(nuevosDetalles);
    }
    setSelectedProducto(null);
    setResetDropdown(true);
  };

  const handleEditarDetalle = (
    detalleVenta: DetailVenta, 
    campo: "cantidad" | "precio", 
    valor: number 
  ) => {
    const stockDisponible = detalleVenta.producto?.stockActual !== undefined && detalleVenta.producto?.stockActual !== null
      ? detalleVenta.producto.stockActual
      : 0;
    if (campo === "cantidad") {
      if (valor <= stockDisponible) {
        setDetallesVentaAgregados((prev) =>
          prev.map((detalle) =>
            detalle.idDetalleVenta === detalleVenta.idDetalleVenta
              ? {
                  ...detalle,
                  cantidad: valor, 
                  subtotal: valor * detalle.precio, 
                }
              : detalle 
          )
        );
      } else {
        // Si la cantidad supera el stock disponible, mostramos un error
        toast.error("La cantidad no puede ser mayor que el stock disponible.");
      }
    } else if (campo === "precio") {
      // Si estamos editando el precio, actualizamos el detalle sin necesidad de comprobar el stock
      setDetallesVentaAgregados((prev) =>
        prev.map((detalle) =>
          detalle.idDetalleVenta === detalleVenta.idDetalleVenta // Comparar por el ID único
            ? {
                ...detalle,
                precio: valor, // Actualizamos el precio
                subtotal: detalle.cantidad * valor, // Recalculamos el subtotal
              }
            : detalle // Si no es el detalle a actualizar, lo dejamos igual
        )
      );
      toast.success(`Precio actualizado a ${valor}.`);
    }
  };
  
  const handleEliminarDetalle = (detalleVenta: DetailVenta) => {
    setDetallesVentaAgregados(detallesVentaAgregados.filter((detalle) => detalle !== detalleVenta));
  };

  const calcularTotal = () => {
      return detallesVentaAgregados.reduce(
        (total, detalleVenta) => total + (detalleVenta.subtotal || 0),
        0
      );
  };

  useEffect(() => {
    setValue("total", calcularTotal());
  }, [calcularTotal]); 

  const onSubmit = handleSubmit(async (data) => {
    if (detallesVentaAgregados.length === 0) {
      toast.warning("Ingrese productos a la venta.");
      return;
    }
  
    let clienteVenta: Cliente | undefined; // Cambiamos a un objeto Cliente
  
    try {
      if (cliente) {
        // Si hay un cliente, asignamos a clienteVenta
        console.log("hay un cliente encontrado", cliente);
        clienteVenta = cliente; // Asignar el cliente existente
      } else {
        // Si no existe cliente, creamos uno nuevo
        try {
          const clienteNuevo: Cliente = {
            tipoCliente: data.tipoCliente,
            telefono: data.telefono,
            correo: data.correo,
            direccion: data.direccion,
            estado: true,
          };
  
          const savedCliente = await saveCliente(clienteNuevo);
          console.log("Cliente creado:", savedCliente);
          clienteVenta = savedCliente.clienteSaved; // Asignar el cliente creado
  
          // Creamos cliente Natural o Jurídico según corresponda
          if (data.tipoCliente === "Natural") {
            const clienteNatural: Natural = {
              nombres: data.nombres!,
              apellidos: data.apellidos!,
              dni: data.dni!,
              idCliente: savedCliente.idCliente, // Asegúrate de que esto esté correcto
              estado: true,
            };
            await saveNatural(clienteNatural);
            console.log("Natural cliente guardado:", clienteNatural);
          } else {
            const clienteJuridico: Juridico = {
              razonSocial: data.razonSocial!,
              ruc: data.ruc!,
              idCliente: savedCliente.idCliente, // Asegúrate de que esto esté correcto
              representante: data.representante!,
              estado: true,
            };
            await saveJuridico(clienteJuridico);
            console.log("Juridico cliente guardado:", clienteJuridico);
          }
        } catch (error: any) {
          // Manejo de errores
          const errorMessage = error.message ? error.message : 'Error desconocido';
          try {
            const validationErrors = JSON.parse(errorMessage);
            if (validationErrors) {
              Object.keys(validationErrors).forEach((field) => {
                const messages = validationErrors[field];
                messages.forEach((msg: string) => {
                  const cleanMessage = msg.replace(/^.*?:\s*/, '');
                  toast.error(cleanMessage);
                });
              });
            }
          } catch (e) {
            toast.error(errorMessage);
          }
        }
      }
  
      // Aquí usamos `clienteVenta` para crear la venta
      const venta: Venta = {
        fecha: data.fecha,
        metodoPago: data.metodoPago,
        total: data.total,
        tipoVenta: data.tipoVenta,
        detalles: detallesVentaAgregados,
        ...(data.tipoVenta === "credito" && data.montoPagado !== undefined && { montoPagado: data.montoPagado }),
        trabajador: user?.trabajador,
        sede: sedeSeleccionada ?? user?.trabajador?.sede,
        cliente: clienteVenta // Usamos el objeto cliente
      };
  
      console.log(venta);
  
      await saveVenta(venta);  // Guardamos la venta
      toast.success("Venta creada exitosamente");
    } catch (error: any) {
      const errorMessage = error.message ? error.message : 'Error desconocido';
      try {
        const validationErrors = JSON.parse(errorMessage);
        if (validationErrors) {
          Object.keys(validationErrors).forEach((field) => {
            const messages = validationErrors[field];
            messages.forEach((msg: string) => {
              const cleanMessage = msg.replace(/^.*?:\s*/, '');
              toast.error(cleanMessage);
            });
          });
        }
      } catch (e) {
        toast.error(errorMessage);
      }
    }
  
    toast.success("Venta registrada exitosamente.");
    reset(dValues);
    setDetallesVentaAgregados([]);
    setShowDataVenta(true);
  });

  return (
    <div className="w-full flex justify-center">
      <form className="w-full flex-col" onSubmit={onSubmit}>
      <div className="flex flex-col">
        {/* Sección de Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-12">
        <h1 className="md:col-span-8 text-xl font-semibold">Datos del Cliente</h1>
        <div
            className="text-center md:col-span-4 flex justify-end items-center gap-2 cursor-pointer"
            onClick={() => setShowDataCliente((prev) => !prev)}
          >
            <span className="text-sm font-medium">
              {showDataCliente ? "Ocultar sección" : "Mostrar sección"}
            </span>
            {showDataCliente ? (
              <ChevronDoubleUpIcon className="h-6 w-6 text-green-600" />
            ) : (
              <ChevronDoubleDownIcon className="h-6 w-6 text-gray-400" />
            )}
          </div>
      </div>
      <div
          className={`col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 py-6 transition-all duration-500 ease-in-out transform overflow-hidden ${
            showDataCliente
              ? "max-h-[1000px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 translate-y-4"
          }`}
        >
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 px-2"> */}
          <div className="flex flex-col gap-2 px-2 w-full">
            <label className="text-sm font-medium text-gray-700">Tipo de Cliente</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
              {...register("tipoCliente")}
              onChange={handleTipoClienteChange}
            >
              <option value="">Seleccione</option>
              <option value="Natural">Natural</option>
              <option value="Juridico">Jurídico</option>
            </select>
            {errors.tipoCliente && (
              <p className="text-xs text-red-400">{errors.tipoCliente.message}</p>
            )}
          </div>
          
          {tipoCliente === "Natural" && (
            <>
              <InputField label="DNI" name="dni" register={register} error={errors?.dni} disabled={!tipoCliente} onInput={handleInputChangeDNIRUC} onChange={handleInputChangeDataCliente}/>
              <InputField label="Nombres" name="nombres" register={register} error={errors?.nombres}  disabled={!tipoCliente || !isEditing} onChange={handleInputChangeDataCliente}/>
              <InputField label="Apellidos" name="apellidos" register={register} error={errors?.apellidos}  disabled={!tipoCliente || !isEditing} onChange={handleInputChangeDataCliente}/>
            </>
          )}

          {tipoCliente === "Juridico" && (
            <>
              <InputField label="RUC" name="ruc" register={register} error={errors?.ruc} disabled={!tipoCliente} onInput={handleInputChangeDNIRUC} onChange={handleInputChangeDataCliente}/>
              <InputField label="Razón Social" name="razonSocial" register={register} error={errors?.razonSocial}  disabled={!tipoCliente || !isEditing} onChange={handleInputChangeDataCliente}/>
              <InputField label="Representante" name="representante" register={register} error={errors?.representante}  disabled={!tipoCliente || !isEditing} onChange={handleInputChangeDataCliente}/>
            </>
          )}

          <InputField label="Teléfono" name="telefono" register={register} error={errors?.telefono} disabled={!tipoCliente || !isEditing} onChange={handleInputChangeDataCliente}
          />
          <InputField label="Correo" name="correo" register={register} error={errors?.correo} disabled={!tipoCliente || !isEditing} onChange={handleInputChangeDataCliente}/>
          <InputField label="Dirección" name="direccion" register={register} error={errors?.direccion} disabled={!tipoCliente || !isEditing} onChange={handleInputChangeDataCliente}/>
      </div>
    </div>
        {/* Puedes controlar si el modal se debe abrir en toda la página aquí */}
       
      {/* Sección de Datos de la venta */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-12">
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
            onChange={handleInputChangeDataVenta}
          />
          <div className="flex flex-col gap-2 px-2 w-full">
            <label className="text-sm text-gray-500">Tipo de Venta</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
              {...register("tipoVenta")}
              onChange={handleInputChangeDataVenta}
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
                    onChange={handleInputChangeDataVenta}
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
              onChange={handleInputChangeDataVenta}
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
              <option value="">
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
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-12">
          <h1 className="md:col-span-8 text-xl font-semibold flex flex-col justify-centerr">Detalles de Venta</h1>
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
        </div>
        <div>
          <div
            className={`col-span-12 grid grid-cols-1 gap-4 py-6 transition-all duration-500 ease-in-out transform overflow-hidden ${
              showDataDetails
                ? "max-h-[1000px] opacity-100 translate-y-0"
                : "max-h-0 opacity-0 translate-y-4"
            }`}
          >
              <div className="flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-12 w-full gap-2 mb-4">
                      <div className="md:col-span-10">
                          <SearchDropdown
                          productos={productosBase}
                          onSelect={handleSelectProducto}
                          reset={resetDropdown}
                      />
                      </div>
                      <button type="button" className="h-10 md:h-full md:col-span-2 bg-blue-800 hover:bg-blue-600 text-white rounded-md"
                          onClick={() => {
                              handleAgregarDetalle()
                          }}
                      >
                          Seleccionar
                      </button>
                  </div>
                  <div className="overflow-x-auto">
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
    value={detalleVenta.cantidad === 0 ? "" : detalleVenta.cantidad}
    onInput={(e) => {
      const newValue = e.currentTarget.value;
      handleEditarDetalle(
        detalleVenta,
        "cantidad",
        newValue === "" ? 0 : parseInt(newValue, 10)
      );
    }}
    onBlur={(e) => {
      if (e.currentTarget.value === "") {
        handleEditarDetalle(detalleVenta, "cantidad", 1); // Valor predeterminado al salir del input
      }
    }}
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
              </div>
          <div>

          </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col items-center h-10">
        <button
            type="submit"
            className="bg-blue-800 hover:bg-blue-600 text-white rounded-md w-full md:w-1/4 h-8 md:h-full"
        >
        Registrar Venta
        </button>
      </div>
    
      </form>
    </div>
  );
};

export default VentasForm;
