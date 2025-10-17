/**
 * ============================================================================
 * HOOK PERSONALIZADO: useTodos
 * ============================================================================
 * 
 * RESPONSABILIDAD: LÓGICA DE NEGOCIO
 * 
 * Este hook contiene TODA la lógica de negocio para gestionar las tareas (TODOs).
 * Se encarga de:
 * - Gestionar el estado de las tareas
 * - Comunicarse con el backend (API)
 * - Manejar errores y estados de carga
 * - Proporcionar funciones CRUD (Create, Read, Update, Delete)
 * 
 * SEPARACIÓN DE RESPONSABILIDADES:
 * ✅ LÓGICA: Este archivo
 * ❌ UI/DISEÑO: NO contiene nada de diseño, solo funciones y estado
 * 
 * Los componentes UI solo consumen las funciones y el estado de este hook,
 * sin preocuparse de CÓMO funcionan internamente.
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import * as todosApi from '../api/todosApi';
import type { CreateTodoDto, FilterType, Todo, TodoStatus } from '../types/todo.types';

export const useTodos = () => {
    // ========================================================================
    // ESTADO - Variables de estado del hook
    // ========================================================================
    const [todos, setTodos] = useState<Todo[]>([]);              // Lista de todas las tareas
    const [loading, setLoading] = useState(false);               // Estado de carga para operaciones
    const [error, setError] = useState('');                      // Mensaje de error para mostrar al usuario
    const [initialLoading, setInitialLoading] = useState(true);  // Carga inicial al montar el componente

    // ========================================================================
    // MANEJO DE ERRORES - Función utilitaria para gestionar errores de API
    // ========================================================================
    const handleApiError = (error: unknown, defaultMessage: string) => {
        // Extrae el mensaje de error o usa el mensaje por defecto
        const errorMessage = error instanceof Error ? error.message : defaultMessage;
        setError(errorMessage);
        // Limpia el error después de 5 segundos
        setTimeout(() => setError(''), 5000);
    };

    // ========================================================================
    // OPERACIONES CRUD - Funciones para interactuar con el backend
    // ========================================================================

    /**
     * Obtiene todas las tareas del backend
     * Se ejecuta al iniciar la aplicación
     */
    const fetchTodos = async () => {
        try {
            setInitialLoading(true);                      // Activa el spinner de carga inicial
            const data = await todosApi.fetchAllTodos(); // Llama al backend
            setTodos(data);                               // Actualiza el estado con las tareas
        } catch (error) {
            handleApiError(error, 'Error al cargar las tareas');
            setTodos([]);                                 // Limpia las tareas en caso de error
        } finally {
            setInitialLoading(false);                     // Desactiva el spinner
        }
    };

    /**
     * Busca tareas por título en el backend
     * Si el término de búsqueda está vacío, obtiene todas las tareas
     */
    const searchTodos = async (query: string) => {
        // Si no hay texto de búsqueda, obtiene todas las tareas
        if (!query.trim()) {
            fetchTodos();
            return;
        }

        try {
            setLoading(true);                            // Activa el indicador de carga
            const data = await todosApi.searchTodos(query); // Busca en el backend
            setTodos(data);                               // Actualiza con los resultados
        } catch (error) {
            handleApiError(error, 'Error al buscar tareas');
        } finally {
            setLoading(false);                           // Desactiva el indicador de carga
        }
    };

    /**
     * Crea una nueva tarea en el backend
     * Valida que título y descripción no estén vacíos
     * @returns true si la tarea se creó exitosamente, false en caso contrario
     */
    const addTodo = async (todoData: CreateTodoDto): Promise<boolean> => {
        // VALIDACIÓN: Verifica que los campos no estén vacíos
        if (todoData.title.trim() === '' || todoData.description.trim() === '') {
            setError('Título y descripción son requeridos');
            setTimeout(() => setError(''), 3000);
            return false;
        }

        try {
            setLoading(true);
            // Crea la tarea en el backend
            const newTodo = await todosApi.createTodo({
                title: todoData.title.trim(),
                description: todoData.description.trim()
            });
            // Agrega la nueva tarea al estado local
            setTodos([...todos, newTodo]);
            return true; // Indica éxito
        } catch (error) {
            handleApiError(error, 'Error al crear la tarea');
            return false; // Indica fallo
        } finally {
            setLoading(false);
        }
    };

    /**
     * Alterna el estado de una tarea entre COMPLETED y PENDING
     * Útil para el checkbox de completar/descompletar
     */
    const toggleTodo = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return; // Si no existe la tarea, no hace nada

        try {
            // Alterna entre COMPLETED y PENDING
            const newStatus: TodoStatus = todo.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
            // Actualiza en el backend
            const updatedTodo = await todosApi.updateTodo(id, {
                title: todo.title,
                description: todo.description,
                status: newStatus
            });
            // Actualiza el estado local reemplazando la tarea modificada
            setTodos(todos.map(t => t.id === id ? updatedTodo : t));
        } catch (error) {
            handleApiError(error, 'Error al actualizar la tarea');
        }
    };

    /**
     * Cambia el estado de una tarea a un estado específico
     * Permite cambiar entre PENDING, IN_PROGRESS, COMPLETED, CANCELLED
     */
    const changeStatus = async (id: number, newStatus: TodoStatus) => {
        console.log(newStatus);
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            // Actualiza la tarea con el nuevo estado en el backend
            const updatedTodo = await todosApi.updateTodo(id, {
                title: todo.title,
                description: todo.description,
                status: newStatus
            });
            // Actualiza el estado local
            setTodos(todos.map(t => t.id === id ? updatedTodo : t));
        } catch (error) {
            handleApiError(error, 'Error al cambiar el estado');
        }
    };

    /**
     * Elimina una tarea individual
     * Muestra un diálogo de confirmación antes de eliminar
     */
    const deleteTodoById = async (id: number) => {
        // Pide confirmación al usuario
        if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) {
            return;
        }

        try {
            await todosApi.deleteTodo(id);            // Elimina en el backend
            setTodos(todos.filter(todo => todo.id !== id)); // Elimina del estado local
        } catch (error) {
            handleApiError(error, 'Error al eliminar la tarea');
        }
    };

    /**
     * Elimina todas las tareas con estado COMPLETED
     * Útil para limpiar tareas terminadas de una vez
     */
    const deleteAllCompleted = async () => {
        const completedTodos = todos.filter(todo => todo.status === 'COMPLETED');

        // Si no hay tareas completadas, no hace nada
        if (completedTodos.length === 0) return;

        // Pide confirmación con el número de tareas a eliminar
        if (!window.confirm(`¿Estás seguro de eliminar ${completedTodos.length} tareas completadas?`)) {
            return;
        }

        try {
            setLoading(true);
            // Extrae los IDs de las tareas completadas
            const completedIds = completedTodos.map(todo => todo.id);
            // Elimina todas en el backend
            await todosApi.deleteMultipleTodos(completedIds);
            // Actualiza el estado local eliminando las completadas
            setTodos(todos.filter(todo => todo.status !== 'COMPLETED'));
        } catch (error) {
            handleApiError(error, 'Error al eliminar tareas completadas');
        } finally {
            setLoading(false);
        }
    };

    // ========================================================================
    // FUNCIONES AUXILIARES - Operaciones de filtrado y cálculos
    // ========================================================================

    /**
     * Filtra las tareas según el tipo de filtro seleccionado
     * - all: Todas las tareas
     * - active: Tareas pendientes o en progreso
     * - completed: Tareas completadas
     * - cancelled: Tareas canceladas
     */
    const getFilteredTodos = (filter: FilterType): Todo[] => {
        switch (filter) {
            case 'active':
                // Devuelve tareas que están PENDING o IN_PROGRESS
                return todos.filter(todo => todo.status === 'PENDING' || todo.status === 'IN_PROGRESS');
            case 'completed':
                // Devuelve solo tareas COMPLETED
                return todos.filter(todo => todo.status === 'COMPLETED');
            case 'cancelled':
                // Devuelve solo tareas CANCELLED
                return todos.filter(todo => todo.status === 'CANCELLED');
            default:
                // Devuelve todas las tareas
                return todos;
        }
    };

    /**
     * Calcula los contadores de tareas por estado
     * Útil para mostrar badges en los filtros
     */
    const getCounts = () => {
        const completedCount = todos.filter(todo => todo.status === 'COMPLETED').length;
        const cancelledCount = todos.filter(todo => todo.status === 'CANCELLED').length;
        const activeCount = todos.length - completedCount - cancelledCount;

        return { completedCount, cancelledCount, activeCount, totalCount: todos.length };
    };

    // ========================================================================
    // EFECTO - Se ejecuta al montar el componente
    // ========================================================================
    useEffect(() => {
        fetchTodos(); // Carga todas las tareas al iniciar
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========================================================================
    // RETORNO - API pública del hook
    // ========================================================================
    // Devuelve todas las funciones y estado que los componentes necesitan
    return {
        // Estado
        todos,              // Array de todas las tareas
        loading,            // Indicador de carga para operaciones
        error,              // Mensaje de error para mostrar
        initialLoading,     // Indicador de carga inicial

        // Funciones CRUD
        fetchTodos,         // Obtener todas las tareas
        searchTodos,        // Buscar tareas por título
        addTodo,            // Crear una nueva tarea
        toggleTodo,         // Alternar estado COMPLETED/PENDING
        changeStatus,       // Cambiar a un estado específico
        deleteTodoById,     // Eliminar una tarea
        deleteAllCompleted, // Eliminar todas las completadas

        // Funciones auxiliares
        getFilteredTodos,   // Filtrar tareas por estado
        getCounts           // Obtener contadores de tareas
    };
};
