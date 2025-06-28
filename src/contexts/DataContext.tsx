import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Event, Temple } from '../types';
import * as db from '../services/database';

interface DataContextType {
  students: Student[];
  events: Event[];
  temples: Temple[];
  loading: boolean;
  error: string | null;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addEvent: (event: Event) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addTemple: (temple: Temple) => Promise<void>;
  updateTemple: (id: string, updates: Partial<Temple>) => Promise<void>;
  deleteTemple: (id: string) => Promise<void>;
  markAttendance: (studentId: string, date: string, type: string) => Promise<void>;
  removeAttendance: (studentId: string, date: string, type: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsData, eventsData, templesData] = await Promise.all([
        db.getStudents(),
        db.getEvents(),
        db.getTemples()
      ]);
      
      setStudents(studentsData);
      setEvents(eventsData);
      setTemples(templesData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || 'Erro ao carregar dados');
      
      // Set empty arrays to prevent app crash
      setStudents([]);
      setEvents([]);
      setTemples([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addStudent = async (student: Student) => {
    try {
      const newStudent = await db.createStudent(student);
      setStudents(prev => [...prev, newStudent]);
    } catch (error: any) {
      console.error('Error adding student:', error);
      throw new Error(error.message || 'Erro ao adicionar aluno');
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      await db.updateStudent(id, updates);
      setStudents(prev => prev.map(student => 
        student.id === id ? { ...student, ...updates } : student
      ));
    } catch (error: any) {
      console.error('Error updating student:', error);
      throw new Error(error.message || 'Erro ao atualizar aluno');
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await db.deleteStudent(id);
      setStudents(prev => prev.filter(student => student.id !== id));
    } catch (error: any) {
      console.error('Error deleting student:', error);
      throw new Error(error.message || 'Erro ao excluir aluno');
    }
  };

  const addEvent = async (event: Event) => {
    try {
      const newEvent = await db.createEvent(event);
      setEvents(prev => [...prev, newEvent]);
    } catch (error: any) {
      console.error('Error adding event:', error);
      throw new Error(error.message || 'Erro ao adicionar evento');
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      await db.updateEvent(id, updates);
      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...updates } : event
      ));
    } catch (error: any) {
      console.error('Error updating event:', error);
      throw new Error(error.message || 'Erro ao atualizar evento');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await db.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error: any) {
      console.error('Error deleting event:', error);
      throw new Error(error.message || 'Erro ao excluir evento');
    }
  };

  const addTemple = async (temple: Temple) => {
    try {
      const newTemple = await db.createTemple(temple);
      setTemples(prev => [...prev, newTemple]);
    } catch (error: any) {
      console.error('Error adding temple:', error);
      throw new Error(error.message || 'Erro ao adicionar templo');
    }
  };

  const updateTemple = async (id: string, updates: Partial<Temple>) => {
    try {
      await db.updateTemple(id, updates);
      setTemples(prev => prev.map(temple => 
        temple.id === id ? { ...temple, ...updates } : temple
      ));
    } catch (error: any) {
      console.error('Error updating temple:', error);
      throw new Error(error.message || 'Erro ao atualizar templo');
    }
  };

  const deleteTemple = async (id: string) => {
    try {
      await db.deleteTemple(id);
      setTemples(prev => prev.filter(temple => temple.id !== id));
    } catch (error: any) {
      console.error('Error deleting temple:', error);
      throw new Error(error.message || 'Erro ao excluir templo');
    }
  };

  const markAttendance = async (studentId: string, date: string, type: string) => {
    try {
      await db.markAttendance(studentId, date, type);
      // Refresh data to get updated attendance
      await refreshData();
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      throw new Error(error.message || 'Erro ao marcar presença');
    }
  };

  const removeAttendance = async (studentId: string, date: string, type: string) => {
    try {
      await db.removeAttendance(studentId, date, type);
      // Refresh data to get updated attendance
      await refreshData();
    } catch (error: any) {
      console.error('Error removing attendance:', error);
      throw new Error(error.message || 'Erro ao remover presença');
    }
  };

  return (
    <DataContext.Provider value={{
      students,
      events,
      temples,
      loading,
      error,
      addStudent,
      updateStudent,
      deleteStudent,
      addEvent,
      updateEvent,
      deleteEvent,
      addTemple,
      updateTemple,
      deleteTemple,
      markAttendance,
      removeAttendance,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};