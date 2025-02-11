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
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Edit, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from 'axios';

export default function Clientes() {
  // Estados
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  const [errors, setErrors] = useState({
    nombre: '',
    telefono: ''
  });

  // Fetch de clientes
  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://allison-django-main-d27e.vercel.app/api/clientes/');
      setClientes(response.data);
      setFilteredClientes(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      toast.error('No se pudieron cargar los clientes');
      setIsLoading(false);
    }
  };

  // Efecto para cargar clientes
  useEffect(() => {
    fetchClientes();
  }, []);

  // Función de búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowercaseQuery = query.toLowerCase();
    const filtered = clientes.filter((cliente: any) =>
      cliente.nombre.toLowerCase().includes(lowercaseQuery) ||
      cliente.email.toLowerCase().includes(lowercaseQuery) ||
      cliente.telefono.includes(query)
    );
    setFilteredClientes(filtered);
  };

  // Manejar apertura de diálogo
  const handleOpenDialog = (cliente?: any) => {
    if (cliente) {
      setSelectedCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        email: cliente.email
      });
    } else {
      setSelectedCliente(null);
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        email: ''
      });
    }
    setOpenDialog(true);
  };

  // Validar nombre
  const validateNombre = (nombre: string) => {
    if (!/^[a-zA-Z\s]+$/.test(nombre)) {
      setErrors({ ...errors, nombre: 'El nombre solo debe contener letras y espacios' });
      return false;
    } else {
      setErrors({ ...errors, nombre: '' });
      return true;
    }
  };

  // Validar teléfono
  const validateTelefono = (telefono: string) => {
    if (!/^\d{10}$/.test(telefono)) {
      setErrors({ ...errors, telefono: 'El teléfono debe tener 10 dígitos' });
      return false;
    } else {
      setErrors({ ...errors, telefono: '' });
      return true;
    }
  };

  // Guardar cliente (crear o actualizar)
  const handleSaveCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateNombre(formData.nombre) || !validateTelefono(formData.telefono)) {
      return;
    }
    try {
      if (selectedCliente) {
        await axios.put(`https://allison-django-main-d27e.vercel.app/api/clientes/${selectedCliente.id}/`, formData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await axios.post('https://allison-django-main-d27e.vercel.app/api/clientes/', formData);
        toast.success('Cliente creado correctamente');
      }
      
      setOpenDialog(false);
      fetchClientes();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      toast.error('No se pudo guardar el cliente');
    }
  };

  // Eliminar cliente
  const handleDeleteCliente = async (id: number) => {
    try {
      await axios.delete(`https://allison-django-main-d27e.vercel.app/api/clientes/${id}/`);
      toast.success('Cliente eliminado correctamente');
      fetchClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast.error('No se pudo eliminar el cliente');
    }
  };

  // Validación en vivo
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'nombre') {
      validateNombre(value);
    } else if (name === 'telefono') {
      validateTelefono(value);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="text-center">Cargando clientes...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente: any) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nombre}</TableCell>
                  <TableCell>{cliente.direccion}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenDialog(cliente)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteCliente(cliente.id)}
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

      {/* Diálogo para crear/editar cliente */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCliente} className="space-y-4">
            <Input
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              name="nombre"
              required
            />
            {errors.nombre && <div className="text-red-500">{errors.nombre}</div>}
            <Input
              placeholder="Dirección"
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              required
            />
            <Input
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              name="telefono"
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
            <DialogFooter>
              <Button type="submit">
                {selectedCliente ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}