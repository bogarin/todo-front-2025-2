/**
 * ============================================================================
 * COMPONENTE: AddTodoForm
 * ============================================================================
 * 
 * RESPONSABILIDAD: FORMULARIO DE CREACIÓN (UI + LÓGICA LOCAL)
 * 
 * Este componente muestra un formulario para crear nuevas tareas.
 * 
 * SEPARACIÓN DE RESPONSABILIDADES:
 * 
 * LÓGICA LOCAL (controlada por este componente):
 * - Estado del formulario (showForm, title, description)
 * - Validación de campos vacíos
 * - Limpiar campos después de crear
 * 
 * LÓGICA DE NEGOCIO (delegada al padre):
 * - La función onAdd viene del hook useTodos (a través de TodoPage)
 * - Este componente NO sabe cómo se crea una tarea en el backend
 * - Solo llama a onAdd y espera un resultado true/false
 * 
 * DISEÑO:
 * - Dos estados visuales: botón o formulario expandido
 * - Inputs controlados con Tailwind CSS
 * - Animaciones y transiciones
 * ============================================================================
 */

import { Loader, Plus, X } from "lucide-react";
import { useState } from "react";
import type { CreateTodoDto } from "../types/todo.types";

// Tipos de las props que recibe este componente
interface AddTodoFormProps {
  onAdd: (todo: CreateTodoDto) => Promise<boolean>;  // Función para crear tarea (viene del hook)
  loading: boolean;                                   // Estado de carga (viene del hook)
}

export default function AddTodoForm({ onAdd, loading }: AddTodoFormProps) {
  // ========================================================================
  // ESTADO LOCAL: Solo controla la UI de este componente
  // ========================================================================
  const [showForm, setShowForm] = useState(false);    // Muestra u oculta el formulario
  const [title, setTitle] = useState("");             // Valor del campo título
  const [description, setDescription] = useState(""); // Valor del campo descripción

  // ========================================================================
  // MANEJADORES: Funciones que responden a eventos de usuario
  // ========================================================================
  
  /**
   * Maneja el envío del formulario
   * LÓGICA: Llama a onAdd (que viene del hook) y limpia si es exitoso
   */
  const handleSubmit = async () => {
    // Llama a la función que viene del padre (que viene del hook)
    const success = await onAdd({ title, description });
    
    // Si fue exitoso, limpia el formulario y lo oculta
    if (success) {
      setTitle("");
      setDescription("");
      setShowForm(false);
    }
  };

  /**
   * Maneja la cancelación del formulario
   * LÓGICA: Oculta el formulario y limpia los campos
   */
  const handleCancel = () => {
    setShowForm(false);
    setTitle("");
    setDescription("");
  };

  // ========================================================================
  // RENDERIZADO CONDICIONAL: Botón o Formulario
  // ========================================================================
  
  // Si el formulario está oculto, muestra solo el botón
  if (!showForm) {
    return (
      // DISEÑO: Botón grande para mostrar el formulario
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Agregar Nueva Tarea
        </button>
      </div>
    );
  }

  // ========================================================================
  // FORMULARIO EXPANDIDO: Inputs y botones
  // ========================================================================
  return (
    // DISEÑO: Tarjeta blanca con sombra
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      
      {/* DISEÑO: Header del formulario con título y botón cerrar */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Nueva Tarea</h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* DISEÑO: Contenedor de campos con espacio entre ellos */}
      <div className="space-y-4">
        
        {/* Campo: Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          {/* LÓGICA: Input controlado conectado al estado title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Comprar víveres"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* Campo: Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          {/* LÓGICA: Textarea controlado conectado al estado description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe los detalles de la tarea..."
            rows={3}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          {/* LÓGICA: Botón deshabilitado si está cargando o los campos están vacíos */}
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !description.trim()}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {/* DISEÑO: Muestra spinner mientras carga, icono + cuando no */}
            {loading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <Plus size={20} />
            )}
            Crear Tarea
          </button>
          
          {/* Botón cancelar */}
          <button
            onClick={handleCancel}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
