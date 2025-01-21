import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Cliente, DetailVenta, Juridico, Natural, Producto, Venta } from "@/types";
import InputField from "../InputField";
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from "@heroicons/react/24/outline";
import SearchDropdown from "../SearchDropdown";
import { findCliente, saveVenta } from "@/services/ventaService";
import useAuthStore from "@/stores/AuthStore";
import { saveCliente, updateCliente } from "@/services/clientesService";
import useSedes from "@/hooks/useSedes";
import useVentaStore from "@/stores/VentaStore";
import { showErrorsToast } from "@/lib/functions";
import { pdf } from "@react-pdf/renderer";
import ComprobanteVenta from "../ComprobanteVenta";
import useProductos from "@/hooks/useProductos";

const schema = (isAdmin: boolean) => z
  .object({
    fecha: z.string().min(1, { message: "Fecha de venta es requerida." }),
    montoPagado: z
      .coerce
      .number({
        invalid_type_error: "Monto pagado debe ser un número.",
      })
      .min(0)
      .optional(),
    total: z.number().min(0),
    metodoPago: z.string().optional(), // Opcional por defecto
    tipoVenta: z.string().min(1, {
      message: "Tipo de Venta es un campo requerido.",
    }),
    sede: z.string().optional(), // Se valida condicionalmente en superRefine
    tipoCliente: z.string().min(1, { message: "Tipo de cliente es requerido" }),
    telefono: z.string().length(9, { message: "El teléfono debe tener exactamente 9 caracteres." }),
    correo: z.string().email({ message: "Correo no válido" }),
    direccion: z.string().min(1, { message: "Dirección es requerida" }),
    estado: z.boolean().default(true),
    dni: z.string().optional(),
    nombres: z.string().optional(),
    apellidos: z.string().optional(),
    razonSocial: z.string().optional(),
    ruc: z.string().optional(),
    representante: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validación condicional para `metodoPago`
    if (isAdmin && (!data.sede || data.sede.trim() === "")) {
      ctx.addIssue({
        path: ["sede"],
        message: "Sede es un campo requerido para administradores.",
        code: z.ZodIssueCode.custom,
      });
    }
    if (data.tipoVenta === "contado" || (data.tipoVenta === "credito" && (data.montoPagado ?? 0) > 0)) {
      if (!data.metodoPago || data.metodoPago.trim() === "") {
        ctx.addIssue({
          path: ["metodoPago"],
          message: "Método de pago es requerido para ventas de tipo contado o crédito con monto pagado.",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // Validación para `tipoVenta === "credito"`
    if (data.tipoVenta === "credito") {
      console.log("desde valdiacion:", data.montoPagado);
      if (data.montoPagado === undefined || data.montoPagado === null) {
        ctx.addIssue({
          path: ["montoPagado"],
          message: "Monto pagado es requerido cuando el tipo de venta es 'credito'.",
          code: z.ZodIssueCode.custom,
        });
      } else if (data.montoPagado >= data.total) {
        ctx.addIssue({
          path: ["montoPagado"],
          message: "Monto pagado no puede ser mayor o igual al monto total de la venta.",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // Validación para clientes naturales
    if (data.tipoCliente === "Natural") {
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

    // Validación para clientes jurídicos
    if (data.tipoCliente === "Juridico") {
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

type Inputs = z.infer<ReturnType<typeof schema>>;

const VentasForm2 = ({
  data,
}: {
  data?: Inputs;
}) => {
  const [showDataVenta, setShowDataVenta] = useState(true);
  const [showDataCliente, setShowDataCliente] = useState(true); 
  const [showDataDetails, setShowDataDetails] = useState(true); 
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [resetDropdown, setResetDropdown] = useState(false);
  const { user, isAdmin } = useAuthStore();
  const { sedes } = useSedes();
  const [tipoCliente, setTipoCliente] = useState<String>();
  const [isEditing, setIsEditing] = useState(true);
  const { productos, reloadProductos} = useProductos();
  const { ventaTemporal, actualizarDetalleVenta, setCliente, setVentaTemporal, resetVenta} = useVentaStore();

  const generarFechaActual = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

  const handleChangeSede = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sedeSeleccionada = sedes?.find(sede => sede.idSede === Number(event.target.value));
    if (sedeSeleccionada) {
      setVentaTemporal({
        ...ventaTemporal,
        sede: sedeSeleccionada
      })
    }else{
      setVentaTemporal({
        ...ventaTemporal,
        sede: undefined
      })    
    }
  };



  const handleInputChangeDataCliente = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
  
    // Obtenemos el cliente actual desde el estado
    const currentCliente = ventaTemporal.cliente || {
      tipoCliente: "", // Proporciona un valor predeterminado para propiedades obligatorias
      natural: { dni: "", nombres: "", apellidos: "" },
      juridico: { ruc: "", razonSocial: "", representante: "" },
      direccion: "",
      telefono: "",
      correo: ""
    };
  
    // Creamos una copia del cliente actualizado
    const updatedCliente: Cliente = { ...currentCliente };
  
    if (name === "dni" || name === "nombres" || name === "apellidos") {
      updatedCliente.natural = {
        ...currentCliente.natural,
        [name]: value,
      };
    } else if (name === "ruc" || name === "razonSocial" || name === "representante") {
      updatedCliente.juridico = {
        ...currentCliente.juridico,
        [name]: value,
      };
    } else {
      (updatedCliente as any)[name] = value;
    }
    setCliente(updatedCliente); // Ahora cumple con el tipo 'Cliente'
  };
  
 
  const handleInputChangeDataVenta = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    console.log(name);
  
    // Actualizar solo una vez el estado
    setVentaTemporal({
      ...ventaTemporal, 
      [name]: value, 
      ...(name === "tipoVenta" && { metodoPago: "" , montoPagado: 0}), // Si el campo es tipoVenta, actualiza metodoPago
    });
  };
  
  
  const handleInputChangeDNIRUC = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const dniRucValue = event.target.value;
      if (!tipoCliente) {
      console.warn("Seleccione el tipo de cliente antes de buscar.");
      return;
    }
    const minLength = 7;
    if (dniRucValue.length >= minLength) {
      try {
        const response = await findCliente(dniRucValue, ventaTemporal.cliente?.tipoCliente);
        setCliente(response);
        setIsEditing(false);
      } catch (error) {
        setCliente({
          tipoCliente: ventaTemporal.cliente ? ventaTemporal.cliente.tipoCliente : "", 
          natural: tipoCliente === "Natural" ? {
            dni: dniRucValue,
            nombres: undefined,  // Limpia los campos de Natural si no se encuentra
            apellidos: undefined,
          } : undefined, 
          juridico: tipoCliente === "Juridico" ? {
            ruc: dniRucValue,
            razonSocial: undefined,  // Limpia los campos de Juridico si no se encuentra
            representante: undefined,
          } : undefined, 
          correo: "",
          direccion: "",
          telefono: "",
        });
        setIsEditing(true);
      }
    } 
  };
  
  const handleTipoClienteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTipo = event.target.value as "Natural" | "Juridico";
    setTipoCliente(selectedTipo);
    handleInputChangeDataCliente(event);
  };

  
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema(isAdmin)),
  });

  const handleReset = () => {
    clearErrors();
    resetVenta();
  }; 

  useEffect(() => {
    // Después de resetear, actualiza `ventaTemporal` con valores vacíos

    setVentaTemporal({
      ...ventaTemporal,
      fecha: generarFechaActual(),
      tipoVenta: "",
      metodoPago: "",
      sede: undefined,
      montoPagado: 0,
      cliente: undefined,
    });
  }, [reset]); // Este useEffect se ejecuta cuando se reinicia el formulario

  useEffect(() => {

    if (ventaTemporal) {
      console.log("xx",ventaTemporal)
      setValue("fecha", ventaTemporal.fecha);
      setValue("tipoVenta", ventaTemporal.tipoVenta);
      setValue("metodoPago", ventaTemporal.metodoPago);
      setValue("sede", ventaTemporal.sede?.idSede ? ventaTemporal.sede.idSede.toString() : "");
      setValue("montoPagado", ventaTemporal?.montoPagado)
      const cliente = ventaTemporal.cliente;
      if (cliente) {
        setTipoCliente(cliente.tipoCliente);
        // setValue("tipoCliente", cliente.tipoCliente)
        if (cliente?.tipoCliente === "Natural" && cliente.natural) {
          setValue("dni", cliente.natural.dni || "");
          setValue("nombres", cliente.natural.nombres || "");
          setValue("apellidos", cliente.natural.apellidos || "");
        }

        if (cliente?.tipoCliente === "Juridico" && cliente.juridico) {
          setValue("ruc", cliente.juridico.ruc || "");
          setValue("razonSocial", cliente.juridico.razonSocial || "");
          setValue("representante", cliente.juridico.representante || "");
        }
  
        // Cargar datos del cliente
        setValue("tipoCliente",cliente.tipoCliente||"");
        setValue("direccion", cliente.direccion || "");
        setValue("correo", cliente.correo || "");
        setValue("telefono", cliente.telefono || "");
      } else {
        // Si no hay cliente, limpiar los valores del cliente
        setValue("tipoCliente","");
        setValue("nombres", "");
        setValue("apellidos", "");
        setValue("razonSocial", "");
        setValue("representante", "");
        setValue("telefono", "");
        setValue("correo", "");
        setValue("direccion", "");
      }
    }
  }, []);






  const handleSelectProducto = (producto: Producto) => {
      setSelectedProducto(producto);
      setResetDropdown(false);
  };

  const handleAgregarDetalle = () => {
    setResetDropdown(true);
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
  
      const productoExiste = ventaTemporal.detalles?.find(
        (p) => p.producto.idProducto === selectedProducto.idProducto
      );
  
      console.log(productoExiste)

      let nuevosDetalles;

      if (productoExiste) {
        if (productoExiste.cantidad < stockDisponible) {
          nuevosDetalles = ventaTemporal.detalles?.map((p) =>
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
        const detallesActuales = Array.isArray(ventaTemporal.detalles) ? ventaTemporal.detalles : []; 
        
        nuevosDetalles = [...detallesActuales, detalleVenta];
        console.log(nuevosDetalles)
          toast.success("Producto agregado correctamente.");
        } else {
          toast.error("No puedes agregar este producto, no hay suficiente stock disponible.");
          return;
        }
      }
      actualizarDetalleVenta(nuevosDetalles);
    }
    setSelectedProducto(null);
  };

  const handleEditarDetalle = (
    detalleVenta: DetailVenta,
    campo: "cantidad" | "precio",
    valor: number
  ) => {
    const stockDisponible = detalleVenta.producto?.stockActual ?? 0;
  
    const actualizarCantidad = (valor: number) => {
      if (valor < 0) {
        toast.error("La cantidad no puede ser negativa.");
        return;
      }
      if (valor > stockDisponible) {
        toast.error(`La cantidad no puede ser mayor que el stock disponible. Unidades: ${stockDisponible}`);
        return;
      }
  
      const nuevosDetalles = ventaTemporal.detalles.map((detalle) =>
        detalle.idDetalleVenta === detalleVenta.idDetalleVenta
          ? {
              ...detalle,
              cantidad: valor,
              subtotal: valor * detalle.precio,
            }
          : detalle
      );
      actualizarDetalleVenta(nuevosDetalles)
      toast.success(`Cantidad actualizada a ${valor}.`);
    };
  
    const actualizarPrecio = (valor: number) => {
      if (valor < 0) {
        toast.error("El precio no puede ser negativo.");
        return;
      }
  
      const nuevosDetalles = ventaTemporal.detalles.map((detalle) =>
        detalle.idDetalleVenta === detalleVenta.idDetalleVenta
          ? {
              ...detalle,
              precio: valor,
              subtotal: detalle.cantidad * valor,
            }
          : detalle
      );
      actualizarDetalleVenta(nuevosDetalles)
      toast.success(`Precio actualizado a ${valor}.`);
    };
  
    // Decidir qué campo actualizar
    if (campo === "cantidad") {
      actualizarCantidad(valor);
    } else if (campo === "precio") {
      actualizarPrecio(valor);
    }
  };
  
  const handleEliminarDetalle = (detalleVenta: DetailVenta) => {
    actualizarDetalleVenta(ventaTemporal.detalles?.filter((detalle) => detalle !== detalleVenta));
  };

  const calcularTotal = () => {
    return ventaTemporal.detalles?.reduce((total, detalleVenta) => total + (detalleVenta.subtotal || 0), 0);
  };

  useEffect(() => {
    setValue("total", calcularTotal());
  }, [calcularTotal]);
  
  const crearCliente = async (data: any) => {
    try {
      // Variable para almacenar el cliente relacionado
      let clienteRelacionado: Natural | Juridico | null = null;
  
      // Crear el cliente base
      const clienteNuevo: Cliente = {
        tipoCliente: data.tipoCliente,
        telefono: data.telefono,
        correo: data.correo,
        direccion: data.direccion,
        estado: true,
      };
  
      // Asignar cliente relacionado dependiendo del tipo de cliente
      if (data.tipoCliente === 'Natural') {
        clienteRelacionado = {
          nombres: data.nombres!,
          apellidos: data.apellidos!,
          dni: data.dni!,
          estado: true,
        };
  
        // Asignar el cliente relacionado de tipo Natural
        clienteNuevo.natural = clienteRelacionado;
      } else if (data.tipoCliente === 'Juridico') {
        clienteRelacionado = {
          razonSocial: data.razonSocial!,
          ruc: data.ruc!,
          representante: data.representante!,
          estado: true,
        };
  
        // Asignar el cliente relacionado de tipo Juridico
        clienteNuevo.juridico = clienteRelacionado;
      }
      console.log("Guardando cliente: ", clienteNuevo);
      const savedCliente = await saveCliente(clienteNuevo);
      console.log('Cliente creado:', savedCliente);
      return savedCliente;
    } catch (error: any) {
      console.error('Error al crear cliente:', error);
      throw error; // Re-lanzamos el error para manejarlo en el lugar que llame a crearCliente
    }
  };
  


  const onSubmit = handleSubmit(async (data) => {
    if (ventaTemporal.detalles.length === 0) {
      toast.warning("Ingrese productos a la venta.");
      return;
    }
  
    let clienteVenta: Cliente | undefined; // Cambiamos a un objeto Cliente
  
    try {
      if (ventaTemporal.cliente?.idCliente) {
        console.log("Cliente ya existe:", ventaTemporal.cliente);
        clienteVenta = ventaTemporal.cliente;
      } else {
        clienteVenta = await crearCliente(data); // Llamamos al nuevo método para crear el cliente y sus detalles
      }
    
  
      const venta: Venta = {
        fecha: data.fecha,
        metodoPago: data.metodoPago || "",
        total: data.total,
        tipoVenta: data.tipoVenta,
        detalles: ventaTemporal.detalles,
        ...(data.tipoVenta === "credito" && data.montoPagado !== undefined && { montoPagado: data.montoPagado }),
        trabajador: user?.trabajador,
        sede: ventaTemporal.sede ?? user?.trabajador?.sede,
        cliente: clienteVenta 
      };
  
      console.log("Ventea enviando:", venta)
  
      const ventaReg = await saveVenta(venta);  // Guardamos la venta
      toast.success("Venta registrada exitosamente.");

      const blob = await pdf(<ComprobanteVenta venta={ventaReg} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url); // Abre el PDF en una nueva pestaña
      reloadProductos();
      handleReset();
    } catch (error: any) {
      showErrorsToast(error);
    }
    setShowDataVenta(true);
  });

  return (
    <div className="w-full flex-col justify-center">
      <div className="w-full flex justify-end p-2">
        <button onClick={handleReset} className="rounded-lg bg-red-600 text-sm text-white p-2">
          Reiniciar
        </button>
      </div>
      <form className="w-full flex-col" onSubmit={onSubmit} >
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
          {ventaTemporal.cliente?.tipoCliente === "Juridico" && (
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
            type="text"
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
              <option value="">Seleccione una opcion</option>
              <option value="contado">Contado</option>
              <option value="credito">Credito</option>
            </select>
            {errors.tipoVenta?.message && (
              <p className="text-xs text-red-400">{errors.tipoVenta.message}</p>
            )}
          </div>

          {ventaTemporal.tipoVenta === "contado" && (
            <div className="flex flex-col gap-2 px-2 w-full">
              <label className="text-sm text-gray-500">Método de Pago</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
                {...register("metodoPago")}
                onChange={handleInputChangeDataVenta}
              >
                <option value="">Seleccione opcion</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="yape">Yape</option>
                <option value="plin">Plin</option> 
              </select>
              {errors.metodoPago?.message && (
                <p className="text-xs text-red-400">{errors.metodoPago.message}</p>
              )}
            </div>
          )}
          {isAdmin && (<div className="flex flex-col gap-2 w-full px-2">
            <label className="text-sm font-medium text-gray-700">Sede</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
              {...register("sede")}
              onChange={handleChangeSede}
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
                  <div className="grid grid-cols-1 md:grid-cols-12 w-full gap-2">
                      <div className="md:col-span-10">
                          <SearchDropdown
                          productos={productos}
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
                  <div className="overflow-x-auto mt-4">
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
                        {ventaTemporal.detalles?.map((detalleVenta, index) => (
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
      <div className="flex justify-end mb-4">
        {ventaTemporal.tipoVenta === "credito" && (
          <div className="flex flex-col gap-2 px-2 w-1/3">
          <label className="text-sm text-gray-500">Monto Pagado</label>
          <input
              type="number"
              min="0"
              step="0.01"
              className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
              {...register("montoPagado")}
              onChange={handleInputChangeDataVenta}
              placeholder="Ingrese el monto a pagar"
          />
          {errors.montoPagado?.message && (
              <p className="text-xs text-red-400">{errors.montoPagado.message}</p>
          )}
          </div>
        )}
      </div>
      <div className="flex justify-end mb-4">
        {ventaTemporal.tipoVenta === "credito" && ventaTemporal.montoPagado > 0 && (
          <div className="flex flex-col gap-2 px-2 w-1/3">
            <label className="text-sm text-gray-500">Método de Pago</label>
            <select
              className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
              {...register("metodoPago")}
              onChange={handleInputChangeDataVenta}
            >
              <option value="">Seleccione opcion</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </select>
            {errors.metodoPago?.message && (
              <p className="text-xs text-red-400">{errors.metodoPago.message}</p>
            )}
          </div>
        )}
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

export default VentasForm2;
