import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '@/integrations/firebase/client';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

export interface TaskProgress {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Timestamp;
  date: string; // YYYY-MM-DD format
}

export interface DailyTasks {
  date: string;
  tasks: TaskProgress[];
  userId: string;
  lastUpdated: Timestamp;
}

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Load today's tasks
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setError(null);
      return;
    }

    loadTodaysTasks();
  }, [user]);

  const loadTodaysTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const taskRef = doc(db, 'task_progress', user.uid, 'daily', today);
      const taskSnap = await getDoc(taskRef);

      if (taskSnap.exists()) {
        const data = taskSnap.data() as DailyTasks;
        setTasks(data.tasks);
      } else {
        // Initialize with empty tasks for today
        setTasks([]);
      }
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      // Don't set error for permission issues - just log and continue with empty tasks
      if (err.code !== 'permission-denied') {
        setError('Failed to load tasks');
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTodaysTasks = async (updatedTasks: TaskProgress[]) => {
    if (!user) return;

    try {
      const taskRef = doc(db, 'task_progress', user.uid, 'daily', today);
      const dailyTasks: DailyTasks = {
        date: today,
        tasks: updatedTasks,
        userId: user.uid,
        lastUpdated: Timestamp.now()
      };

      await setDoc(taskRef, dailyTasks);
      setTasks(updatedTasks);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('Error saving tasks:', err);
      // Don't set error for permission issues - just log
      if (err.code !== 'permission-denied') {
        setError('Failed to save tasks');
      }
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? Timestamp.now() : undefined
        };
      }
      return task;
    });

    await saveTodaysTasks(updatedTasks);
  };

  const updateTasksFromWellnessPlan = async (wellnessTasks: string[]) => {
    if (!user || wellnessTasks.length === 0) return;

    const wellnessTaskProgress: TaskProgress[] = wellnessTasks.map((task, index) => ({
      id: `wellness_${index}`,
      title: task,
      completed: false,
      date: today
    }));

    await saveTodaysTasks(wellnessTaskProgress);
  };

  const getCompletedCount = () => {
    return tasks.filter(task => task.completed).length;
  };

  const getTotalCount = () => {
    return tasks.length;
  };

  const getCompletionPercentage = () => {
    const total = getTotalCount();
    if (total === 0) return 0;
    return Math.round((getCompletedCount() / total) * 100);
  };

  return {
    tasks,
    loading,
    error,
    toggleTaskCompletion,
    updateTasksFromWellnessPlan,
    getCompletedCount,
    getTotalCount,
    getCompletionPercentage,
    refreshTasks: loadTodaysTasks
  };
};