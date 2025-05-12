import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Task {
  id: string;
  icon: string;
  title: string;
  description: string;
  frequency: string;
  assignedBy: string;
  dueIn?: string;
  risk?: number;
  status: 'completed' | 'pending';
  secrets?: string;
  hour?: string;
  minute?: string;
  amPm?: 'AM' | 'PM';
  proofRequired?: string[];
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const mockTasks: Task[] = [
  {
    id: '1',
    icon: '🚶‍♂️',
    title: 'Daily Walk',
    description: 'Walk at least 8,000 steps today',
    frequency: 'Daily',
    assignedBy: 'Dr. Johnson',
    dueIn: '5 hours',
    risk: 1,
    status: 'pending',
  },
  {
    id: '2',
    icon: '🥗',
    title: 'Healthy Meal',
    description: 'Post a photo of your healthy dinner',
    frequency: 'Daily',
    assignedBy: 'Self-assigned',
    dueIn: 'Completed today',
    risk: 0,
    status: 'completed',
    secrets: 'safe',
  },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const addTask = useCallback((task: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'pending',
    };
    setTasks(currentTasks => [...currentTasks, newTask]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
  }, []);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'pending' : 'completed',
              dueIn: task.status === 'pending' ? 'Completed today' : task.dueIn,
            }
          : task
      )
    );
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext; 