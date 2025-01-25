import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Interfaz que refleja el modelo de Django
interface ProductoForm {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: string;
  stock: number;
  categoria: number;
  proveedor: number;
}

interface ProductoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto?: ProductoForm & { id?: number };
  onSuccess: () => void;
  categorias?: Array<{ id: number, nombre: string }>;
  proveedores?: Array<{ id: number, nombre: string }>;
}

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Función para obtener productos
const getProducts = async () => {
  try {
    const response = await api.get('productos/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
};

// Función para crear un nuevo producto
const createProduct = async (data: any) => {
  try {
    const response = await api.post('productos/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
  }
};

// Función para actualizar un producto existente
const updateProduct = async (id: number, data: any) => {
  try {
    const response = await api.put(`productos/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
  }
};

// Función para obtener categorías
const getCategorias = async () => {
  try {
    const response = await api.get('categorias/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
  }
};

// Función para obtener proveedores
const getProveedores = async () => {
  try {
    const response = await api.get('proveedores/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
  }
};

export function ProductoDialog({
  open,
  onOpenChange,
  producto,
  onSuccess,
  categorias = [],
  proveedores = []
}: ProductoDialogProps) {
  // Estado inicial del formulario
  const [formData, setFormData] = useState<ProductoForm>({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: 0,
    categoria: 0,
    proveedor: 0
  });

  // Estado para almacenar categorías y proveedores
  const [categoriasState, setCategoriasState] = useState(categorias);
  const [proveedoresState, setProveedoresState] = useState(proveedores);

  // Estado para almacenar errores de validación
  const [errors, setErrors] = useState({
    codigo: '',
    nombre: '',
    precio: '',
    stock: '',
    categoria: '',
    proveedor: ''
  });

  // Efecto para obtener categorías y proveedores al montar el componente
  useEffect(() => {
    const obtenerCategorias = async () => {
      const categorias = await getCategorias();
      setCategoriasState(categorias);
    };
    const obtenerProveedores = async () => {
      const proveedores = await getProveedores();
      setProveedoresState(proveedores);
    };
    obtenerCategorias();
    obtenerProveedores();
  }, []);

  // Efecto para actualizar el estado del formulario cuando se selecciona un producto para editar
  useEffect(() => {
    if (producto) {
      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria,
        proveedor: producto.proveedor
      });
    } else {
      // Resetear formulario
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        precio: '',
        stock: 0,
        categoria: 0,
        proveedor: 0
      });
    }
  }, [producto]);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'codigo') {
      if (!/^\d{5}$/.test(value)) {
        setErrors(prev => ({ ...prev, [name]: 'El código debe ser de 5 dígitos' }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    } else if (name === 'nombre') {
      if (!/^[a-zA-Z\s]+$/.test(value)) {
        setErrors(prev => ({ ...prev, [name]: 'El nombre solo debe contener letras y espacios' }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    } else if (name === 'precio' || name === 'stock') {
      if (isNaN(Number(value)) || Number(value) <= 0) {
        setErrors(prev => ({ ...prev, [name]: 'El valor debe ser un número mayor a 0' }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? Number(value) : value
    }));
  };

  // Manejar cambios en selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
    if (Number(value) === 0) {
      setErrors(prev => ({ ...prev, [name]: 'El campo es requerido' }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;
    Object.keys(formData).forEach((key) => {
      if (!formData[key as keyof ProductoForm]) {
        isValid = false;
      }
    });
    if (isValid && !Object.values(errors).some(error => error !== '')) {
      try {
        if (producto && producto.id) {
          // Actualizar producto existente
          await updateProduct(producto.id, formData);
        } else {
          // Crear nuevo producto
          await createProduct(formData);
        }
        onSuccess();
      } catch (error) {
        console.error('Error al guardar producto:', error);
      }
    } else {
      Object.keys(formData).forEach((key) => {
        if (!formData[key as keyof ProductoForm]) {
          setErrors(prev => ({ ...prev, [key]: 'El campo es requerido' }));
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Código</Label>
            <Input
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
              placeholder="Ingrese código del producto"
            />
            {errors.codigo && <p className="text-red-500">{errors.codigo}</p>}
          </div>
          <div>
            <Label>Nombre</Label>
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Nombre del producto"
            />
            {errors.nombre && <p className="text-red-500">{errors.nombre}</p>}
          </div>
          <div>
            <Label>Descripción</Label>
            <Input
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción opcional"
            />
          </div>
          <div>
            <Label>Precio</Label>
            <Input
              name="precio"
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={handleChange}
              required
              placeholder="Precio del producto"
            />
            {errors.precio && <p className="text-red-500">{errors.precio}</p>}
          </div>
          <div>
            <Label>Stock</Label>
            <Input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              required
              placeholder="Cantidad en inventario"
            />
            {errors.stock && <p className="text-red-500">{errors.stock}</p>}
          </div>
          <div>
            <Label>Categoría</Label>
            <Select
              value={formData.categoria.toString()}
              onValueChange={(value) => handleSelectChange('categoria', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoriasState.length > 0 ? (
                  categoriasState.map((categoria) => (
                    <SelectItem
                      key={categoria.id}
                      value={categoria.id.toString()}
                    >
                      {categoria.nombre}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="0" disabled>
                    No hay categorías disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.categoria && <p className="text-red-500">{errors.categoria}</p>}
          </div>
          <div>
            <Label>Proveedor</Label>
            <Select
              value={formData.proveedor.toString()}
              onValueChange={(value) => handleSelectChange('proveedor', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedoresState.length > 0 ? (
                  proveedoresState.map((proveedor) => (
                    <SelectItem
                      key={proveedor.id}
                      value={proveedor.id.toString()}
                    >
                      {proveedor.nombre}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="0" disabled>
                    No hay proveedores disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.proveedor && <p className="text-red-500">{errors.proveedor}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">
              {producto ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
