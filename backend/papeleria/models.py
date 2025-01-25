from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Producto(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class Venta(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'

    def __str__(self):
        return f"Venta #{self.id} - {self.fecha.strftime('%d/%m/%Y %H:%M')}"

    def calcular_total(self):
        self.total = sum(item.subtotal for item in self.items.all())
        self.save()

class VentaItem(models.Model):
    venta = models.ForeignKey(
        Venta, 
        related_name='items', 
        on_delete=models.CASCADE
    )
    producto = models.ForeignKey(
        Producto, 
        related_name='ventas', 
        on_delete=models.PROTECT
    )
    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    precio_venta = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    subtotal = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        editable=False
    )

    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_venta
        super().save(*args, **kwargs)
        self.venta.calcular_total()

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"

class Compra(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Compra'
        verbose_name_plural = 'Compras'

    def __str__(self):
        return f"Compra #{self.id} - {self.fecha.strftime('%d/%m/%Y %H:%M')}"

    def calcular_total(self):
        self.total = sum(item.subtotal for item in self.items.all())
        self.save()

class CompraItem(models.Model):
    compra = models.ForeignKey(
        Compra, 
        related_name='items', 
        on_delete=models.CASCADE
    )
    producto = models.ForeignKey(
        Producto, 
        related_name='compras', 
        on_delete=models.PROTECT
    )
    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    precio_compra = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    subtotal = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        editable=False
    )

    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_compra
        # Actualizar el stock del producto
        self.producto.stock += self.cantidad
        self.producto.save()
        # Guardar el item y actualizar el total de la compra
        super().save(*args, **kwargs)
        self.compra.calcular_total()

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"