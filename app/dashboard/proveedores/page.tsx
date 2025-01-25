// app/proveedores/page.tsx
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from 'axios';

export default function Proveedores() {
  // Estados
  const [proveedores, setProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    telefono: '',
    email: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({
    nombre: '',
    empresa: '',
    telefono: '',
  });

  // Fetch de proveedores
  const fetchProveedores = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8000/api/proveedores/');
      setProveedores(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      toast.error('No se pudieron cargar los proveedores');
      setIsLoading(false);
    }
  };

  // Efecto para cargar proveedores
  useEffect(() => {
    fetchProveedores();
  }, []);

  // Manejar apertura de diálogo
  const handleOpenDialog = (proveedor?: any) => {
    if (proveedor) {
      // Editar proveedor existente
      setSelectedProveedor(proveedor);
      setFormData({
        nombre: proveedor.nombre,
        empresa: proveedor.empresa,
        telefono: proveedor.telefono,
        email: proveedor.email,
        direccion: proveedor.direccion
      });
    } else {
      // Nuevo proveedor
      setSelectedProveedor(null);
      setFormData({
        nombre: '',
        empresa: '',
        telefono: '',
        email: '',
        direccion: ''
      });
    }
    setOpenDialog(true);
  };

  // Validar campos
  const validateNombre = (value: string) => {
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      setErrors({ ...errors, nombre: 'Solo se permiten letras y espacios' });
      return false;
    } else {
      setErrors({ ...errors, nombre: '' });
      return true;
    }
  };

  const validateEmpresa = (value: string) => {
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      setErrors({ ...errors, empresa: 'Solo se permiten letras y espacios' });
      return false;
    } else {
      setErrors({ ...errors, empresa: '' });
      return true;
    }
  };

  const validateTelefono = (value: string) => {
    if (!/^\d{10}$/.test(value)) {
      setErrors({ ...errors, telefono: 'Debe ser un número de teléfono de 10 dígitos' });
      return false;
    } else {
      setErrors({ ...errors, telefono: '' });
      return true;
    }
  };

  // Guardar proveedor (crear o actualizar)
  const handleSaveProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateNombre(formData.nombre) && validateEmpresa(formData.empresa) && validateTelefono(formData.telefono)) {
      try {
        if (selectedProveedor) {
          // Actualizar proveedor existente
          await axios.put(`http://localhost:8000/api/proveedores/${selectedProveedor.id}/`, formData);
          toast.success('Proveedor actualizado correctamente');
        } else {
          // Crear nuevo proveedor
          await axios.post('http://localhost:8000/api/proveedores/', formData);
          toast.success('Proveedor creado correctamente');
        }
        
        // Cerrar diálogo y recargar lista
        setOpenDialog(false);
        fetchProveedores();
      } catch (error) {
        console.error('Error al guardar proveedor:', error);
        toast.error('No se pudo guardar el proveedor');
      }
    }
  };

  // Eliminar proveedor
  const handleDeleteProveedor = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/proveedores/${id}/`);
      toast.success('Proveedor eliminado correctamente');
      fetchProveedores();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      toast.error('No se pudo eliminar el proveedor');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">Cargando proveedores...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedores.map((proveedor: any) => (
                <TableRow key={proveedor.id}>
                  <TableCell>{proveedor.nombre}</TableCell>
                  <TableCell>{proveedor.empresa}</TableCell>
                  <TableCell>{proveedor.telefono}</TableCell>
                  <TableCell>{proveedor.email}</TableCell>
                  <TableCell>{proveedor.direccion}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenDialog(proveedor)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteProveedor(proveedor.id)}
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

      {/* Diálogo para crear/editar proveedor */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProveedor} className="space-y-4">
            <Input
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({...formData, nombre: e.target.value});
                validateNombre(e.target.value);
              }}
              required
            />
            {errors.nombre && <div className="text-red-500">{errors.nombre}</div>}
            <Input
              placeholder="Empresa"
              value={formData.empresa}
              onChange={(e) => {
                setFormData({...formData, empresa: e.target.value});
                validateEmpresa(e.target.value);
              }}
              required
            />
            {errors.empresa && <div className="text-red-500">{errors.empresa}</div>}
            <Input
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => {
                setFormData({...formData, telefono: e.target.value});
                validateTelefono(e.target.value);
              }}
              required
            />
            {errors.telefono && <div className="text-red-500">{errors.telefono}</div>}
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              placeholder="Dirección"
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              required
            />
            <DialogFooter>
              <Button type="submit">
                {selectedProveedor ? 'Actualizar' : 'Crear'}
              </Button> 
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
