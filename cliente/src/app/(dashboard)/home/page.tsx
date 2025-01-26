"use client";

import React, { useEffect, useState } from "react";
import {
  getIngresoVentas,
  getIngresoCompras,
  getProductosMasVendidos,
  getMarcasMasVendidas,
  getCuentasPorCobrar,
  getVentasVsComprasUltimos5Meses,
  getCuentasPorPagar,
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
  LabelList,
} from "recharts";

const Home = () => {
  // Estado para almacenar los datos de los indicadores
  const [loading, setLoading] = useState<boolean>(true); // Estado para indicar si se está cargando
  const [ingresoVentas, setIngresoVentas] = useState<number | null>(null);
  const [ingresoCompras, setIngresoCompras] = useState<number | null>(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState<any[]>([]);
  const [marcasMasVendidas, setMarcasMasVendidas] = useState<any[]>([]);
  const [ventasVsComprasUltimos5Meses, setVentasVsComprasUltimos5Meses] =
    useState<any[]>([]);
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState<number | null>(null);
  const [cuentasPorPagar, setCuentasPorPagar] = useState<number | null>(null);

  const getColor = (index: number) => {
    const colors = ["#8884d8", "#82ca9d", "#ff7300", "#d0ed57", "#a4de6c"]; // Lista de colores
    return colors[index % colors.length]; // Retorna el color basado en el índice
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          ingresoVentasData,
          ingresoComprasData,
          productosMasVendidosData,
          marcasMasVendidasData,
          cuentasPorCobrarData,
          cuentasPorPagarData,
          ventasVsComprasUltimos5MesesData,
        ] = await Promise.all([
          getIngresoVentas(),
          getIngresoCompras(),
          getProductosMasVendidos(),
          getMarcasMasVendidas(),
          getCuentasPorCobrar(),
          getCuentasPorPagar(),
          getVentasVsComprasUltimos5Meses(),
        ]);
  
        setIngresoVentas(ingresoVentasData);
        setIngresoCompras(ingresoComprasData);
        setProductosMasVendidos(productosMasVendidosData);
        setMarcasMasVendidas(marcasMasVendidasData);
        setCuentasPorCobrar(cuentasPorCobrarData);
        setCuentasPorPagar(cuentasPorPagarData);

        // Convertir strings a números en ventasVsComprasUltimos5MesesData
        const ventasComprasData = ventasVsComprasUltimos5MesesData.map((item: any) => ({
          ...item,
          ventas: parseFloat(item.ventas), // Convertir ventas a número
          compras: parseFloat(item.compras), // Convertir compras a número
        }));
  
        setVentasVsComprasUltimos5Meses(ventasComprasData);
  
        setLoading(false);
        console.log(ventasComprasData)
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl font-bold">Cargando estadísticas...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Indicadores Financieros</h1>

      <div className="flex flex-wrap justify-between gap-2">
        {/* Card para Ingreso por Ventas */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-[23%]">
          <h2 className="text-xl font-semibold text-gray-800">
            Ingreso por Ventas
          </h2>
          <p className="text-2xl text-green-500 mt-2">
            {ingresoVentas !== null ? `S/. ${ingresoVentas}` : "0"}
          </p>
        </div>

        {/* Card para Ingreso por Compras */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-[23%]">
          <h2 className="text-xl font-semibold text-gray-800">
            Ingreso por Compras
          </h2>
          <p className="text-2xl text-blue-500 mt-2">
            {ingresoCompras !== null ? `S/. ${ingresoCompras}` : "0"}
          </p>
        </div>

        {/* Card para Cuentas Por Cobrar */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-[23%]">
          <h2 className="text-xl font-semibold text-gray-800">
            Cuentas Por Cobrar
          </h2>
          <p className="text-2xl text-blue-500 mt-2">
            {cuentasPorCobrar !== null ? `S/. ${cuentasPorCobrar}` : "0"}
          </p>
        </div>

        {/* Card para Cuentas Por Pagar */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-[23%]">
          <h2 className="text-xl font-semibold text-gray-800">
            Cuentas Por Pagar
          </h2>
          <p className="text-2xl text-blue-500 mt-2">
            {cuentasPorPagar !== null ? `S/. ${cuentasPorPagar}` : "0"}
          </p>
        </div>
      </div>

      {/* Otros indicadores */}
      <div className="flex flex-wrap justify-between">
      
      {/* Productos más vendidos */}
      <div className="w-full p-4">
        <h2 className="text-xl font-semibold text-gray-800 text-center">
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
          <p>No hay datos disponibles</p>
        )}
      </div>

      {/* Marcas más vendidas */}
      <div className="w-full p-4">
        <h2 className="text-xl font-semibold text-gray-800 text-center">
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
          <p>No hay datos disponibles</p>
        )}
      </div>


        {/* Ventas Vs Compras */}
        <div className="w-full p-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Ventas Vs Compras los últimos 5 meses
          </h2>
          {ventasVsComprasUltimos5Meses.length > 0 ? (
            <div className="w-full h-[400px]"> {/* Contenedor flexible */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasVsComprasUltimos5Meses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  
                  {/* Barra para Ventas */}
                  <Bar 
                    dataKey="ventas" 
                    fill="#8884d8" 
                    name="Ventas" 
                    barSize={20} // Hacer las barras más delgadas
                  >
                    <LabelList dataKey="ventas" position="top" />
                  </Bar>

                  {/* Barra para Compras */}
                  <Bar 
                    dataKey="compras" 
                    fill="#82ca9d" 
                    name="Compras" 
                    barSize={20} // Hacer las barras más delgadas
                  >
                    <LabelList dataKey="compras" position="top" />
                  </Bar>

                  {/* Línea de tendencia */}
                  <Line 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="#ff7300" 
                    dot={false} // Desactiva los puntos en la línea
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center">No hay datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

