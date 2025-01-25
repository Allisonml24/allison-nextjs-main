import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVentas } from "@/hooks/useVentas";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function RecentSales() {
  const { ventas, isLoading, isError } = useVentas();

  if (isLoading) return <div>Cargando ventas...</div>;
  if (isError) return <div>Error al cargar ventas</div>;

  const ventasRecientes = ventas?.slice(0, 5) || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Ventas Recientes</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventasRecientes.map((venta: any) => (
              <TableRow key={venta.id}>
                <TableCell>
                  {format(new Date(venta.fecha), "PPp", { locale: es })}
                </TableCell>
                <TableCell>{venta.items.length} productos</TableCell>
                <TableCell className="text-right">
                  ${venta.total.toFixed(2)}
                </TableCell>
               
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}