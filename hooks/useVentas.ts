"use client";

import useSWR from 'swr';
import { getVentas } from '@/lib/api';

export function useVentas() {
  const { data, error, isLoading, mutate } = useSWR('ventas', getVentas);

  return {
    ventas: data,
    isLoading,
    isError: error,
    mutate,
  };
}