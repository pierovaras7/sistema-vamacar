import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import InputField from "./InputField";
import { Inventario, MovInventario } from "@/types";
import { registrarMovimientoInventario } from "@/services/inventariosService";
import { ArrowsUpDownIcon, CurrencyDollarIcon } from "@heroicons/react/16/solid";

// Schema de validación
const movInventarioSchema = z.object({
    tipo: z.string().min(1, "El tipo es obligatorio"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    cantidad: z
        .string() // Espera un string
        .transform((val) => parseFloat(val)) // Convierte el string a un número
        .refine((val) => !isNaN(val), { message: "La cantidad es un campo requerido." }) // Asegúrate de que sea un número
        .refine((val) => val > 0, { message: "La cantidad debe ser mayor a 0." }),
        fecha: z.string().min(1, { message: "Fecha de venta es requerida." }),
});

type Inputs = z.infer<typeof movInventarioSchema>;

const RegistrarMovimientoInventarioModal = ({
    inventario,
    onUpdate,
}: {
    inventario: Inventario;
    onUpdate: () => void;
}) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(movInventarioSchema),
        defaultValues: {},
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
            setLoading(true);
            const movimiento: MovInventario = {
                tipo: data.tipo,
                descripcion: data.descripcion,
                cantidad: data.cantidad,
                fecha: data.fecha,
            };
            await registrarMovimientoInventario(movimiento, inventario?.idInventario);
            toast.success("Movimiento registrado exitosamente.");
            handleCloseModal();
            onUpdate();
        } catch (error: any) {
            console.error(error);
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    });

    return (
        <>
            <button
                className="flex items-center justify-center bg-gray-600 text-white rounded hover:bg-gray-500 w-6 h-6 md:w-10 md:h-10"
                onClick={handleOpenModal}
            >
                <ArrowsUpDownIcon className="h-5 w-5 text-white" />
            </button>
            {visible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                        <h2 className="text-xl font-semibold mb-4">Registrar Movimiento</h2>
                        <form onSubmit={onSubmit}>
                            {/* Campo de Tipo */}
                            <div className="flex flex-col gap-2 px-2 mb-2 w-full">
                                <label className="text-sm font-medium text-gray-700">Tipo</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
                                    {...register("tipo")}
                                >
                                    <option value="Ingreso">Ingreso</option>
                                    <option value="Egreso">Egreso</option>
                                </select>
                                {errors.tipo?.message && (
                                    <p className="text-sm text-red-500">{errors.tipo.message}</p>
                                )}
                            </div>

                            {/* Campo de Descripción */}
                            <InputField
                                label="Descripción"
                                name="descripcion"
                                type="text"
                                register={register}
                                error={errors.descripcion}
                            />

                            {/* Campo de Cantidad */}
                            <InputField
                                label="Cantidad"
                                name="cantidad"
                                type="number"
                                register={register}
                                error={errors.cantidad}
                            />

                            {/* Campo de Fecha */}
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
                                    disabled={loading}
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

export default RegistrarMovimientoInventarioModal;

