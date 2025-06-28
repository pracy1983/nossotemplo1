import React, { useState } from 'react';
import { Search, Plus, Upload, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Student } from '../../types';
import { ATTENDANCE_LABELS, ATTENDANCE_COLORS } from '../../utils/constants';
import Modal from '../common/Modal';

const AttendanceMarker: React.FC = () => {
  const { students, markAttendance } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [foundNames, setFoundNames] = useState<any[]>([]);
  const [notFoundNames, setNotFoundNames] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if student already has attendance for today and type
  const hasAttendanceToday = (student: Student, type: string) =>
    student.attendance.some(att => att.date === selectedDate && att.type === type);

  const handleMarkAttendance = (studentId: string, type: string) => {
    markAttendance(studentId, selectedDate, type);
    alert('Presença marcada com sucesso!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate AI processing
      setTimeout(() => {
        // Mock data for demonstration
        setFoundNames([
          { name: 'João da Silva Santos', email: 'joao.silva@email.com', phone: '(11) 99999-9999' },
          { name: 'Maria Santos Oliveira', email: 'maria.santos@email.com', phone: '(31) 88888-8888' }
        ]);
        setNotFoundNames(['Pedro Costa Lima', 'Ana Paula Ferreira']);
        alert('Imagem processada! Verifique os resultados abaixo.');
      }, 2000);
    }
  };

  const StudentSearchResult: React.FC<{ student: Student }> = ({ student }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={student.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'}
            alt={student.fullName}
            className="w-12 h-12 rounded-lg object-cover"
          />
          
          <div>
            <h3 className="font-medium text-white">{student.fullName}</h3>
            <p className="text-sm text-gray-400">
              {student.unit === 'SP' ? 'Templo SP' : 'Templo BH'}
              {student.isGuest && ' • Convidado'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedStudent(student)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <div className="relative group">
            <button className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>Marcar</span>
            </button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {Object.entries(ATTENDANCE_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => handleMarkAttendance(student.id, type)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  disabled={hasAttendanceToday(student, type)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ATTENDANCE_COLORS[type as keyof typeof ATTENDANCE_COLORS] }}
                  />
                  <span className={hasAttendanceToday(student, type) ? 'text-gray-500' : 'text-white'}>
                    {label}
                  </span>
                  {hasAttendanceToday(student, type) && (
                    <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Marcar Presença</h1>
          <p className="text-gray-400">Registre a presença dos alunos nas atividades</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
          
          <button
            onClick={() => setShowImageUpload(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Importar com Imagem</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Tipos de Presença</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(ATTENDANCE_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: ATTENDANCE_COLORS[type as keyof typeof ATTENDANCE_COLORS] }}
              />
              <span className="text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Resultados da Busca ({filteredStudents.length})
          </h2>
          
          {filteredStudents.length > 0 ? (
            <div className="space-y-3">
              {filteredStudents.map(student => (
                <StudentSearchResult key={student.id} student={student} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-900 rounded-xl border border-gray-800">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar o termo de busca
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Processing Results */}
      {(foundNames.length > 0 || notFoundNames.length > 0) && (
        <div className="space-y-6">
          {/* Found Names */}
          {foundNames.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">
                Nomes Encontrados ({foundNames.length})
              </h2>
              
              <div className="space-y-3">
                {foundNames.map((person, index) => {
                  const student = students.find(s => 
                    s.fullName.toLowerCase().includes(person.name.toLowerCase()) ||
                    s.email === person.email ||
                    s.phone === person.phone
                  );
                  
                  return (
                    <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                      <div>
                        <h3 className="font-medium text-white">{person.name}</h3>
                        <p className="text-sm text-gray-400">
                          {person.email} • {person.phone}
                        </p>
                      </div>
                      
                      {student ? (
                        <button
                          onClick={() => handleMarkAttendance(student.id, 'development')}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>OK</span>
                        </button>
                      ) : (
                        <div className="text-red-400 text-sm">
                          Não encontrado no sistema
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Not Found Names */}
          {notFoundNames.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">
                Nomes Não Encontrados ({notFoundNames.length})
              </h2>
              
              <div className="space-y-3">
                {notFoundNames.map((name, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                    <div>
                      <h3 className="font-medium text-white">{name}</h3>
                      <p className="text-sm text-gray-400">
                        Nome não encontrado no sistema
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors">
                        <Search className="w-4 h-4" />
                        <span>Buscar</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Convidado</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors">
                  Adicionar Todos como Convidados
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Upload Modal */}
      <Modal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        title="Importar Lista de Presença"
      >
        <div className="space-y-4">
          <div className="text-center">
            <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Envie uma foto da lista de presença
            </h3>
            <p className="text-gray-400 mb-6">
              Nossa IA irá processar a imagem e extrair os nomes automaticamente
            </p>
          </div>
          
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full"
            />
          </div>
          
          <div className="text-sm text-gray-400">
            <p>• Formatos aceitos: JPG, PNG, PDF</p>
            <p>• Tamanho máximo: 10MB</p>
            <p>• Certifique-se de que o texto esteja legível</p>
          </div>
        </div>
      </Modal>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="Detalhes do Aluno"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={selectedStudent.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'}
                alt={selectedStudent.fullName}
                className="w-16 h-20 rounded-lg object-cover"
              />
              
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedStudent.fullName}</h3>
                <p className="text-gray-400">{selectedStudent.email}</p>
                <p className="text-gray-400">{selectedStudent.phone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Unidade:</span>
                <p className="text-white">{selectedStudent.unit === 'SP' ? 'Templo SP' : 'Templo BH'}</p>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <p className={selectedStudent.isActive ? 'text-green-400' : 'text-red-400'}>
                  {selectedStudent.isActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>
            
            <div>
              <span className="text-gray-400">Presenças hoje:</span>
              <div className="mt-2 space-y-2">
                {Object.entries(ATTENDANCE_LABELS).map(([type, label]) => {
                  const hasAttendance = hasAttendanceToday(selectedStudent, type);
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ATTENDANCE_COLORS[type as keyof typeof ATTENDANCE_COLORS] }}
                        />
                        <span className="text-white">{label}</span>
                      </div>
                      {hasAttendance ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AttendanceMarker;