import { Student, Event, User } from '../types';
import { generateId } from '../utils/helpers';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'paularacy@gmail.com',
    isAdmin: true
  },
  {
    id: '2',
    email: 'joao.silva@email.com',
    isAdmin: false,
    studentId: '1'
  },
  {
    id: '3',
    email: 'maria.santos@email.com',
    isAdmin: false,
    studentId: '2'
  }
];

export const mockStudents: Student[] = [
  {
    id: '1',
    photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    fullName: 'João da Silva Santos',
    birthDate: '1985-03-15',
    cpf: '123.456.789-01',
    rg: '12.345.678-9',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    religion: 'Espiritualista',
    unit: 'SP',
    developmentStartDate: '2020-01-15',
    internshipStartDate: '2021-06-01',
    magistInitiationDate: '2022-12-15',
    notEntryDate: '2023-03-01',
    isFounder: true,
    isActive: true,
    lastActivity: '2024-01-10',
    attendance: [
      { date: '2024-01-10', type: 'development' },
      { date: '2024-01-15', type: 'monthly' },
      { date: '2024-01-20', type: 'work' }
    ],
    isAdmin: false,
    isGuest: false
  },
  {
    id: '2',
    photo: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    fullName: 'Maria Santos Oliveira',
    birthDate: '1990-07-22',
    cpf: '987.654.321-01',
    rg: '98.765.432-1',
    email: 'maria.santos@email.com',
    phone: '(31) 88888-8888',
    religion: 'Católica',
    unit: 'BH',
    developmentStartDate: '2021-05-10',
    internshipStartDate: '2022-08-01',
    isFounder: false,
    isActive: true,
    lastActivity: '2024-01-12',
    attendance: [
      { date: '2024-01-12', type: 'development' },
      { date: '2024-01-18', type: 'event' }
    ],
    isAdmin: false,
    isGuest: false
  },
  {
    id: '3',
    photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    fullName: 'Pedro Costa Lima',
    birthDate: '1988-11-05',
    cpf: '456.789.123-01',
    rg: '45.678.912-3',
    email: 'pedro.costa@email.com',
    phone: '(11) 77777-7777',
    religion: 'Umbandista',
    unit: 'SP',
    developmentStartDate: '2019-03-20',
    isFounder: false,
    isActive: false,
    inactiveSince: '2023-10-15',
    lastActivity: '2023-07-10',
    attendance: [
      { date: '2023-07-10', type: 'monthly' },
      { date: '2023-06-15', type: 'development' }
    ],
    isAdmin: false,
    isGuest: false
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Desenvolvimento Espiritual',
    date: '2024-01-15',
    time: '19:00',
    description: 'Sessão de desenvolvimento mediúnico',
    location: 'Sala Principal',
    unit: 'SP',
    attendees: ['1', '2']
  },
  {
    id: '2',
    title: 'Trabalho de Caridade',
    date: '2024-01-20',
    time: '14:00',
    description: 'Distribuição de alimentos',
    location: 'Área Externa',
    unit: 'BH',
    attendees: ['2']
  },
  {
    id: '3',
    title: 'Palestra Doutrinária',
    date: '2024-01-25',
    time: '20:00',
    description: 'Estudo da doutrina espírita',
    location: 'Auditório',
    unit: 'SP',
    attendees: ['1']
  }
];