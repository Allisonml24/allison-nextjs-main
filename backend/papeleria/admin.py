from django.contrib import admin
from .models import Producto, Venta, VentaItem, Compra, CompraItem

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'precio', 'stock']
    search_fields = ['codigo', 'nombre']
    list_filter = ['created_at']
    ordering = ['nombre']

class VentaItemInline(admin.TabularInline):
    model = VentaItem
    extra = 1
    readonly_fields = ['subtotal']

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ['id', 'fecha', 'total']
    readonly_fields = ['total']
    inlines = [VentaItemInline]
    ordering = ['-fecha']

class CompraItemInline(admin.TabularInline):
    model = CompraItem
    extra = 1
    readonly_fields = ['subtotal']

@admin.register(Compra)
class CompraAdmin(admin.ModelAdmin):
    list_display = ['id', 'fecha', 'total']
    readonly_fields = ['total']
    inlines = [CompraItemInline]
    ordering = ['-fecha']