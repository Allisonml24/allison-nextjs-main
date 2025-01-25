'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import "./globals.css";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, LogOut } from 'lucide-react'

// Configuración de axios para enviar credenciales
axios.defaults.withCredentials = true

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function AuthComponent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/current-user/`,
        { withCredentials: false }
      )
      
      if (response.data.authenticated) {
        setUser(response.data.user)
      }
    } catch (err) {
      console.log('No hay usuario autenticado')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `${API_URL}/login/`, 
        { username, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setUser(response.data.user)
         
        router.push('https://allison-nextjs-main.vercel.app/dashboard')
        
      }
    } catch (err) {
      setError('Credenciales inválidas')
      console.error(err)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/logout/`,
        {},
        { withCredentials: true }
      )
      setUser(null)
      router.push('/')
    } catch (err) {
      console.error('Error al cerrar sesión', err)
    }
  }

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-white">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Sistema de Papelería Belén</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Usuario</Label>
                <Input 
                  id="username" 
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <Button className="w-full mt-4" type="submit">Iniciar Sesión</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

