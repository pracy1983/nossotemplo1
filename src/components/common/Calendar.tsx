import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { ATTENDANCE_COLORS, ATTENDANCE_LABELS } from '../../utils/constants';
import { getAttendanceForDate } from '../../utils/helpers';

interface CalendarProps {
  attendance?: AttendanceRecord[];
  onDateClick?: (date: string) => void;
  selectedDate?: string;
  showLegend?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ 
  attendance = [], 
  onDateClick, 
  selectedDate,
  showLegend = true 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear();
  };

  const formatDateString = (day: number) => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDayAttendance = (day: number) => {
    const dateStr = formatDateString(day);
    return getAttendanceForDate(attendance, dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={previousMonth} className="p-2 hover:bg-gray-800 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-lg">
          <ChevronRight className="w-5 h-5" />
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
          <div key={`empty-${index}`} className="h-12" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateStr = formatDateString(day);
          const dayAttendance = getDayAttendance(day);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={day}
              onClick={() => onDateClick?.(dateStr)}
              className={`relative h-12 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-red-600 bg-red-600/20'
                  : isToday(day)
                  ? 'border-red-400 bg-red-400/10'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
              }`}
            >
              <span className={`text-sm ${
                isToday(day) ? 'font-bold text-red-400' : 'text-white'
              }`}>
                {day}
              </span>

              {/* Attendance indicators */}
              {dayAttendance.length > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {Object.entries(ATTENDANCE_COLORS).map(([type, color]) => {
                    const hasType = dayAttendance.some(att => att.type === type);
                    return hasType ? (
                      <div
                        key={type}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ) : null;
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Legenda:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ATTENDANCE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-300">
                  {ATTENDANCE_LABELS[type as keyof typeof ATTENDANCE_LABELS]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;