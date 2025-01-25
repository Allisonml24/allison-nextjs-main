import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Venta {
  id: string;
  fecha: string;
  total: number;
  items: Array<{
    cantidad: number;
    producto: string;
    precio: number;
  }>;
}

export function DashboardStats() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    const fetchVentas = async () => {
    
        const response = await axios.get<Venta[]>('http://localhost:8000/api/ventas');
        setVentas(response.data);
        setLoading(false);
        // Recargar la página solo una vez
     
    };
  
    fetchVentas();
  }, []); // El array vacío garantiza que esto solo ocurra en el montaje inicial

  // Function to refresh the page
  

  // Calculate statistics based on fetched data
  const calcularEstadisticas = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const ventasHoy = ventas.filter(venta => 
      venta.fecha.split('T')[0] === hoy
    );

    const ventasAyer = ventas.filter(venta => 
      venta.fecha.split('T')[0] === ayer
    );

    const totalVentas = ventasHoy.reduce((acc, venta) => acc + Number(venta.total), 0);
    const totalProductos = ventasHoy.reduce((acc, venta) => 
      acc + venta.items.reduce((itemAcc, item) => itemAcc + item.cantidad, 0), 0
    );

    const cantidadTransacciones = ventasHoy.length;
    const totalVentasAyer = ventasAyer.reduce((acc, venta) => acc + Number(venta.total), 0);

    const crecimiento = totalVentasAyer > 0 
      ? ((totalVentas - totalVentasAyer) / totalVentasAyer) * 100 
      : 0;

    const productosMasVendidos = ventasHoy.reduce((acc, venta) => {
      venta.items.forEach(item => {
        acc[item.producto] = (acc[item.producto] || 0) + item.cantidad;
      });
      return acc;
    }, {} as Record<string, number>);

    const topProductos = Object.entries(productosMasVendidos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalVentas,
      totalProductos,
      cantidadTransacciones,
      totalVentasAyer,
      crecimiento,
      topProductos
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(item => (
          <div 
            key={item} 
            className="bg-gray-200 animate-pulse h-36 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const { 
    totalVentas, 
    totalProductos, 
    cantidadTransacciones,
    totalVentasAyer,
    crecimiento,
    topProductos
  } = calcularEstadisticas();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sales Card */}
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-gray-600 font-semibold">Ventas del Día</h3>
        <div className="text-3xl font-bold text-blue-600">
          ${totalVentas.toLocaleString('es-CL', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {cantidadTransacciones} transacciones
        </p>
      </div>

      {/* Products Sold Card */}
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-gray-600 font-semibold">Productos Vendidos</h3>
        <div className="text-3xl font-bold text-green-600">
          {totalProductos}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Productos vendidos hoy
        </p>
      </div>

      {/* Growth Card */}
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-gray-600 font-semibold">Crecimiento</h3>
        <div className={`text-3xl font-bold ${crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {crecimiento.toFixed(2)}%
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Comparado con ayer
        </p>
      </div>

      {/* Total Sales Yesterday Card */}
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-gray-600 font-semibold">Ventas Ayer</h3>
        <div className="text-3xl font-bold text-yellow-600">
          ${totalVentasAyer.toLocaleString('es-CL', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Total de ventas ayer
        </p>
      </div>

      
    </div>
  );
}