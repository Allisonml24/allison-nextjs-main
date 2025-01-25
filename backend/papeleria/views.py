from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Producto, Venta, VentaItem, Compra, CompraItem
from .serializers import (
    ProductoSerializer, 
    VentaSerializer, 
    CompraSerializer
)

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    lookup_field = 'id'

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        items_data = request.data.get('items', [])
        
        # Crear la venta
        venta = Venta.objects.create()
        
        # Procesar cada item
        for item_data in items_data:
            producto = Producto.objects.get(id=item_data['producto'])
            cantidad = item_data['cantidad']
            
            # Verificar stock
            if producto.stock < cantidad:
                transaction.set_rollback(True)
                return Response(
                    {'error': f'Stock insuficiente para {producto.nombre}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear el item de venta
            VentaItem.objects.create(
                venta=venta,
                producto=producto,
                cantidad=cantidad,
                precio_venta=producto.precio
            )
            
            # Actualizar stock
            producto.stock -= cantidad
            producto.save()
        
        venta.refresh_from_db()
        serializer = self.get_serializer(venta)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CompraViewSet(viewsets.ModelViewSet):
    queryset = Compra.objects.all()
    serializer_class = CompraSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        items_data = request.data.get('items', [])
        
        # Crear la compra
        compra = Compra.objects.create()
        
        # Procesar cada item
        for item_data in items_data:
            producto = Producto.objects.get(id=item_data['producto'])
            
            # Crear el item de compra
            CompraItem.objects.create(
                compra=compra,
                producto=producto,
                cantidad=item_data['cantidad'],
                precio_compra=item_data['precio_compra']
            )
        
        compra.refresh_from_db()
        serializer = self.get_serializer(compra)
        return Response(serializer.data, status=status.HTTP_201_CREATED)