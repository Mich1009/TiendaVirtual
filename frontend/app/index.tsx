// Importar el componente Redirect de expo-router para redirigir a otras pantallas
import { Redirect } from 'expo-router'

/**
 * Componente Index - Pantalla raíz de la aplicación
 * 
 * Esta es la primera pantalla que se carga cuando se abre la app.
 * Su único propósito es redirigir automáticamente al catálogo de productos.
 * 
 * @returns {JSX.Element} Componente que redirige a la pantalla del catálogo
 */
export default function Index() {
  // Redirigir automáticamente a la pantalla de catálogo (/(tabs)/catalog)
  // El usuario nunca ve esta pantalla, es solo un punto de entrada
  return <Redirect href="/(tabs)/catalog" />
}