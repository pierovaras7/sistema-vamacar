"use client";

import React, { useEffect, useState } from "react";
import {
  getIngresoVentas,
  getIngresoCompras,
  getProductosMasVendidos,
  getMarcasMasVendidas,
  getCuentasPorCobrar,
  getVentasVsComprasUltimos5Meses,
} from "@/services/indicadoresService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Home = () => {
  // Estado para almacenar los datos de los indicadores
  const [ingresoVentas, setIngresoVentas] = useState<number | null>(null);
  const [ingresoCompras, setIngresoCompras] = useState<number | null>(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState<any[]>([]);
  const [marcasMasVendidas, setMarcasMasVendidas] = useState<any[]>([]);
  const [ventasVsComprasUltimos5Meses, setVentasVsComprasUltimos5Meses] =
    useState<any[]>([]);
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState<number | null>(null);

  const getColor = (index: number) => {
    const colors = ["#8884d8", "#82ca9d", "#ff7300", "#d0ed57", "#a4de6c"]; // Lista de colores
    return colors[index % colors.length]; // Retorna el color basado en el índice
  };

  // Usamos useEffect para llamar a los servicios al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ingresoVentasData = await getIngresoVentas();
        const ingresoComprasData = await getIngresoCompras();
        const productosMasVendidosData = await getProductosMasVendidos();
        const marcasMasVendidasData = await getMarcasMasVendidas();
        const cuentasPorCobrar = await getCuentasPorCobrar();
        const ventasVsComprasUltimos5Meses =
          await getVentasVsComprasUltimos5Meses();

        setIngresoVentas(ingresoVentasData);
        setIngresoCompras(ingresoComprasData);
        setProductosMasVendidos(productosMasVendidosData);
        setMarcasMasVendidas(marcasMasVendidasData);
        setCuentasPorCobrar(cuentasPorCobrar);
        setVentasVsComprasUltimos5Meses(ventasVsComprasUltimos5Meses);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, []); // El array vacío asegura que se ejecute solo una vez cuando el componente se monte

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Indicadores Financieros
      </h1>

      <div className="flex flex-wrap justify-between gap-2">
        {/* Card para Ingreso por Ventas */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-[23%]">
          <h2 className="text-xl font-semibold text-gray-800">
            Ingreso por Ventas
          </h2>
          <p className="text-2xl text-green-500 mt-2">
            {ingresoVentas !== null
              ? `S/. ${ingresoVentas.toLocaleString()}`
              : "Cargando..."}
          </p>
        </div>

        {/* Card para Ingreso por Compras */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-[23%]">
          <h2 className="text-xl font-semibold text-gray-800">
            Ingreso por Compras
          </h2>
          <p className="text-2xl text-blue-500 mt-2">
            {ingresoCompras !== null
              ? `S/. ${ingresoCompras.toLocaleString()}`
              : "Cargando..."}
          </p>
        </div>

        {/* Card para Cuentas Por Cobrar */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-[23%]">
          <h2 className="text-xl font-semibold text-gray-800">
            Cuentas Por Cobrar
          </h2>
          <p className="text-2xl text-blue-500 mt-2">
            {cuentasPorCobrar !== null
              ? `S/. ${cuentasPorCobrar.toLocaleString()}`
              : "Cargando..."}
          </p>
        </div>

        {/* Card para Cuentas Por Pagar */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-[23%]">
          <h2 className="text-xl font-semibold text-gray-800">
            Cuentas Por Pagar
          </h2>
          <p className="text-2xl text-blue-500 mt-2">
            {cuentasPorCobrar !== null
              ? `S/. ${cuentasPorCobrar.toLocaleString()}`
              : "Cargando..."}
          </p>
        </div>
      </div>

      {/* Otros indicadores o cards pueden ir aquí */}
      <div className="flex flex-wrap justify-between">
        <div className="w-full md:w-1/3 p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Productos Más Vendidos
          </h2>
          {productosMasVendidos.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productosMasVendidos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="descripcion" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_cantidad" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>Cargando...</p>
          )}
        </div>

        <div className="w-full md:w-1/3 p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Marcas Más Vendidas
          </h2>
          {marcasMasVendidas.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={marcasMasVendidas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="marca" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_vendido">
                  {marcasMasVendidas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>Cargando...</p>
          )}
        </div>

        <div className="w-full md:w-1/3 p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Ventas Vs Compras los últimos 5 meses
          </h2>
          {ventasVsComprasUltimos5Meses.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={ventasVsComprasUltimos5Meses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="compras"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>Cargando...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
