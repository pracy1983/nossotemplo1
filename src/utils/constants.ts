export const ATTENDANCE_COLORS = {
  development: '#F59E0B', // Yellow
  work: '#60A5FA',        // Light Blue
  monthly: '#10B981',     // Green
  event: '#A855F7'        // Purple
} as const;

export const ATTENDANCE_LABELS = {
  development: 'Desenvolvimento',
  work: 'Trabalho',
  monthly: 'Mensalidade',
  event: 'Evento'
} as const;

// Default temples - will be replaced by dynamic data
export const DEFAULT_TEMPLES = {
  SP: 'Templo SP',
  BH: 'Templo BH'
} as const;

export const USER_ROLES = {
  admin: 'Administrador',
  collaborator: 'Colaborador',
  student: 'Aluno'
} as const;

export const ROLE_COLORS = {
  admin: 'bg-red-600/20 text-red-400 border-red-600/30',
  collaborator: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  student: 'bg-gray-600/20 text-gray-400 border-gray-600/30'
} as const;

export const ROLE_PERMISSIONS = {
  admin: [
    'Todas as funções disponíveis',
    'Adicionar e deletar administradores',
    'Gerenciar colaboradores',
    'Adicionar/editar/excluir alunos',
    'Marcar presenças/faltas',
    'Adicionar/remover/editar eventos',
    'Gerenciar templos',
    'Visualizar estatísticas',
    'Gerenciar sistema'
  ],
  collaborator: [
    'Adicionar alunos',
    'Editar informações de alunos',
    'Marcar presenças/faltas',
    'Adicionar/remover eventos',
    'Visualizar lista de alunos',
    'Visualizar estatísticas básicas'
  ],
  student: [
    'Visualizar próprio perfil',
    'Editar informações pessoais básicas',
    'Visualizar própria frequência'
  ]
} as const;

export const DEFAULT_ADMIN = {
  email: 'paularacy@gmail.com',
  password: 'adm@123'
};

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
} as const;