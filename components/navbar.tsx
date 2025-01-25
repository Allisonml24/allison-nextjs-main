"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Store, Paperclip, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE_URL = "https://allison-django-main-4m3m.vercel.app";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme);
    setIsDarkMode(newTheme === "dark");
  };

  const handleLogout = async () => {
    try {
      

      await axios.post(`${API_BASE_URL}/api/logout/`, {}, {
        withCredentials: true
      });
      router.push('https://allison-nextjs-main.vercel.app');
      
      
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Paperclip className="h-6 w-6" />
          <span className="font-bold text-xl">Papelería Belén</span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link href="/dashboard/inventario">
            <Button variant="ghost">Inventario</Button>
          </Link>
          <Link href="/dashboard/compras">
            <Button variant="ghost">Compras</Button>
          </Link>
          <Link href="/dashboard/venta-nueva">
            <Button variant="ghost">Ventas</Button>
          </Link>
          <Link href="/dashboard/clientes">
            <Button variant="ghost">Clientes</Button>
          </Link>
          <Link href="/dashboard/proveedores">
            <Button variant="ghost">Proveedores</Button>
          </Link>
          
          <Button variant="ghost" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}