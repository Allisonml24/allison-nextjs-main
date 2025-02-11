"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { ArrowUpIcon, ArrowDownIcon, RefreshCw, DollarSign, ShoppingCart, TrendingUp, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Venta {
  id: string
  fecha: string
  total: number
  items: Array<{
    cantidad: number
    producto: string
    precio: number
  }>
}

export function DashboardStats() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("day")

  const fetchVentas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get<Venta[]>("https://allison-django-main-4m3m.vercel.app/api/ventas")
      setVentas(response.data)
      setError(null)
    } catch (err) {
      setError("Error al cargar los datos. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array as it doesn't depend on any external variables

  useEffect(() => {
    fetchVentas()
  }, [fetchVentas])

  const calcularEstadisticas = () => {
    const hoy = new Date()
    const inicioRango = new Date(hoy)

    switch (timeRange) {
      case "week":
        inicioRango.setDate(hoy.getDate() - 7)
        break
      case "month":
        inicioRango.setMonth(hoy.getMonth() - 1)
        break
      default:
        inicioRango.setDate(hoy.getDate() - 1)
    }

    const ventasEnRango = ventas.filter((venta) => new Date(venta.fecha) >= inicioRango)
    const ventasAnteriores = ventas.filter(
      (venta) =>
        new Date(venta.fecha) < inicioRango &&
        new Date(venta.fecha) >= new Date(inicioRango.getTime() - (hoy.getTime() - inicioRango.getTime())),
    )

    const totalVentas = ventasEnRango.reduce((acc, venta) => acc + Number(venta.total), 0)
    const totalProductos = ventasEnRango.reduce(
      (acc, venta) => acc + venta.items.reduce((itemAcc, item) => itemAcc + item.cantidad, 0),
      0,
    )

    const cantidadTransacciones = ventasEnRango.length
    const totalVentasAnteriores = ventasAnteriores.reduce((acc, venta) => acc + Number(venta.total), 0)

    const crecimiento =
      totalVentasAnteriores > 0 ? ((totalVentas - totalVentasAnteriores) / totalVentasAnteriores) * 100 : 0

    const productosMasVendidos = ventasEnRango.reduce(
      (acc, venta) => {
        venta.items.forEach((item) => {
          acc[item.producto] = (acc[item.producto] || 0) + item.cantidad
        })
        return acc
      },
      {} as Record<string, number>,
    )

    const topProductos = Object.entries(productosMasVendidos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const ticketPromedio = totalVentas / cantidadTransacciones || 0

    return {
      totalVentas,
      totalProductos,
      cantidadTransacciones,
      totalVentasAnteriores,
      crecimiento,
      topProductos,
      ticketPromedio,
    }
  }

  const renderStatCard = (
    title: string,
    value: string | number,
    subtitle: string,
    icon: React.ReactNode,
    trend: number,
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <div className={`text-xs mt-2 flex items-center ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
          {trend >= 0 ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
          {Math.abs(trend).toFixed(2)}% vs periodo anterior
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="w-full h-[140px] animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-lg">
        {error}
        <Button onClick={fetchVentas} className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
        </Button>
      </div>
    )
  }

  const {
    totalVentas,
    totalProductos,
    cantidadTransacciones,
    totalVentasAnteriores,
    crecimiento,
    topProductos,
    ticketPromedio,
  } = calcularEstadisticas()

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
      

      <Tabs
        value={timeRange}
        className="w-full"
        onValueChange={(value) => setTimeRange(value as "day" | "week" | "month")}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day">Hoy</TabsTrigger>
          <TabsTrigger value="week">Esta Semana</TabsTrigger>
          <TabsTrigger value="month">Este Mes</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {renderStatCard(
          "Ventas Totales",
          `$${totalVentas.toLocaleString("es-CL", { minimumFractionDigits: 2 })}`,
          `${cantidadTransacciones} transacciones`,
          <DollarSign className="h-4 w-4 text-muted-foreground" />,
          crecimiento,
        )}
        {renderStatCard(
          "Productos Vendidos",
          totalProductos,
          "Unidades vendidas",
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />,
          ((totalProductos - totalVentasAnteriores / ticketPromedio) / (totalVentasAnteriores / ticketPromedio)) * 100,
        )}
        {renderStatCard(
          "Crecimiento",
          `${crecimiento.toFixed(2)}%`,
          "Comparado con periodo anterior",
          <TrendingUp className="h-4 w-4 text-muted-foreground" />,
          crecimiento,
        )}
        {renderStatCard(
          "Ticket Promedio",
          `$${ticketPromedio.toLocaleString("es-CL", { minimumFractionDigits: 2 })}`,
          "Promedio por transacción",
          <CreditCard className="h-4 w-4 text-muted-foreground" />,
          ((ticketPromedio - totalVentasAnteriores / cantidadTransacciones) /
            (totalVentasAnteriores / cantidadTransacciones)) *
            100,
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
       
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ventas Totales</span>
                  <span className="text-sm font-bold">
                    ${totalVentas.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Progress value={(totalVentas / (totalVentas + totalVentasAnteriores)) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ventas Periodo Anterior</span>
                  <span className="text-sm font-bold">
                    ${totalVentasAnteriores.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Progress
                  value={(totalVentasAnteriores / (totalVentas + totalVentasAnteriores)) * 100}
                  className="h-2"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transacciones</span>
                <span className="text-2xl font-bold">{cantidadTransacciones}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Productos Vendidos</span>
                <span className="text-2xl font-bold">{totalProductos}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

