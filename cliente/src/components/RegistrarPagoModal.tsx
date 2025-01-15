import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CurrencyDollarIcon } from "@heroicons/react/16/solid";
import InputField from "./InputField";
import { CuentaCobrar, DetalleCC } from "@/types";
import { registrarDetalleCuentasCobrar } from "@/services/cuentasCobrarService";
import { toast } from "sonner";

// Schema de validación
const detailCCSchema = z.object({
    motivo: z.string().min(1, "El motivo es obligatorio"),
    monto: z
        .string() // Espera un string
        .transform((val) => parseFloat(val)) // Convierte el string a un número
        .refine((val) => !isNaN(val), { message: "El monto es un campo requerido." }) // Asegúrate de que sea un número
        .refine((val) => val > 0, { message: "El monto debe ser mayor a 0." }),
        fecha: z.string().min(1, { message: "Fecha de venta es requerida." }),
});

type Inputs = z.infer<typeof detailCCSchema>;

const RegistrarPagoModal = ({
    cuentaCobrar,
    onUpdate
}: {
    cuentaCobrar: CuentaCobrar;
    onUpdate: () => void;
}) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false); // Nuevo estado para manejar la carga

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(detailCCSchema),
        defaultValues: {
            // La fecha se actualizará dinámicamente, no es necesario establecerla aquí
        },
    });

    // Función para generar la hora actual con segundos
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

    const handleOpenModal = () => {
        setVisible(true);
        setValue("fecha", generarFechaActual()); // Establecer la fecha actual
    };

    const handleCloseModal = () => setVisible(false);

    const onSubmit = handleSubmit(async (data) => {
        try {
            setLoading(true); // Activar el estado de carga
            const detalleCC: DetalleCC = { motivo: data.motivo, monto: data.monto, fecha: data.fecha }; // Usar la fecha actual

            if (cuentaCobrar?.idCC) {
                await registrarDetalleCuentasCobrar(detalleCC, cuentaCobrar.idCC);
                toast.success("Detalle registrado exitosamente.");
            } else {
                toast.error("No se encontró una cuenta por cobrar válida.");
            }
            handleCloseModal();
            onUpdate();
        } catch (error: any) {
            console.log(error);
            toast.error(error.toString());
        } finally {
            setLoading(false); // Desactivar el estado de carga
        }
    });

    return (
        <>
            <button
                className="flex items-center justify-center bg-gray-600 text-white rounded hover:bg-gray-500 w-6 h-6 md:w-10 md:h-10"
                onClick={handleOpenModal}
            >
                <CurrencyDollarIcon className="h-5 w-5 text-white" />
            </button>
            {visible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                        <h2 className="text-xl font-semibold mb-4">Registrar Detalle</h2>
                        <form onSubmit={onSubmit}>
                            {/* Campo de Motivo */}
                            <div className="flex flex-col gap-2 px-2 mb-2 w-full">
                                <label className="text-sm font-medium text-gray-700">Motivo</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
                                    {...register("motivo")}
                                >
                                    <option value="Amortizacion">Amortizacion</option>
                                    <option value="Prestamo">Prestamo</option>
                                </select>
                                {errors.motivo?.message && (
                                    <p className="text-sm text-red-500">{errors.motivo.message}</p>
                                )}
                            </div>

                            {/* Campo de Monto */}
                            <InputField
                                label="Monto"
                                name="monto"
                                type="number"
                                step={0.01}
                                register={register}
                                error={errors.monto}
                            />

                            {/* Campo de Fecha con segundos */}
                            <div className="flex flex-col gap-2 px-2 mb-2 w-full">
                                <label className="text-sm font-medium text-gray-700">Fecha</label>
                                <input
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
                                    type="text"
                                    {...register("fecha")}
                                    disabled
                                />
                                {errors.fecha?.message && (
                                    <p className="text-sm text-red-500">{errors.fecha.message}</p>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end gap-4 py-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-300 text-gray-700 rounded px-4 py-2 hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                                    disabled={loading} // Deshabilitar el botón durante el envío
                                >
                                    {loading ? "Registrando..." : "Registrar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default RegistrarPagoModal;
