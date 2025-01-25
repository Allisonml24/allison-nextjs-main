// hooks/useProductos.ts
import useSWR from 'swr';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/productos/';

const fetcher = (url: string) => 
  axios.get(url).then(response => response.data);

export const useProductos = () => {
  const { data: productos, error, mutate } = useSWR(API_URL, fetcher);

  return {
    productos,
    isLoading: !error && !productos,
    isError: error,
    mutate
  };
};

export const createProducto = async (producto: any) => {
  try {
    const response = await axios.post(API_URL, producto);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProducto = async (id: number, producto: any) => {
  try {
    const response = await axios.put(`${API_URL}${id}/`, producto);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProducto = async (id: number) => {
  try {
    await axios.delete(`${API_URL}${id}/`);
  } catch (error) {
    throw error;
  }
};