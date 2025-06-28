export interface Student {
  id: string;
  photo?: string;
  fullName: string;
  birthDate: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  religion: string;
  unit: string; // Changed to string to support dynamic temples
  developmentStartDate?: string;
  internshipStartDate?: string;
  magistInitiationDate?: string;
  notEntryDate?: string;
  masterMagusInitiationDate?: string;
  isFounder: boolean;
  isActive: boolean;
  inactiveSince?: string;
  lastActivity?: string;
  attendance: AttendanceRecord[];
  isAdmin: boolean;
  isGuest: boolean;
  role: 'admin' | 'collaborator' | 'student';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  unit: string; // Changed to string to support dynamic temples
  photo?: string; // New field for event photo
  attendees: string[];
}

export interface Temple {
  id?: string; // Made optional to allow Supabase to generate UUID
  photo?: string;
  logo?: string; // New field for temple logo
  name: string;
  city: string;
  abbreviation: string; // e.g., "SP", "BH", "CP"
  address: string;
  // New address fields for better organization
  street?: string;
  number?: string;
  complement?: string; // New field for address complement
  neighborhood?: string;
  zipCode?: string;
  state?: string;
  observations?: string; // New field for observations
  founders: string[]; // Array of student IDs who are founders
  isActive: boolean;
  createdAt?: string; // Made optional
  updatedAt?: string; // Made optional
}

export interface AttendanceRecord {
  id?: string;
  studentId?: string;
  date: string;
  type: 'development' | 'work' | 'monthly' | 'event';
  eventId?: string;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  student?: Student;
}

export type ViewMode = 'list' | 'card';
export type FilterStatus = 'all' | 'active' | 'inactive';
export type FilterUnit = 'all' | string; // Changed to support dynamic temples
export type FilterRole = 'all' | 'admin' | 'collaborator' | 'student';
export type UserRole = 'admin' | 'collaborator' | 'student';