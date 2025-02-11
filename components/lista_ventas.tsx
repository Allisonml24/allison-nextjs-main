import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, PrinterIcon } from 'lucide-react';
import axios from 'axios';

interface Venta {
  id: number;
  fecha: string;
  total: number;
}

export function VentasComponent() {
  const [items, setItems] = useState<any[]>([]);
  const [ventaGenerada, setVentaGenerada] = useState(false);
  const [ventas, setVentas] = useState<Venta[]>([]);

  // Función para cargar ventas desde la API
  const cargarVentas = async () => {
    try {
      const response = await axios.get('https://allison-django-main-gmgm.vercel.app/api/ventas/');
      setVentas(response.data);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    }
  };

  // Cargar ventas al montar el componente
  useEffect(() => {
    cargarVentas();
  }, []);

  const finalizarVenta = async () => {
    try {
      // Lógica para finalizar la venta
      const nuevaVenta = await axios.post('/api/ventas', { items });
      setVentaGenerada(true);
      // Recargar la lista de ventas
      cargarVentas();
      // Limpiar items
      setItems([]);
    } catch (error) {
      console.error('Error al finalizar venta:', error);
    }
  };

  const eliminarItem = (index: number) => {
    const nuevosItems = [...items];
    nuevosItems.splice(index, 1);
    setItems(nuevosItems);
  };

  const imprimirFactura = () => {
    // Lógica para imprimir factura
    window.print();
  };

  return (
    <Card>
      {/* Sección de lista de ventas */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Historial de Ventas</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id}>
                <td className="border p-2">{venta.id}</td>
                <td className="border p-2">
                  {new Date(venta.fecha).toLocaleDateString()}
                </td>
                <td className="border p-2">{venta.total}</td>
                <td className="border p-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Lógica para ver detalles de la venta
                      console.log('Ver detalles de venta', venta);
                    }}
                  >
                    Ver Detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}