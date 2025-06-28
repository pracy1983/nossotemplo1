import React from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Settings,
  Home,
  Upload,
  Building
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Principal', icon: Home },
    { id: 'students', label: 'Lista de Alunos', icon: Users },
    { id: 'add-student', label: 'Adicionar Aluno', icon: UserPlus },
    { id: 'manage-admins', label: 'Gerenciar ADMs', icon: Settings },
    { id: 'temples', label: 'Templos', icon: Building },
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'attendance', label: 'Marcar Presença', icon: CheckSquare },
    { id: 'import', label: 'Importar Alunos', icon: Upload },
    { id: 'statistics', label: 'Estatísticas', icon: BarChart3 }
  ];

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;