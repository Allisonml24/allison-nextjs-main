// app/inventario/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductos, deleteProducto } from "@/hooks/useProductos";
import { PlusCircle, Trash2 } from "lucide-react";
import { ProductoDialog } from "@/components/producto-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner"; // Opcional: para mostrar notificaciones
import axios from 'axios';

export default function Inventario() {
  const { productos, isLoading, mutate } = useProductos();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [categorias, setCategorias] = useState([]);

  const handleEdit = (producto: any) => {
    setSelectedProduct(producto);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProducto(id);
      mutate(); // Revalidar la lista de productos
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('No se pudo eliminar el producto');
    }
  };

  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const response = await axios.get('https://allison-django-main-gmgm.vercel.app/api/categorias');
        setCategorias(response.data);
      } catch (error) {
        console.error('Error al obtener categorias:', error);
      }
    };
    obtenerCategorias();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <Button 
          onClick={() => {
            setSelectedProduct(null);
            setOpenDialog(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {isLoading ? (
        <div>Cargando inventario...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
               
                <TableHead>Stock</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos?.map((producto: any) => (
                <TableRow key={producto.id}>
                  <TableCell>{producto.codigo}</TableCell>
                  <TableCell>{producto.nombre}</TableCell>
                 
                  <TableCell>{producto.stock}</TableCell>
                  <TableCell>${producto.precio}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(producto)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(producto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductoDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        producto={selectedProduct} 
        onSuccess={() => {
          mutate(); // Revalidar la lista de productos después de crear/actualizar
          setOpenDialog(false);
          setSelectedProduct(null);
        }} 
      />
    </div>
  );
}
