"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Validation schema remains the same
const formSchema = z.object({
  producto: z.string().min(1, "Seleccione un producto"),
  proveedor: z.string().min(1, "Seleccione un proveedor"),
  cantidad: z.string().min(1, "Ingrese una cantidad"),
  precioCompra: z.string().min(1, "Ingrese el precio de compra"),
});

// Interfaces remain the same
interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  stock: number;
}

interface Proveedor {
  id: number;
  nombre: string;
}

interface CompraItem {
  producto: number;
  cantidad: number;
  precio_compra: number;
  subtotal: number;
}

interface Compra {
  id: number;
  proveedor: number;
  fecha: string;
  items: CompraItem[];
  total: number;
}

export default function NuevaCompra() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<CompraItem[]>([]);
  const [selectedProveedor, setSelectedProveedor] = useState<number | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  
  // Fetch data remains the same
  useEffect(() => {
    async function fetchData() {
      try {
        const [productosResponse, proveedoresResponse, comprasResponse] = await Promise.all([
          axios.get('https://allison-django-main-c7mj.vercel.app/api/productos/'),
          axios.get('https://allison-django-main-c7mj.vercel.app/api/proveedores/'),
          axios.get('https://allison-django-main-c7mj.vercel.app/api/compras/')
        ]);
        
        setProductos(productosResponse.data);
        setProveedores(proveedoresResponse.data);
        setCompras(comprasResponse.data);
        setIsLoading(false);
      } catch (error) {
        toast.error("Error al cargar datos");
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Form configuration remains the same
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      producto: "",
      proveedor: "",
      cantidad: "",
      precioCompra: "",
    },
  });

  // Submission function remains the same
  function onSubmit(values: z.infer<typeof formSchema>) {
    const producto = productos.find((p) => p.id === parseInt(values.producto));
    const proveedor = proveedores.find((p) => p.id === parseInt(values.proveedor));
    
    if (!producto || !proveedor) return;

    const cantidad = parseInt(values.cantidad);
    const precioCompra = parseFloat(values.precioCompra);
    const nuevoItem: CompraItem = {
      producto: producto.id,
      cantidad,
      precio_compra: precioCompra,
      subtotal: precioCompra * cantidad,
    };

    setItems([...items, nuevoItem]);
    setSelectedProveedor(proveedor.id);
    form.reset();
  }

  // Finalize purchase function remains the same
  async function finalizarCompra() {
    if (items.length === 0) {
      toast.error("Agregue al menos un producto");
      return;
    }

    if (!selectedProveedor) {
      toast.error("Debe seleccionar un proveedor");
      return;
    }

    try {
      const response = await axios.post('https://allison-django-main-c7mj.vercel.app/api/compras/', {
        proveedor: selectedProveedor,
        items: items.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precio_compra: item.precio_compra,
        })),
      });

      const comprasResponse = await axios.get('https://allison-django-main-c7mj.vercel.app/api/compras/');
      setCompras(comprasResponse.data);

      toast.success("Compra registrada con éxito");
      setItems([]);
      setSelectedProveedor(null);
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.detail || "Error al procesar la compra");
      } else if (error.request) {
        toast.error("No se pudo conectar con el servidor");
      } else {
        toast.error("Error al procesar la compra");
      }
    }
  }

  // Total calculations remain the same
  const total = items.reduce((acc, item) => acc + item.subtotal, 0)*1.15;
  const iva = items.reduce((acc, item) => acc + item.subtotal, 0)*0.15;

  // Loading state remains the same
  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nueva Compra</h1>

      <div className="grid gap-8">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Proveedor Popover */}
                <FormField
                  control={form.control}
                  name="proveedor"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Proveedor</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? proveedores.find(
                                    (proveedor) => proveedor.id.toString() === field.value
                                  )?.nombre
                                : "Seleccionar proveedor"}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar proveedor..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron proveedores</CommandEmpty>
                              <CommandGroup>
                                {proveedores.map((proveedor) => (
                                  <CommandItem
                                    value={proveedor.nombre}
                                    key={proveedor.id}
                                    onSelect={() => {
                                      form.setValue("proveedor", proveedor.id.toString());
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        proveedor.id.toString() === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {proveedor.nombre}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                {/* Producto Popover */}
                <FormField
                  control={form.control}
                  name="producto"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Producto</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? productos.find(
                                    (producto) => producto.id.toString() === field.value
                                  )?.nombre
                                : "Seleccionar producto"}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar producto..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron productos</CommandEmpty>
                              <CommandGroup>
                                {productos.map((producto) => (
                                  <CommandItem
                                    value={producto.nombre}
                                    key={producto.id}
                                    onSelect={() => {
                                      form.setValue("producto", producto.id.toString());
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        producto.id.toString() === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {producto.nombre}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>

             {/* Rest of the form remains the same */}
             <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cantidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precioCompra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de Compra</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Agregar a la compra
              </Button>
            </form>
          </Form>
        </Card>

        {/* Resumen de Compra */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de compra</h2>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay productos agregados
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const producto = productos.find((p) => p.id === item.producto);
                return (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span>{producto?.nombre} x {item.cantidad}</span>
                    </div>
                    <div>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
               <div className="flex justify-between font-bold">
                <span>IVA</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}
          <Button onClick={finalizarCompra} className="w-full mt-4">
            Finalizar Compra
          </Button>
        </Card>

        {/* Lista de Compras */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Historial de Compras</h2>
          {compras.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay compras registradas
            </p>
          ) : (
            <div className="space-y-4">
              {compras.map((compra) => {
                const proveedor = proveedores.find((p) => p.id === compra.proveedor);
                return (
                  <div key={compra.id} className="border-b pb-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Compra #{compra.id}</span>
                      <span>{new Date(compra.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Proveedor: {proveedor?.nombre}
                    </div>
                    <div className="mt-2">
                      {compra.items.map((item, index) => {
                        const producto = productos.find((p) => p.id === item.producto);
                        return (
                          <div key={index} className="flex justify-between">
                           
                          
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end mt-2 font-bold">
                      <span>Total: ${Number(compra.total).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}