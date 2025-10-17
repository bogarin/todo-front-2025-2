export type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Todo {
  id: number;
  title: string;
  description: string;
  status: TodoStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTodoDto {
  title: string;
  description: string;
}

export interface UpdateTodoDto {
  title: string;
  description: string;
  status: TodoStatus;
}

export type FilterType = 'all' | 'active' | 'completed' | 'cancelled';
