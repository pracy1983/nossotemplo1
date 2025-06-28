import React, { useState } from 'react';
import { Calendar, Users, CheckSquare, BarChart3, Filter } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import CalendarComponent from '../common/Calendar';
import { ATTENDANCE_LABELS } from '../../utils/constants';

const Dashboard: React.FC = () => {
  const { students, events, temples } = useData();
  const [selectedDate, setSelectedDate] = useState('');
  const [filterUnit, setFilterUnit] = useState<string>('all');

  // Calculate statistics
  const activeStudents = students.filter(s => s.isActive && !s.isGuest).length;
  const inactiveStudents = students.filter(s => !s.isActive && !s.isGuest).length;
  const totalGuests = students.filter(s => s.isGuest).length;
  const totalEvents = events.length;

  // Filter events by selected temple
  const filteredEvents = filterUnit === 'all' 
    ? events 
    : events.filter(event => event.unit === filterUnit);

  // Get all attendance records for calendar (filtered by temple if selected)
  const filteredStudents = filterUnit === 'all' 
    ? students 
    : students.filter(student => student.unit === filterUnit);
  
  const allAttendance = filteredStudents.flatMap(student => student.attendance);

  // Create temple options for filter
  const templeOptions = temples.map(temple => ({
    value: temple.abbreviation,
    label: `Templo ${temple.abbreviation} - ${temple.city}`
  }));

  const stats = [
    {
      label: 'Alunos Ativos',
      value: activeStudents,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'Alunos Inativos',
      value: inactiveStudents,
      icon: Users,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      label: 'Convidados',
      value: totalGuests,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      label: 'Eventos',
      value: totalEvents,
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Painel Administrativo
        </h1>
        <p className="text-gray-400">
          Visão geral do sistema Nosso Templo
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl p-6 border border-gray-800`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color} mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">
                  Calendário de Atividades
                </h2>
              </div>
              
              {/* Temple Filter */}
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600"
                >
                  <option value="all">Todos os Templos</option>
                  {templeOptions.map(temple => (
                    <option key={temple.value} value={temple.value}>
                      {temple.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <CalendarComponent
              attendance={allAttendance}
              onDateClick={setSelectedDate}
              selectedDate={selectedDate}
              showLegend={true}
            />

            {/* Filtered Events Summary */}
            {filterUnit !== 'all' && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-300 mb-2">
                  Eventos em {templeOptions.find(t => t.value === filterUnit)?.label}:
                </h3>
                <p className="text-white text-lg font-semibold">
                  {filteredEvents.length} evento(s) no total
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Ações Rápidas
            </h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                <CheckSquare className="w-5 h-5" />
                <span>Marcar Presença</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Novo Evento</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5" />
                <span>Ver Estatísticas</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Atividade Recente
            </h3>
            
            <div className="space-y-3">
              {allAttendance.slice(-5).reverse().map((record, index) => {
                const student = filteredStudents.find(s => 
                  s.attendance.some(a => a.date === record.date && a.type === record.type)
                );
                
                return (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <div className="flex-1 text-sm">
                      <p className="text-white">
                        {student?.fullName || 'Aluno'}
                      </p>
                      <p className="text-gray-400">
                        {ATTENDANCE_LABELS[record.type]} - {new Date(record.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Temples Summary */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Templos Cadastrados
            </h3>
            
            <div className="space-y-3">
              {temples.map(temple => {
                const templeStudents = students.filter(s => s.unit === temple.abbreviation && !s.isGuest);
                const templeEvents = events.filter(e => e.unit === temple.abbreviation);
                
                return (
                  <div key={temple.id} className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">
                          Templo {temple.abbreviation}
                        </h4>
                        <p className="text-sm text-gray-400">{temple.city}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-white">{templeStudents.length} alunos</p>
                        <p className="text-gray-400">{templeEvents.length} eventos</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {temples.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Nenhum templo cadastrado
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;