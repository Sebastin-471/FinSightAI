# Panel de Predicción de Trading

## Visión General

Esta es una aplicación de predicción de trading full-stack construida con React y Express que utiliza Inteligencia Artificial para predecir movimientos de precios a corto plazo en acciones, divisas (forex) y criptomonedas. El sistema ofrece visualización en tiempo real de datos del mercado, indicadores de análisis técnico y predicciones de trading impulsadas por IA con porcentajes de confianza.

## Arquitectura del Sistema

### Arquitectura del Frontend

* **Framework**: React con TypeScript y sistema de construcción Vite
* **Librería UI**: Componentes Radix UI con el sistema de diseño shadcn/ui
* **Estilos**: Tailwind CSS con tema oscuro personalizado
* **Gestión de Estado**: TanStack Query para el manejo del estado del servidor
* **Actualizaciones en Tiempo Real**: Conexión WebSocket para datos de mercado en vivo
* **Gráficos**: Chart.js para gráficos de precios interactivos e indicadores técnicos

### Arquitectura del Backend

* **Framework**: Express.js con TypeScript
* **Base de Datos**: PostgreSQL con Drizzle ORM
* **Comunicación en Tiempo Real**: Servidor WebSocket para actualizaciones en vivo
* **Datos del Mercado**: Integración con APIs financieras (Yahoo Finance, Alpha Vantage)
* **Motor de Predicción**: Algoritmos personalizados de análisis técnico y predicción con IA

### Componentes Clave

1. **Servicio de Datos del Mercado**: Obtiene datos de precios en tiempo real desde múltiples fuentes
2. **Motor de Análisis Técnico**: Calcula indicadores como SMA, EMA, RSI, MACD y Bandas de Bollinger
3. **Servicio de Predicción**: Genera predicciones de compra/venta con porcentajes de confianza
4. **Servidor WebSocket**: Transmite actualizaciones en tiempo real a los clientes conectados
5. **Capa de Almacenamiento**: Administra los datos del mercado, predicciones y métricas de rendimiento

## Flujo de Datos

1. **Recolección de Datos**: El servicio de datos del mercado obtiene precios en tiempo real desde APIs
2. **Análisis Técnico**: Se calculan los indicadores y se almacenan en la base de datos
3. **Generación de Predicciones**: El motor de IA analiza patrones y genera predicciones
4. **Difusión en Tiempo Real**: El servidor WebSocket envía actualizaciones al frontend
5. **Interfaz de Usuario**: El panel muestra gráficos, predicciones y métricas de rendimiento

## Dependencias Externas

### APIs de Datos Financieros

* API de Yahoo Finance para datos bursátiles
* Alpha Vantage para forex y datos de mercado adicionales
* Alternativa de datos simulados para desarrollo

### Base de Datos

* PostgreSQL para almacenamiento de datos en producción
* Integración serverless con Neon Database
* Almacenamiento en memoria para desarrollo y pruebas

### Componentes UI

* Primitivos de Radix UI para accesibilidad
* Iconos de Lucide para iconografía consistente
* Chart.js para visualización de datos

## Estrategia de Despliegue

### Desarrollo

* Servidor de desarrollo Vite para recarga en caliente del frontend
* Servidor Express con compilación TypeScript
* Servidor WebSocket para funcionalidades en tiempo real
* Servicios de datos simulados para desarrollo sin conexión

### Producción

* Proceso de build con Vite para un bundle optimizado del frontend
* ESBuild para empaquetado del backend
* Configuración basada en variables de entorno
* Migraciones de base de datos con Drizzle Kit

### Configuración

* Variables de entorno para claves API y URLs de base de datos
* Configuración de Tailwind CSS con esquema de colores personalizado
* Alias de rutas en TypeScript para imports limpios

## Registro de Cambios

Changelog:

* 07 de julio de 2025. Configuración inicial

## Preferencias del Usuario

Estilo de comunicación preferido: Lenguaje simple y cotidiano.
