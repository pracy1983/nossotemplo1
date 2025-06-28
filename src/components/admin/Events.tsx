import React, { useState } from 'react';
import { Calendar, Plus, Search, List, Upload, Edit, Trash2, Eye } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Event } from '../../types';
import { generateId } from '../../utils/helpers';
import { DEFAULT_TEMPLES } from '../../utils/constants';
import Modal from '../common/Modal';

const Events: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useData();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState<'all' | 'SP' | 'BH'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form state for new/edit event
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    unit: 'SP' as 'SP' | 'BH'
  });

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = filterUnit === 'all' || event.unit === filterUnit;
    return matchesSearch && matchesUnit;
  });

  // Get events for current month
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
  });

  const handleAddEvent = () => {
    const newEvent: Event = {
      id: generateId(),
      ...eventForm,
      attendees: []
    };
    
    addEvent(newEvent);
    setEventForm({
      title: '',
      date: '',
      time: '',
      description: '',
      location: '',
      unit: 'SP'
    });
    setShowAddModal(false);
    alert('Evento adicionado com sucesso!');
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      deleteEvent(eventId);
      alert('Evento excluído com sucesso!');
    }
  };

  const CalendarView = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getEventsForDay = (day: number) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return monthEvents.filter(event => event.date === dateStr);
    };

    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1))}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            ←
          </button>
          
          <h2 className="text-xl font-bold text-white">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          
          <button
            onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1))}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            →
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayWeekday }).map((_, index) => (
            <div key={`empty-${index}`} className="h-24" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayEvents = getEventsForDay(day);
            const today = new Date();
            const isToday = today.getDate() === day &&
                           today.getMonth() === currentMonth &&
                           today.getFullYear() === currentYear;

            return (
              <div
                key={day}
                className={`h-24 p-2 border rounded-lg ${
                  isToday ? 'border-red-400 bg-red-400/10' : 'border-gray-700'
                }`}
              >
                <div className={`text-sm ${isToday ? 'font-bold text-red-400' : 'text-white'}`}>
                  {day}
                </div>
                
                {/* Event indicators */}
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full h-4 bg-purple-600 rounded text-xs text-white px-1 cursor-pointer hover:bg-purple-700 truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{dayEvents.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ListView = () => (
    <div className="space-y-4">
      {monthEvents.map(event => (
        <div key={event.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-white">{event.title}</h3>
              <div className="text-sm text-gray-400 mt-1">
                <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                <span className="mx-2">•</span>
                <span>{event.time}</span>
                <span className="mx-2">•</span>
                <span>{DEFAULT_TEMPLES[event.unit as keyof typeof DEFAULT_TEMPLES]}</span>
              </div>
              <p className="text-gray-300 mt-2">{event.description}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedEvent(event)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {monthEvents.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Nenhum evento encontrado
          </h3>
          <p className="text-gray-500">
            Não há eventos para este mês com os filtros atuais
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Eventos</h1>
          <p className="text-gray-400">Gerencie o calendário de eventos</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Evento</span>
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Importar do Google</span>
          </button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value as any)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
            >
              <option value="all">Todas as Unidades</option>
              <option value="SP">Templo SP</option>
              <option value="BH">Templo BH</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setView('calendar')}
                className={`p-2 rounded-md transition-colors ${
                  view === 'calendar' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md transition-colors ${
                  view === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'calendar' ? <CalendarView /> : <ListView />}

      {/* Add Event Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Adicionar Evento"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome do Evento
            </label>
            <input
              type="text"
              value={eventForm.title}
              onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horário
              </label>
              <input
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Local
            </label>
            <input
              type="text"
              value={eventForm.location}
              onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Unidade
            </label>
            <select
              value={eventForm.unit}
              onChange={(e) => setEventForm(prev => ({ ...prev, unit: e.target.value as 'SP' | 'BH' }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
            >
              <option value="SP">Templo SP</option>
              <option value="BH">Templo BH</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </Modal>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title="Detalhes do Evento"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
              <p className="text-gray-400">
                {new Date(selectedEvent.date).toLocaleDateString('pt-BR')} às {selectedEvent.time}
              </p>
            </div>
            
            <div>
              <p className="text-gray-300">{selectedEvent.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Local:</span>
                <p className="text-white">{selectedEvent.location}</p>
              </div>
              <div>
                <span className="text-gray-400">Unidade:</span>
                <p className="text-white">{DEFAULT_TEMPLES[selectedEvent.unit as keyof typeof DEFAULT_TEMPLES]}</p>
              </div>
            </div>
            
            <div>
              <span className="text-gray-400">Participantes:</span>
              <p className="text-white">{selectedEvent.attendees.length} pessoa(s)</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importar do Google Agenda"
      >
        <div className="text-center py-8">
          <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Funcionalidade em Desenvolvimento
          </h3>
          <p className="text-gray-500">
            A importação do Google Agenda será implementada em breve.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Events;