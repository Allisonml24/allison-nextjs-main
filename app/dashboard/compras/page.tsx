"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CarTaxiFrontIcon, CheckIcon, Trash2Icon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Interfaces
interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  stock: number;
  descripcion: string;
  precio: number;
  categoria: number;
  proveedor: number;
}

interface Proveedor {
  id: number;
  nombre: string;
}

interface CompraItem {
  producto: number;
  nombre?: string;
  codigo?: string;
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

// Validation Schema
const formSchema = z.object({
  producto: z.string().min(1, "Seleccione un producto"),
  proveedor: z.string().min(1, "Seleccione un proveedor"),
  cantidad: z.string().min(1, "Ingrese una cantidad").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "La cantidad debe ser mayor a 0"
  ),
  precioCompra: z.string().min(1, "Ingrese el precio de compra").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "El precio debe ser mayor a 0"
  ),
});

const API_BASE_URL = "https://allison-django-main-d27e.vercel.app/api";

export default function NuevaCompra() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [items, setItems] = useState<CompraItem[]>([]);
  const [selectedProveedor, setSelectedProveedor] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      producto: "",
      proveedor: "",
      cantidad: "",
      precioCompra: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [productosRes, proveedoresRes, comprasRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/productos/`),
          axios.get(`${API_BASE_URL}/proveedores/`),
          axios.get(`${API_BASE_URL}/compras/`)
        ]);
        
        setProductos(productosRes.data);
        setProveedores(proveedoresRes.data);
        setCompras(comprasRes.data);
        setIsLoading(false);
      } catch (error) {
        toast.error("Error al cargar los datos iniciales");
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, productos]);

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const producto = productos.find(p => p.id === parseInt(values.producto));
    if (!producto) return;

    const cantidad = parseInt(values.cantidad);
    const precioCompra = parseFloat(values.precioCompra);
    
    const nuevoItem: CompraItem = {
      producto: producto.id,
      nombre: producto.nombre,
      codigo: producto.codigo,
      cantidad,
      precio_compra: precioCompra,
      subtotal: precioCompra * cantidad,
    };

    setItems(prev => [...prev, nuevoItem]);
    form.reset();
  };

  const finalizarCompra = async () => {
    if (items.length === 0 || !selectedProveedor) {
      toast.error("Debe agregar productos y seleccionar un proveedor");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/compras/`, {
        proveedor: selectedProveedor,
        items: items.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precio_compra: item.precio_compra,
        })),
      });

      const comprasRes = await axios.get(`${API_BASE_URL}/compras/`);
      setCompras(comprasRes.data);
      
      setItems([]);
      setSelectedProveedor(null);
      form.reset();
      toast.success("Compra registrada exitosamente");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error al procesar la compra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const iva = subtotal * 0.15;
  const total = subtotal + iva;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nueva Compra</h1>
        <Badge variant="outline" className="text-lg py-1">
          Compra #{compras.length + 1}
        </Badge>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="proveedor"
                render={({ field }) => (
                  <FormItem>
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
                            <CarTaxiFrontIcon className="h-4 w-4 shrink-0 opacity-50" />
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
                                  key={proveedor.id}
                                  value={proveedor.nombre}
                                  onSelect={() => {
                                    form.setValue("proveedor", proveedor.id.toString());
                                    setSelectedProveedor(proveedor.id);
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="producto"
                render={({ field }) => (
                  <FormItem>
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
                            <CarTaxiFrontIcon className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Buscar por nombre o código..." 
                            onValueChange={setSearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>No se encontraron productos</CommandEmpty>
                            <CommandGroup>
                              {filteredProducts.map((producto) => (
                                <CommandItem
                                  key={producto.id}
                                  value={producto.nombre}
                                  onSelect={() => {
                                    form.setValue("producto", producto.id.toString());
                                  }}
                                >
                                  <div className="flex items-center">
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        producto.id.toString() === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div>
                                      <div>{producto.nombre}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Código: {producto.codigo} | Stock: {producto.stock}
                                      </div>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
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
                    <FormMessage />
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

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Resumen de compra</h2>
        {items.length === 0 ? (
          <Alert>
            <AlertDescription className="text-center py-4">
              No hay productos agregados a la compra
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium bg-muted border-b">
                <div className="col-span-2">Producto</div>
                <div className="text-right">Cantidad</div>
                <div className="text-right">Precio</div>
                <div className="text-right">Subtotal</div>
                <div></div>
              </div>
              <div className="divide-y">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div className="col-span-2">
                      <div>{item.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        Código: {item.codigo}
                      </div>
                    </div>
                    <div className="text-right">{item.cantidad}</div>
                    <div className="text-right">${item.precio_compra}</div>
                    <div className="text-right">${item.subtotal}</div>
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
  
              <div className="flex flex-col gap-2 items-end">
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="text-muted-foreground">Subtotal:</div>
                  <div className="text-right">${subtotal}</div>
                  <div className="text-muted-foreground">IVA (15%):</div>
                  <div className="text-right">${iva}</div>
                </div>
                <div className="grid grid-cols-2 gap-8 text-lg font-bold border-t pt-2">
                  <div>Total:</div>
                  <div className="text-right">${total}</div>
                </div>
              </div>
  
              <Button 
                className="w-full"
                onClick={finalizarCompra}
                disabled={items.length === 0 || !selectedProveedor || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Finalizar Compra'
                )}
              </Button>
            </div>
          )}
        </Card>
  
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Historial de Compras</h2>
          {compras.length === 0 ? (
            <Alert>
              <AlertDescription className="text-center py-4">
                No hay compras registradas
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {compras.map((compra) => {
                const proveedor = proveedores.find((p) => p.id === compra.proveedor);
                
                return (
                  <div key={compra.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="font-medium text-lg">Compra #{compra.id}</span>
                        <div className="text-sm text-muted-foreground">
                          Fecha: {new Date(compra.fecha).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Proveedor: {proveedor?.nombre}
                        </div>
                      </div>
                      <Badge variant="outline">
                        ${Number(compra.total)}
                      </Badge>
                    </div>
                    
                    
  
                   
  
                    <div className="flex justify-end mt-4 pt-2 border-t">
                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">
                          <span className="inline-block w-24">Subtotal:</span>
                          <span>${(Number(compra.total) / 1.15)}</span>
                        </div>
                        <div className="text-muted-foreground">
                          <span className="inline-block w-24">IVA (15%):</span>
                          <span>${(Number(compra.total) - (Number(compra.total) / 1.15))}</span>
                        </div>
                        <div className="font-medium">
                          <span className="inline-block w-24">Total:</span>
                          <span>${Number(compra.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    );
  }