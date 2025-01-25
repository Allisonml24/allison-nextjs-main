from rest_framework import serializers
from .models import Producto, Venta, VentaItem, Compra, CompraItem

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'codigo', 'nombre', 'descripcion', 'precio', 'stock']

class VentaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = VentaItem
        fields = ['producto', 'cantidad', 'precio_venta', 'subtotal']

class VentaSerializer(serializers.ModelSerializer):
    items = VentaItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Venta
        fields = ['id', 'fecha', 'total', 'items']
        read_only_fields = ['total']

class CompraItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompraItem
        fields = ['producto', 'cantidad', 'precio_compra', 'subtotal']

class CompraSerializer(serializers.ModelSerializer):
    items = CompraItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Compra
        fields = ['id', 'fecha', 'total', 'items']
        read_only_fields = ['total']