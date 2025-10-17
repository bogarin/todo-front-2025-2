import { Check, Circle, X } from 'lucide-react';
import type { Todo, TodoStatus } from '../types/todo.types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onChangeStatus: (id: number, status: TodoStatus) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onToggle, onChangeStatus, onDelete }: TodoItemProps) {
    
  const getStatusColor = (status: TodoStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusLabel = (status: TodoStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completada';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  const isCompleted = todo.status === 'COMPLETED';
  const isCancelled = todo.status === 'CANCELLED';

  return (
    <li className="p-4 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 mt-1 transition-all duration-200 ${
            isCompleted ? 'text-green-500 scale-110' : 'text-gray-400 hover:text-green-500'
          }`}
          title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          {isCompleted ? <Check size={22} strokeWidth={2.5} /> : <Circle size={20} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${
            isCompleted || isCancelled
              ? 'text-gray-500 line-through' 
              : 'text-gray-800'
          }`}>
            {todo.title}
          </h3>
          <p className={`text-sm mt-1 ${
            isCompleted || isCancelled
              ? 'text-gray-400' 
              : 'text-gray-600'
          }`}>
            {todo.description}
          </p>
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(todo.status)}`}>
              {getStatusLabel(todo.status)}
            </span>
            
            {/* Botones de cambio de estado */}
            <div className="flex gap-1">
              {todo.status !== 'PENDING' && (
                <button
                  onClick={() => onChangeStatus(todo.id, 'PENDING')}
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Marcar como pendiente"
                >
                  Pendiente
                </button>
              )}
              {todo.status !== 'IN_PROGRESS' && !isCompleted && !isCancelled && (
                <button
                  onClick={() => onChangeStatus(todo.id, 'IN_PROGRESS')}
                  className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                  title="Marcar en progreso"
                >
                  En Progreso
                </button>
              )}
              {!isCompleted && !isCancelled && (
                <button
                  onClick={() => onChangeStatus(todo.id, 'COMPLETED')}
                  className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                  title="Marcar como completada"
                >
                  Completar
                </button>
              )}
              {!isCancelled && !isCompleted && (
                <button
                  onClick={() => onChangeStatus(todo.id, 'CANCELLED')}
                  className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Cancelar tarea"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(todo.id)}
          className="text-red-400 hover:text-red-600 transition-colors duration-200 flex-shrink-0"
          title="Eliminar tarea"
        >
          <X size={20} />
        </button>
      </div>
    </li>
  );
}
