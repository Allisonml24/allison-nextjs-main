"use client";


import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Trash2, FileText } from "lucide-react";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink,
  pdf,
  Image
} from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  logoSection: {
    width: '50%',
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 15,
    objectFit: 'contain',
  },
  companyInfo: {
    marginTop: 10,
  },
  companyInfoText: {
    fontSize: 10,
    color: '#4a5568',
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  invoiceInfo: {
    width: '50%',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 32,
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
  },
  documentInfo: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: 80,
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
  },
  infoValue: {
    fontSize: 10,
    color: '#0f172a',
  },
  table: {
    marginTop: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableCell: {
    fontSize: 10,
    color: '#4a5568',
    textAlign: 'center',
  },
  productCell: {
    width: '40%',
    textAlign: 'left',
  },
  quantityCell: {
    width: '20%',
  },
  priceCell: {
    width: '20%',
  },
  subtotalCell: {
    width: '20%',
  },
  totalsSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 20,
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontSize: 11,
    color: '#0f172a',
    fontFamily: 'Helvetica-Bold',
  },
  grandTotal: {
    fontSize: 14,
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 20,
  },
});

const InvoicePDF: React.FC<InvoicePDFProps> = ({ venta, cliente, items, productos, total, iva }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text>Invoice</Text>
        <View style={pdfStyles.headerTop}>
          <View style={pdfStyles.logoSection}>
            <Image
              style={pdfStyles.logo}
              src="https://i.ibb.co/7n9NXvn/Whats-App-Image-2025-01-20-at-18-52-41-removebg-preview.png"
            />
            <View style={pdfStyles.companyInfo}>
              <Text style={pdfStyles.companyInfoText}>
                Av. San Pablo y 27 de Julio
              </Text>
              <Text style={pdfStyles.companyInfoText}>
                Al frente del comisariato Kerly
              </Text>
              <Text style={pdfStyles.companyInfoText}>
                Tel: 0988618861
              </Text>
              <Text style={pdfStyles.companyInfoText}>
                RUC: 0502163769001
              </Text>
            </View>
          </View>
          
          <View style={pdfStyles.invoiceInfo}>
            <Text style={pdfStyles.title}>Factura</Text>
            <View style={pdfStyles.documentInfo}>
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.infoLabel}>Fecha:</Text>
                <Text style={pdfStyles.infoValue}>{new Date().toLocaleDateString()}</Text>
              </View>
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.infoLabel}>No. Factura:</Text>
                <Text style={pdfStyles.infoValue}>{venta?.id || 'N/A'}</Text>
              </View>
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.infoLabel}>Cliente:</Text>
                <Text style={pdfStyles.infoValue}>{cliente?.nombre}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.productCell]}>Producto</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.quantityCell]}>Cantidad</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.priceCell]}>Precio</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.subtotalCell]}>Subtotal</Text>
        </View>

        {items.map((item, index) => {
          const producto = productos.find(p => p.id === item.producto);
          return (
            <View style={pdfStyles.tableRow} key={index}>
              <Text style={[pdfStyles.tableCell, pdfStyles.productCell]}>{producto?.nombre}</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.quantityCell]}>{item.cantidad}</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.priceCell]}>${item.precio_venta}</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.subtotalCell]}>${item.subtotal.toFixed(2)}</Text>
            </View>
          );
        })}
      </View>

      <View style={pdfStyles.totalsSection}>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>Subtotal:</Text>
          <Text style={pdfStyles.totalValue}>${(total - iva).toFixed(2)}</Text>
        </View>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>IVA:</Text>
          <Text style={pdfStyles.totalValue}>${iva.toFixed(2)}</Text>
        </View>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>Total:</Text>
          <Text style={[pdfStyles.totalValue, pdfStyles.grandTotal]}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={pdfStyles.footer}>
        Gracias por su preferencia
      </Text>
    </Page>
  </Document>
);

// Form Schema
const formSchema = z.object({
  producto: z.string().min(1, "Seleccione un producto"),
  cantidad: z.string()
    .refine(val => parseInt(val) > 0, "La cantidad debe ser mayor a 0"),
  cliente: z.string().min(1, "Seleccione un cliente"),
});

// Interfaces
interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
}

interface Cliente {
  id: number;
  nombre: string;
}

interface VentaItem {
  producto: number;
  cantidad: number;
  precio_venta: number;
  subtotal: number;
}

interface Venta {
  id: number;
  cliente: number;
  fecha: string;
  items: VentaItem[];
  total: number;
}
interface InvoicePDFProps {
  venta: any; // Replace 'any' with the actual type if known
  cliente: any; // Replace 'any' with the actual type if known
  items: any[]; // Replace 'any' with the actual type if known
  productos: any[]; // Replace 'any' with the actual type if known
  total: number;
  iva: number;
}

export default function NuevaVenta() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<VentaItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    async function fetchData() {
      try {
        const [productosResponse, clientesResponse, ventasResponse] = await Promise.all([
          axios.get('https://allison-django-main-gmgm.vercel.app/api/productos/'),
          axios.get('https://allison-django-main-gmgm.vercel.app/api/clientes/'),
          axios.get('https://allison-django-main-gmgm.vercel.app/api/ventas/')
        ]);
        
        setProductos(productosResponse.data);
        setClientes(clientesResponse.data);
        setVentas(ventasResponse.data);
        setIsLoading(false);
      } catch (error) {
        toast.error("Error al cargar datos");
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      producto: "",
      cantidad: "",
      cliente: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const producto = productos.find((p) => p.id === parseInt(values.producto));
    const cliente = clientes.find((c) => c.id === parseInt(values.cliente));
    
    if (!producto || !cliente) return;

    const cantidad = parseInt(values.cantidad);

    if (cantidad > producto.stock) {
      toast.error(`Stock insuficiente. Stock disponible: ${producto.stock}`);
      return;
    }

    const itemExistente = items.find(item => item.producto === producto.id);
    if (itemExistente) {
      toast.error("El producto ya está en la lista. Elimínelo y vuelva a agregarlo.");
      return;
    }

    const nuevoItem: VentaItem = {
      producto: producto.id,
      cantidad,
      precio_venta: producto.precio,
      subtotal: producto.precio * cantidad,
    };

    setItems([...items, nuevoItem]);
    setSelectedCliente(cliente.id);
    form.reset({
      producto: "",
      cantidad: "",
    });
  }

  function eliminarItem(index: number) {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
  }

  // Función para generar y descargar PDF
  const generatePDF = async () => {
    const cliente = clientes.find(c => c.id === selectedCliente);
    const blob = await pdf(
      <InvoicePDF 
        venta={{ id: ventas.length + 1, fecha: new Date().toISOString(), cliente: selectedCliente!, items: [], total: total }}
        cliente={cliente}
        items={items}
        productos={productos}
        total={total}
        iva={iva}
      />
    ).toBlob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `factura-${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function finalizarVenta() {
    if (items.length === 0) {
      toast.error("Agregue al menos un producto");
      return;
    }

    if (!selectedCliente) {
      toast.error("Debe seleccionar un cliente");
      return;
    }

    try {
      const response = await axios.post('https://allison-django-main-gmgm.vercel.app/api/ventas/', {
        cliente: selectedCliente,
        items: items.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precio_venta: item.precio_venta,
        })),
      });

      // Generar y descargar PDF
      await generatePDF();

      // Refrescar la lista de ventas
      const ventasResponse = await axios.get('https://allison-django-main-gmgm.vercel.app/api/ventas/');
      setVentas(ventasResponse.data);

      toast.success("Venta registrada con éxito");
      setItems([]); // Limpiar items después de la venta
      setSelectedCliente(null);
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.detail || "Error al procesar la venta");
      } else if (error.request) {
        toast.error("No se pudo conectar con el servidor");
      } else {
        toast.error("Error al procesar la venta");
      }
    }
  }

  const total = items.reduce((acc, item) => acc + item.subtotal, 0) * 1.15;
  const iva = items.reduce((acc, item) => acc + item.subtotal, 0) * 0.15;

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nueva Venta</h1>

      <div className="grid gap-8">
        <Card className="p-6">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
              <FormField
                  control={form.control}
                  name="cliente"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Cliente</FormLabel>
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
                                ? clientes.find(
                                    (cliente) => cliente.id.toString() === field.value
                                  )?.nombre
                                : "Seleccionar cliente"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Buscar cliente..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full px-2 py-1 mb-2 border rounded"
                            />
                          </div>
                          <div className="max-h-[300px] overflow-auto">
                            {clientes
                              .filter((cliente) =>
                                cliente.nombre
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase())
                              )
                              .map((cliente) => (
                                <div
                                  key={cliente.id}
                                  className={cn(
                                    "flex items-center p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                    field.value === cliente.id.toString() &&
                                      "bg-accent"
                                  )}
                                  onClick={() => {
                                    form.setValue("cliente", cliente.id.toString());
                                    setSearchTerm("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === cliente.id.toString()
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {cliente.nombre}
                                </div>
                              ))}
                          </div>
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
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <div className="p-2">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 mb-2 border rounded"
            />
          </div>
          <div className="max-h-[300px] overflow-auto">
            {productos
              .filter((producto) =>
                producto.nombre
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                producto.codigo
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((producto) => (
                <div
                  key={producto.id}
                  className={cn(
                    "flex items-center p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    (producto.stock === 0 || field.value === producto.id.toString()) &&
                      "opacity-50 cursor-not-allowed",
                    field.value === producto.id.toString() && "bg-accent"
                  )}
                  onClick={() => {
                    if (producto.stock > 0) {
                      form.setValue("producto", producto.id.toString());
                      setSearchTerm(""); // Limpiar término de búsqueda
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      field.value === producto.id.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{producto.nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      Código: {producto.codigo} | Stock: {producto.stock} | Precio: ${producto.precio}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
                <FormField
                  control={form.control}
                  name="cantidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="Cantidad" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Agregar a la venta
              </Button>
            </form>
          </Form>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de venta</h2>
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
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => eliminarItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
          <Button onClick={finalizarVenta} className="w-full mt-4">
            Finalizar Venta
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Historial de Ventas</h2>
          {ventas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay ventas registradas
            </p>
          ) : (
            <div className="space-y-4">
              {ventas.map((venta) => {
                const cliente = clientes.find((c) => c.id === venta.cliente);
                return (
                  <div key={venta.id} className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Venta #{venta.id}</span>
                        <span className="ml-4">{new Date(venta.fecha).toLocaleDateString()}</span>
                      </div>
                      
                    </div>
                    <div className="text-muted-foreground mt-1">
                      Cliente: {cliente?.nombre}
                    </div>
                    <div className="mt-2 space-y-1">
                      {venta.items.map((item, index) => {
                        const producto = productos.find((p) => p.id === item.producto);
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{producto?.nombre} x {item.cantidad}</span>
                            <span>${(item.precio_venta * item.cantidad).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end mt-2 font-bold">
                      <span>Total: ${Number(venta.total).toFixed(2)}</span>
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