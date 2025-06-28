import React, { useState } from 'react';
import { Edit3, Save, X, Calendar, User, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Student } from '../../types';
import { DEFAULT_TEMPLES } from '../../utils/constants';
import { formatDate, validateEmail, formatPhone } from '../../utils/helpers';
import CalendarComponent from '../common/Calendar';

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const { students, updateStudent } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});

  // Find the current student
  const student = students.find(s => s.id === user?.studentId);

  React.useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  if (!student) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
          <p className="text-gray-400">Não foi possível carregar suas informações.</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!formData.fullName || !formData.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    if (!validateEmail(formData.email)) {
      alert('Email inválido');
      return;
    }

    updateStudent(student.id, formData);
    setIsEditing(false);
    alert('Perfil atualizado com sucesso!');
  };

  const handleCancel = () => {
    setFormData(student);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
          <p className="text-gray-400">Visualize e edite suas informações pessoais</p>
        </div>

        {/* Status Banner */}
        <div className={`rounded-xl p-4 border ${
          student.isActive 
            ? 'bg-green-600/10 border-green-600/20' 
            : 'bg-red-600/10 border-red-600/20'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              student.isActive ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className={`font-semibold ${
              student.isActive ? 'text-green-400' : 'text-red-400'
            }`}>
              {student.isActive 
                ? 'Ativo' 
                : `Inativo desde ${student.inactiveSince || 'N/A'}`
              }
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo and Basic Info */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Informações Pessoais</h2>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Photo */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <img
                      src={student.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'}
                      alt={student.fullName}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {student.isFounder && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        Fundador
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.fullName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                      />
                    ) : (
                      <p className="text-white">{student.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                      ) : (
                        <p className="text-white">{student.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Telefone
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                      ) : (
                        <p className="text-white">{student.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Data de Nascimento
                      </label>
                      <p className="text-white">{formatDate(student.birthDate)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Unidade
                      </label>
                      <p className="text-white">{DEFAULT_TEMPLES[student.unit as keyof typeof DEFAULT_TEMPLES]}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Religião
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.religion || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, religion: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                      />
                    ) : (
                      <p className="text-white">{student.religion}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Spiritual Development Dates */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">Desenvolvimento Espiritual</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Início de Desenvolvimento
                  </label>
                  <p className="text-white">
                    {student.developmentStartDate ? formatDate(student.developmentStartDate) : 'Não informado'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Início do Estágio
                  </label>
                  <p className="text-white">
                    {student.internshipStartDate ? formatDate(student.internshipStartDate) : 'Não informado'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Iniciação como Magista
                  </label>
                  <p className="text-white">
                    {student.magistInitiationDate ? formatDate(student.magistInitiationDate) : 'Não informado'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entrada na N.O.T.
                  </label>
                  <p className="text-white">
                    {student.notEntryDate ? formatDate(student.notEntryDate) : 'Não informado'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Iniciação como Mestre Mago
                  </label>
                  <p className="text-white">
                    {student.masterMagusInitiationDate ? formatDate(student.masterMagusInitiationDate) : 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar and Quick Info */}
          <div className="space-y-6">
            {/* Quick Info Cards */}
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">CPF</p>
                    <p className="text-white">{student.cpf || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">RG</p>
                    <p className="text-white">{student.rg || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm text-gray-400">Unidade</p>
                    <p className="text-white">{DEFAULT_TEMPLES[student.unit as keyof typeof DEFAULT_TEMPLES]}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Calendar */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Minha Frequência</h3>
              </div>
              
              <CalendarComponent
                attendance={student.attendance}
                showLegend={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;