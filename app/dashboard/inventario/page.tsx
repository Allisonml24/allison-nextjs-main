"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductos, deleteProducto } from "@/hooks/useProductos";
import { PlusCircle, Trash2, Search } from "lucide-react";
import { ProductoDialog } from "@/components/producto-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from 'axios';

export default function Inventario() {
  const { productos, isLoading, mutate } = useProductos();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (producto: any) => {
    setSelectedProduct(producto);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProducto(id);
      mutate();
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('No se pudo eliminar el producto');
    }
  };

  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const response = await axios.get('https://allison-django-main-d27e.vercel.app/api/categorias');
        setCategorias(response.data);
      } catch (error) {
        console.error('Error al obtener categorias:', error);
      }
    };
    obtenerCategorias();
  }, []);

  // Filter products based on search term
  const filteredProducts = productos?.filter((producto: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      producto.nombre.toLowerCase().includes(searchLower) ||
      producto.codigo.toLowerCase().includes(searchLower)
    );
  });

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

      {/* Search input field */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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
              {filteredProducts?.map((producto: any) => (
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
          mutate();
          setOpenDialog(false);
          setSelectedProduct(null);
        }} 
      />
    </div>
  );
}