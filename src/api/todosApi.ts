/**
 * ============================================================================
 * CAPA DE API: todosApi.ts
 * ============================================================================
 * 
 * RESPONSABILIDAD: COMUNICACIÓN CON EL BACKEND
 * 
 * Este archivo contiene TODAS las funciones que se comunican con el backend.
 * Es la ÚNICA capa que conoce los detalles de la API REST:
 * - URLs de los endpoints
 * - Métodos HTTP (GET, POST, PUT, DELETE)
 * - Headers y formato de datos
 * - Manejo de respuestas y errores HTTP
 * 
 * SEPARACIÓN DE RESPONSABILIDADES:
 * ✅ LÓGICA DE COMUNICACIÓN: Este archivo
 * ❌ LÓGICA DE NEGOCIO: Hook useTodos (quien USA estas funciones)
 * ❌ UI/DISEÑO: Componentes (quienes usan el hook)
 * 
 * VENTAJAS DE ESTA ARQUITECTURA:
 * 1. Si cambia la URL del backend, solo modificas este archivo
 * 2. Si cambias de fetch a axios, solo modificas este archivo
 * 3. Fácil de testear (puedes mockear estas funciones)
 * 4. Código reutilizable (cualquier componente puede importar estas funciones)
 * 
 * PATRÓN: Repository Pattern / Service Layer
 * ============================================================================
 */

import type { CreateTodoDto, Todo, UpdateTodoDto } from '../types/todo.types';

// ============================================================================
// CONFIGURACIÓN: URL base del backend
// ============================================================================
const API_BASE_URL = 'http://localhost:8080/api/v1';

// ============================================================================
// FUNCIONES DE API: Cada función representa una operación HTTP
// ============================================================================

/**
 * GET /todos - Obtiene todas las tareas del backend
 * 
 * @returns Promise<Todo[]> - Array de tareas
 * @throws Error si la petición falla
 */
export const fetchAllTodos = async (): Promise<Todo[]> => {
  // Hace la petición GET al endpoint /todos
  const response = await fetch(`${API_BASE_URL}/todos`);
  
  // Verifica si la respuesta es exitosa (status 200-299)
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  // Parsea y devuelve el JSON (array de tareas)
  return await response.json();
};

/**
 * GET /todos/search?q=texto - Busca tareas por título
 * 
 * @param query - Término de búsqueda
 * @returns Promise<Todo[]> - Array de tareas que coinciden con la búsqueda
 * @throws Error si la petición falla
 */
export const searchTodos = async (query: string): Promise<Todo[]> => {
  // encodeURIComponent asegura que caracteres especiales se codifiquen correctamente
  const response = await fetch(`${API_BASE_URL}/todos/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
};

/**
 * POST /todos - Crea una nueva tarea en el backend
 * 
 * @param todoData - Objeto con title y description
 * @returns Promise<Todo> - La tarea creada (incluye el ID generado por el backend)
 * @throws Error si la petición falla o hay error de validación
 */
export const createTodo = async (todoData: CreateTodoDto): Promise<Todo> => {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',                                    // Método HTTP POST para crear
    headers: {
      'Content-Type': 'application/json',              // Indica que enviamos JSON
    },
    body: JSON.stringify(todoData)                     // Convierte el objeto a JSON
  });

  if (!response.ok) {
    // Intenta obtener el mensaje de error del backend
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  // Devuelve la tarea creada con su ID
  return await response.json();
};

/**
 * PUT /todos/update/:id - Actualiza una tarea existente
 * 
 * @param id - ID de la tarea a actualizar
 * @param todoData - Datos actualizados (title, description, status)
 * @returns Promise<Todo> - La tarea actualizada
 * @throws Error si la petición falla
 */
export const updateTodo = async (id: number, todoData: UpdateTodoDto): Promise<Todo> => {
  const response = await fetch(`${API_BASE_URL}/todos/update/${id}`, {
    method: 'PUT',                                     // Método HTTP PUT para actualizar
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todoData)                     // Envía los datos actualizados
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  // Devuelve la tarea actualizada
  return await response.json();
};

/**
 * DELETE /todos/delete/:id - Elimina una tarea del backend
 * 
 * @param id - ID de la tarea a eliminar
 * @returns Promise<void> - No devuelve nada si es exitoso
 * @throws Error si la petición falla
 */
export const deleteTodo = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/todos/delete/${id}`, {
    method: 'DELETE'                                   // Método HTTP DELETE para eliminar
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  // No devuelve nada, solo verifica que fue exitoso
};

/**
 * Elimina múltiples tareas en paralelo
 * 
 * Esta función NO es un endpoint, sino una utilidad que usa deleteTodo
 * múltiples veces en paralelo para optimizar el tiempo de eliminación.
 * 
 * @param ids - Array de IDs de tareas a eliminar
 * @returns Promise<void> - Resuelve cuando todas las eliminaciones terminan
 * @throws Error si alguna eliminación falla
 */
export const deleteMultipleTodos = async (ids: number[]): Promise<void> => {
  // Crea un array de promesas (una por cada tarea a eliminar)
  const deletePromises = ids.map(id => deleteTodo(id));
  
  // Espera a que TODAS las promesas se completen
  // Si alguna falla, Promise.all lanza un error
  await Promise.all(deletePromises);
};

// ============================================================================
// EXPORTACIÓN: Hace disponible la URL base para otros archivos
// ============================================================================
export { API_BASE_URL };
