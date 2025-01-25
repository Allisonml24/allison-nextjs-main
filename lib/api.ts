import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://allison-django-main-c7mj.vercel.app/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Productos
export const getProductos = () => api.get('/productos/').then(res => res.data);
export const getProducto = (id: string) => api.get(`/productos/${id}/`).then(res => res.data);
export const createProducto = (data: any) => api.post('/productos/', data).then(res => res.data);
export const updateProducto = (id: string, data: any) => api.put(`/productos/${id}/`, data).then(res => res.data);
export const deleteProducto = (id: string) => api.delete(`/productos/${id}/`).then(res => res.data);

// Ventas
export const getVentas = () => api.get('/ventas/').then(res => res.data);
export const createVenta = (data: any) => api.post('/ventas/', data).then(res => res.data);
export const getVentaDetalle = (id: string) => api.get(`/ventas/${id}/`).then(res => res.data);

// Compras
export const getCompras = () => api.get('/compras/').then(res => res.data);
export const createCompra = (data: any) => api.post('/compras/', data).then(res => res.data);
export const getCompraDetalle = (id: string) => api.get(`/compras/${id}/`).then(res => res.data);