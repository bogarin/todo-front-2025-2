/**
 * ============================================================================
 * COMPONENTE: TodoPage
 * ============================================================================
 * 
 * RESPONSABILIDAD: VISTA PRINCIPAL (UI + COORDINACIÓN)
 * 
 * Este componente es la PÁGINA PRINCIPAL de la aplicación.
 * Combina LÓGICA y DISEÑO pero de forma organizada:
 * 
 * LÓGICA (lo que hace):
 * - Consume el hook useTodos (lógica de negocio)
 * - Maneja el estado de UI (filtros, búsqueda)
 * - Coordina la comunicación entre componentes hijos
 * 
 * DISEÑO (lo que muestra):
 * - Layout y estructura visual
 * - Clases de Tailwind CSS para estilos
 * - Renderiza componentes hijos (AddTodoForm, TodoList, etc.)
 * 
 * SEPARACIÓN CLARA:
 * ✅ LÓGICA DE NEGOCIO: Delegada al hook useTodos
 * ✅ LÓGICA DE UI: Estado de filtros y búsqueda (local a este componente)
 * ✅ DISEÑO: Clases de Tailwind y estructura HTML
 * ============================================================================
 */

import { AlertCircle, Loader, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddTodoForm from '../components/AddTodoForm';
import TodoList from '../components/TodoList';
import { useTodos } from '../hooks/useTodos';
import type { FilterType } from '../types/todo.types';

export default function TodoPage() {
  // ========================================================================
  // LÓGICA: Consume el hook personalizado (toda la lógica de negocio)
  // ========================================================================
  const {
    loading,              // Estado de carga
    error,                // Mensaje de error
    initialLoading,       // Carga inicial
    searchTodos,          // Función para buscar
    addTodo,              // Función para agregar tarea
    toggleTodo,           // Función para alternar completado
    changeStatus,         // Función para cambiar estado
    deleteTodoById,       // Función para eliminar una tarea
    deleteAllCompleted,   // Función para eliminar todas las completadas
    getFilteredTodos,     // Función para filtrar tareas
    getCounts             // Función para obtener contadores
  } = useTodos();

  // ========================================================================
  // ESTADO LOCAL DE UI: Solo para controlar la interfaz
  // ========================================================================
  const [filter, setFilter] = useState<FilterType>('all');  // Filtro activo
  const [searchTerm, setSearchTerm] = useState('');          // Término de búsqueda

  // ========================================================================
  // EFECTO: Implementa debounce para la búsqueda (espera 500ms)
  // ========================================================================
  useEffect(() => {
    // Espera 500ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(() => {
      searchTodos(searchTerm);
    }, 500);

    // Limpia el timeout si el usuario sigue escribiendo
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // ========================================================================
  // CÁLCULOS: Obtiene las tareas filtradas y los contadores
  // ========================================================================
  const filteredTodos = getFilteredTodos(filter);
  const { completedCount, cancelledCount, activeCount, totalCount } = getCounts();

  // ========================================================================
  // RENDERIZADO CONDICIONAL: Muestra spinner mientras carga
  // ========================================================================
  if (initialLoading) {
    return (
      // DISEÑO: Pantalla de carga con fondo gradiente y spinner centrado
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-8 h-8 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // FUNCIÓN AUXILIAR: Determina el mensaje a mostrar cuando no hay tareas
  // ========================================================================
  const getEmptyMessage = () => {
    switch (filter) {
      case 'active':
        return 'No hay tareas activas';
      case 'completed':
        return 'No hay tareas completadas';
      case 'cancelled':
        return 'No hay tareas canceladas';
      default:
        return 'No hay tareas aún. ¡Crea tu primera tarea!';
    }
  };

  // ========================================================================
  // RENDERIZADO PRINCIPAL: JSX con diseño y estructura
  // ========================================================================
  return (
    // DISEÑO: Contenedor principal con fondo gradiente fijo y scroll
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        {/* DISEÑO: Contenedor centrado con ancho máximo */}
        <div className="max-w-3xl mx-auto">
        
        {/* ============================================================
            SECCIÓN: HEADER - Título y estado de conexión
            ============================================================ */}
        <div className="text-center mb-8">
          {/* DISEÑO: Título principal */}
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TODO App</h1>
          <p className="text-gray-600">Organiza tus tareas diarias</p>
          
          {/* DISEÑO: Indicador de conexión (verde=ok, rojo=error) */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className="text-sm text-gray-500">
              {error ? 'Sin conexión' : 'Conectado al backend'}
            </span>
          </div>
        </div>

        {/* ============================================================
            SECCIÓN: MENSAJE DE ERROR (se muestra condicionalmente)
            ============================================================ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* ============================================================
            COMPONENTE: Formulario para agregar tareas
            LÓGICA: Recibe la función addTodo del hook
            DISEÑO: Todo el diseño está dentro de AddTodoForm
            ============================================================ */}
        <AddTodoForm onAdd={addTodo} loading={loading} />

        {/* ============================================================
            SECCIÓN: BARRA DE BÚSQUEDA
            LÓGICA: Controla searchTerm (estado local de UI)
            DISEÑO: Input con icono, botón de limpiar y contador
            ============================================================ */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            {/* DISEÑO: Icono de búsqueda a la izquierda */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            
            {/* LÓGICA: Input controlado que actualiza searchTerm */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tareas por título..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* DISEÑO: Botón para limpiar búsqueda (se muestra solo si hay texto) */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {/* DISEÑO: Contador de resultados (se muestra solo al buscar) */}
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              {filteredTodos.length} {filteredTodos.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
          )}
        </div>

        {/* ============================================================
            SECCIÓN: FILTROS (Todas, Activas, Completadas, Canceladas)
            LÓGICA: Controla filter (estado local de UI)
            DISEÑO: Botones con contadores
            ============================================================ */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-center gap-2 flex-wrap">
            {(['all', 'active', 'completed', 'cancelled'] as FilterType[]).map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filter === filterType
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' ? `Todas (${totalCount})` : 
                 filterType === 'active' ? `Activas (${activeCount})` : 
                 filterType === 'completed' ? `Completadas (${completedCount})` :
                 `Canceladas (${cancelledCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de tareas */}
        <TodoList
          todos={filteredTodos}
          searchTerm={searchTerm}
          onToggle={toggleTodo}
          onChangeStatus={changeStatus}
          onDelete={deleteTodoById}
          emptyMessage={getEmptyMessage()}
        />

        {/* Footer con estadísticas y acciones */}
        {totalCount > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mt-6">
            <div className="flex justify-between items-center text-sm text-gray-600 flex-wrap gap-3">
              <span>
                {activeCount} {activeCount === 1 ? 'tarea activa' : 'tareas activas'}
              </span>
              {completedCount > 0 && (
                <button
                  onClick={deleteAllCompleted}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                  title={`Eliminar ${completedCount} tareas completadas`}
                >
                  {loading ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  Eliminar todas completadas ({completedCount})
                </button>
              )}
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
