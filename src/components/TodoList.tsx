import type { Todo, TodoStatus } from '../types/todo.types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  searchTerm: string;
  onToggle: (id: number) => void;
  onChangeStatus: (id: number, status: TodoStatus) => void;
  onDelete: (id: number) => void;
  emptyMessage?: string;
}

export default function TodoList({ 
  todos, 
  searchTerm, 
  onToggle, 
  onChangeStatus, 
  onDelete,
  emptyMessage = 'No hay tareas aún. ¡Crea tu primera tarea!'
}: TodoListProps) {
  console.log('Rendering TodoList with todos:', todos, 'and searchTerm:', searchTerm);
  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        {searchTerm ? (
          <>
            <p>No se encontraron tareas con "{searchTerm}"</p>
          </>
        ) : (
          <p>{emptyMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {
          
        todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onChangeStatus={onChangeStatus}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
