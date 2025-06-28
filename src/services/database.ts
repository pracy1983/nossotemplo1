import { supabase, DatabaseStudent, DatabaseEvent, DatabaseAttendanceRecord } from '../lib/supabase';
import { Student, Event, AttendanceRecord, User, Temple } from '../types';

// Helper functions to convert between database and app types
const dbStudentToStudent = (dbStudent: DatabaseStudent): Student => ({
  id: dbStudent.id,
  photo: dbStudent.photo,
  fullName: dbStudent.full_name,
  birthDate: dbStudent.birth_date,
  cpf: dbStudent.cpf || '',
  rg: dbStudent.rg || '',
  email: dbStudent.email,
  phone: dbStudent.phone || '',
  religion: dbStudent.religion || '',
  unit: dbStudent.unit,
  developmentStartDate: dbStudent.development_start_date,
  internshipStartDate: dbStudent.internship_start_date,
  magistInitiationDate: dbStudent.magist_initiation_date,
  notEntryDate: dbStudent.not_entry_date,
  masterMagusInitiationDate: dbStudent.master_magus_initiation_date,
  isFounder: dbStudent.is_founder,
  isActive: dbStudent.is_active,
  inactiveSince: dbStudent.inactive_since,
  lastActivity: dbStudent.last_activity,
  isAdmin: dbStudent.is_admin,
  isGuest: dbStudent.is_guest,
  role: dbStudent.is_admin ? 'admin' : 'student', // Default role mapping
  attendance: []
});

const studentToDbStudent = (student: Partial<Student>): Partial<DatabaseStudent> => {
  const dbData: Partial<DatabaseStudent> = {};
  if (student.photo !== undefined) dbData.photo = student.photo;
  if (student.fullName !== undefined) dbData.full_name = student.fullName;
  if (student.birthDate !== undefined) dbData.birth_date = student.birthDate;
  if (student.cpf !== undefined) dbData.cpf = student.cpf || null;
  if (student.rg !== undefined) dbData.rg = student.rg || null;
  if (student.email !== undefined) dbData.email = student.email;
  if (student.phone !== undefined) dbData.phone = student.phone || null;
  if (student.religion !== undefined) dbData.religion = student.religion || null;
  if (student.unit !== undefined) dbData.unit = student.unit;
  if (student.developmentStartDate !== undefined) dbData.development_start_date = student.developmentStartDate || null;
  if (student.internshipStartDate !== undefined) dbData.internship_start_date = student.internshipStartDate || null;
  if (student.magistInitiationDate !== undefined) dbData.magist_initiation_date = student.magistInitiationDate || null;
  if (student.notEntryDate !== undefined) dbData.not_entry_date = student.notEntryDate || null;
  if (student.masterMagusInitiationDate !== undefined) dbData.master_magus_initiation_date = student.masterMagusInitiationDate || null;
  if (student.isFounder !== undefined) dbData.is_founder = student.isFounder;
  if (student.isActive !== undefined) dbData.is_active = student.isActive;
  if (student.inactiveSince !== undefined) dbData.inactive_since = student.inactiveSince || null;
  if (student.lastActivity !== undefined) dbData.last_activity = student.lastActivity || null;
  if (student.isAdmin !== undefined) dbData.is_admin = student.isAdmin;
  if (student.isGuest !== undefined) dbData.is_guest = student.isGuest;
  return dbData;
};

const dbEventToEvent = (dbEvent: DatabaseEvent): Event => ({
  id: dbEvent.id,
  title: dbEvent.title,
  date: dbEvent.date,
  time: dbEvent.time,
  description: dbEvent.description || '',
  location: dbEvent.location,
  unit: dbEvent.unit,
  attendees: []
});

const eventToDbEvent = (event: Partial<Event>): Partial<DatabaseEvent> => {
  const dbData: Partial<DatabaseEvent> = {};
  if (event.title !== undefined) dbData.title = event.title;
  if (event.date !== undefined) dbData.date = event.date;
  if (event.time !== undefined) dbData.time = event.time;
  if (event.description !== undefined) dbData.description = event.description || null;
  if (event.location !== undefined) dbData.location = event.location;
  if (event.unit !== undefined) dbData.unit = event.unit;
  return dbData;
};

const dbAttendanceToAttendance = (dbAttendance: DatabaseAttendanceRecord): AttendanceRecord => ({
  id: dbAttendance.id,
  studentId: dbAttendance.student_id || '',
  date: dbAttendance.date,
  type: dbAttendance.type as 'development' | 'work' | 'monthly' | 'event',
  eventId: dbAttendance.event_id || undefined
});

// Authentication
export const authenticateUser = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase auth error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('invalid_credentials')) {
        throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Muitas tentativas de login. Aguarde alguns minutos.');
      } else {
        throw new Error(`Erro de autenticação: ${error.message}`);
      }
    }

    if (!data.user) {
      throw new Error('Usuário não encontrado');
    }

    // Get student data for the authenticated user
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    if (studentError) {
      console.error('Error fetching student data:', studentError);
      
      if (studentError.code === 'PGRST116') {
        throw new Error('Usuário não encontrado no sistema. Entre em contato com o administrador.');
      } else {
        throw new Error(`Erro ao buscar dados do usuário: ${studentError.message}`);
      }
    }

    const student = dbStudentToStudent(studentData);

    return {
      id: data.user.id,
      email: data.user.email || '',
      isAdmin: student.isAdmin,
      student
    };
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    throw error;
  }
};

// Student operations
export const createStudent = async (student: Student): Promise<Student> => {
  try {
    // Check active session before inserting to avoid RLS error
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error checking user session:', userError);
      throw new Error('Erro ao verificar sessão do usuário. Faça login novamente.');
    }
    
    if (!userData?.user?.id) {
      throw new Error('Usuário não autenticado no momento do cadastro. Faça login novamente.');
    }

    console.log('Usuário autenticado (createStudent):', userData.user.id);

    const dbStudent = studentToDbStudent(student);
    const { data, error } = await supabase
      .from('students')
      .insert(dbStudent)
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      
      // Handle specific database errors
      if (error.code === '23505') {
        if (error.message.includes('students_email_key')) {
          throw new Error('Já existe um aluno com este email.');
        } else {
          throw new Error('Violação de restrição única no banco de dados.');
        }
      } else if (error.code === '42501') {
        throw new Error('Permissão negada. Verifique se você tem privilégios de administrador.');
      } else if (error.code === 'PGRST301') {
        throw new Error('Erro de permissão. Faça login novamente.');
      } else {
        throw new Error(`Erro ao criar aluno: ${error.message}`);
      }
    }

    return dbStudentToStudent(data);
  } catch (error) {
    console.error('Error in createStudent:', error);
    throw error;
  }
};

export const getStudents = async (): Promise<Student[]> => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('full_name');

    if (error) {
      console.error('Error fetching students:', error);
      throw new Error(`Erro ao buscar alunos: ${error.message}`);
    }

    return data.map(dbStudentToStudent);
  } catch (error) {
    console.error('Error in getStudents:', error);
    throw error;
  }
};

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<Student> => {
  try {
    const dbUpdates = studentToDbStudent(updates);
    const { data, error } = await supabase
      .from('students')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error);
      
      // Handle specific database errors
      if (error.code === '23505') {
        if (error.message.includes('students_email_key')) {
          throw new Error('Já existe um aluno com este email.');
        } else {
          throw new Error('Violação de restrição única no banco de dados.');
        }
      } else {
        throw new Error(`Erro ao atualizar aluno: ${error.message}`);
      }
    }

    return dbStudentToStudent(data);
  } catch (error) {
    console.error('Error in updateStudent:', error);
    throw error;
  }
};

export const deleteStudent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      throw new Error(`Erro ao deletar aluno: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteStudent:', error);
    throw error;
  }
};

// Event operations
export const getEvents = async (): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_attendees (
          student_id,
          students (
            id,
            full_name,
            email
          )
        )
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      throw new Error(`Erro ao buscar eventos: ${error.message}`);
    }

    return data.map(dbEvent => {
      const event = dbEventToEvent(dbEvent);
      event.attendees = dbEvent.event_attendees?.map((attendee: any) => attendee.students.id) || [];
      return event;
    });
  } catch (error) {
    console.error('Error in getEvents:', error);
    throw error;
  }
};

export const createEvent = async (event: Event): Promise<Event> => {
  try {
    const dbEvent = eventToDbEvent(event);
    const { data, error } = await supabase
      .from('events')
      .insert(dbEvent)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      throw new Error(`Erro ao criar evento: ${error.message}`);
    }

    return dbEventToEvent(data);
  } catch (error) {
    console.error('Error in createEvent:', error);
    throw error;
  }
};

export const updateEvent = async (id: string, updates: Partial<Event>): Promise<Event> => {
  try {
    const dbUpdates = eventToDbEvent(updates);
    const { data, error } = await supabase
      .from('events')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw new Error(`Erro ao atualizar evento: ${error.message}`);
    }

    return dbEventToEvent(data);
  } catch (error) {
    console.error('Error in updateEvent:', error);
    throw error;
  }
};

export const deleteEvent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw new Error(`Erro ao deletar evento: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    throw error;
  }
};

// Temple operations
export const getTemples = async (): Promise<Temple[]> => {
  try {
    const { data, error } = await supabase
      .from('temples')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching temples:', error);
      throw new Error(`Erro ao buscar templos: ${error.message}`);
    }

    return data.map(temple => ({
      id: temple.id,
      photo: temple.photo,
      name: temple.name,
      city: temple.city,
      abbreviation: temple.abbreviation,
      address: temple.address,
      founders: temple.founders || [],
      isActive: temple.is_active,
      createdAt: temple.created_at,
      updatedAt: temple.updated_at
    }));
  } catch (error) {
    console.error('Error in getTemples:', error);
    throw error;
  }
};

export const createTemple = async (temple: Temple): Promise<Temple> => {
  try {
    const { data, error } = await supabase
      .from('temples')
      .insert({
        id: temple.id,
        photo: temple.photo,
        name: temple.name,
        city: temple.city,
        abbreviation: temple.abbreviation,
        address: temple.address,
        founders: temple.founders,
        is_active: temple.isActive,
        created_at: temple.createdAt,
        updated_at: temple.updatedAt
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating temple:', error);
      throw new Error(`Erro ao criar templo: ${error.message}`);
    }

    return {
      id: data.id,
      photo: data.photo,
      name: data.name,
      city: data.city,
      abbreviation: data.abbreviation,
      address: data.address,
      founders: data.founders || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in createTemple:', error);
    throw error;
  }
};

export const updateTemple = async (id: string, updates: Partial<Temple>): Promise<Temple> => {
  try {
    const dbUpdates: any = {};
    if (updates.photo !== undefined) dbUpdates.photo = updates.photo;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.abbreviation !== undefined) dbUpdates.abbreviation = updates.abbreviation;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.founders !== undefined) dbUpdates.founders = updates.founders;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;

    const { data, error } = await supabase
      .from('temples')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating temple:', error);
      throw new Error(`Erro ao atualizar templo: ${error.message}`);
    }

    return {
      id: data.id,
      photo: data.photo,
      name: data.name,
      city: data.city,
      abbreviation: data.abbreviation,
      address: data.address,
      founders: data.founders || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in updateTemple:', error);
    throw error;
  }
};

export const deleteTemple = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('temples')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting temple:', error);
      throw new Error(`Erro ao deletar templo: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteTemple:', error);
    throw error;
  }
};

// Attendance operations
export const markAttendance = async (studentId: string, date: string, type: 'development' | 'work' | 'monthly' | 'event', eventId?: string): Promise<AttendanceRecord> => {
  try {
    const attendanceData = {
      student_id: studentId,
      date,
      type,
      event_id: eventId || null
    };

    const { data, error } = await supabase
      .from('attendance_records')
      .insert(attendanceData)
      .select()
      .single();

    if (error) {
      console.error('Error marking attendance:', error);
      throw new Error(`Erro ao marcar presença: ${error.message}`);
    }

    // If it's an event attendance, also add to event_attendees
    if (type === 'event' && eventId) {
      const { error: attendeeError } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          student_id: studentId
        });

      if (attendeeError && !attendeeError.message.includes('duplicate')) {
        console.error('Error adding event attendee:', attendeeError);
      }
    }

    return dbAttendanceToAttendance(data);
  } catch (error) {
    console.error('Error in markAttendance:', error);
    throw error;
  }
};

export const removeAttendance = async (attendanceId: string): Promise<void> => {
  try {
    // Get attendance record first to check if it's an event attendance
    const { data: attendanceData, error: fetchError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('id', attendanceId)
      .single();

    if (fetchError) {
      console.error('Error fetching attendance record:', fetchError);
      throw new Error(`Erro ao buscar registro de presença: ${fetchError.message}`);
    }

    // Remove from attendance_records
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('id', attendanceId);

    if (error) {
      console.error('Error removing attendance:', error);
      throw new Error(`Erro ao remover presença: ${error.message}`);
    }

    // If it was an event attendance, also remove from event_attendees
    if (attendanceData.type === 'event' && attendanceData.event_id && attendanceData.student_id) {
      const { error: attendeeError } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', attendanceData.event_id)
        .eq('student_id', attendanceData.student_id);

      if (attendeeError) {
        console.error('Error removing event attendee:', attendeeError);
      }
    }
  } catch (error) {
    console.error('Error in removeAttendance:', error);
    throw error;
  }
};

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching attendance records:', error);
      throw new Error(`Erro ao buscar registros de presença: ${error.message}`);
    }

    return data.map(dbAttendanceToAttendance);
  } catch (error) {
    console.error('Error in getAttendanceRecords:', error);
    throw error;
  }
};