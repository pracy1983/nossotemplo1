import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Save, X, Upload, MapPin, Users, Calendar, Building } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Temple, Student } from '../../types';
import { generateId, validateEmail } from '../../utils/helpers';
import Modal from '../common/Modal';

const Temples: React.FC = () => {
  const { temples, students, events, addTemple, updateTemple, deleteTemple } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Temple>>({
    city: '',
    abbreviation: '',
    street: '',
    number: '',
    neighborhood: '',
    zipCode: '',
    state: '',
    founders: [],
    isActive: true
  });
  const [photo, setPhoto] = useState<string>('');
  const [logo, setLogo] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Filter temples based on search
  const filteredTemples = temples.filter(temple =>
    temple.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    temple.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    temple.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get founders (students who are marked as founders)
  const founderStudents = students.filter(student => student.isFounder && !student.isGuest);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.city?.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!formData.abbreviation?.trim()) {
      newErrors.abbreviation = 'Sigla é obrigatória';
    } else if (formData.abbreviation.length > 5) {
      newErrors.abbreviation = 'Sigla deve ter no máximo 5 caracteres';
    } else {
      // Check for duplicate abbreviation
      const existingTemple = temples.find(t => 
        t.abbreviation.toLowerCase() === formData.abbreviation!.toLowerCase() && 
        t.id !== formData.id
      );
      if (existingTemple) {
        newErrors.abbreviation = 'Já existe um templo com esta sigla';
      }
    }

    if (!formData.street?.trim()) {
      newErrors.street = 'Rua é obrigatória';
    }

    if (!formData.number?.trim()) {
      newErrors.number = 'Número é obrigatório';
    }

    if (!formData.neighborhood?.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }

    if (!formData.zipCode?.trim()) {
      newErrors.zipCode = 'CEP é obrigatório';
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const searchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setErrors(prev => ({ ...prev, zipCode: 'CEP deve ter 8 dígitos' }));
      return;
    }

    setIsLoadingCep(true);
    setErrors(prev => ({ ...prev, zipCode: '' }));

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrors(prev => ({ ...prev, zipCode: 'CEP não encontrado' }));
        return;
      }

      // Auto-fill address fields
      setFormData(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        zipCode: cleanCep
      }));

    } catch (error) {
      console.error('Error fetching CEP:', error);
      setErrors(prev => ({ ...prev, zipCode: 'Erro ao buscar CEP' }));
    } finally {
      setIsLoadingCep(false);
    }
  };

  const formatCep = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleCepChange = (value: string) => {
    const formattedCep = formatCep(value);
    setFormData(prev => ({ ...prev, zipCode: formattedCep }));
    
    // Auto-search when CEP is complete
    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      searchCep(cleanCep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);
    
    try {
      // Generate temple name from abbreviation
      const templeName = `Templo ${formData.abbreviation!.toUpperCase()}`;
      
      // Build full address
      const fullAddress = `${formData.street}, ${formData.number} - ${formData.neighborhood}, ${formData.city} - ${formData.state}, CEP: ${formData.zipCode}`;

      const templeData: Temple = {
        id: formData.id || generateId(),
        photo,
        logo,
        name: templeName,
        city: formData.city!,
        abbreviation: formData.abbreviation!.toUpperCase(),
        address: fullAddress,
        street: formData.street!,
        number: formData.number!,
        neighborhood: formData.neighborhood!,
        zipCode: formData.zipCode!,
        state: formData.state!,
        founders: formData.founders || [],
        isActive: formData.isActive ?? true,
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (formData.id) {
        await updateTemple(formData.id, templeData);
        setSelectedTemple(templeData);
        alert('Templo atualizado com sucesso!');
      } else {
        await addTemple(templeData);
        alert('Templo cadastrado com sucesso!');
        setShowAddModal(false);
      }

      // Reset form
      setFormData({
        city: '',
        abbreviation: '',
        street: '',
        number: '',
        neighborhood: '',
        zipCode: '',
        state: '',
        founders: [],
        isActive: true
      });
      setPhoto('');
      setLogo('');
      setIsEditing(false);
      setErrors({});
    } catch (error: any) {
      console.error('Error saving temple:', error);
      alert('Erro ao salvar templo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (temple: Temple) => {
    setSelectedTemple(temple);
    setFormData({
      ...temple,
      street: temple.street || '',
      number: temple.number || '',
      neighborhood: temple.neighborhood || '',
      zipCode: temple.zipCode || '',
      state: temple.state || ''
    });
    setPhoto(temple.photo || '');
    setLogo(temple.logo || '');
    setIsEditing(true);
    setErrors({});
  };

  const handleDelete = async (temple: Temple) => {
    // Check if temple has students or events
    const templeStudents = students.filter(s => s.unit === temple.abbreviation);
    const templeEvents = events.filter(e => e.unit === temple.abbreviation);
    
    if (templeStudents.length > 0 || templeEvents.length > 0) {
      alert(`Não é possível excluir este templo pois ele possui ${templeStudents.length} aluno(s) e ${templeEvents.length} evento(s) associados.`);
      return;
    }

    if (confirm('Tem certeza que deseja excluir este templo?')) {
      try {
        await deleteTemple(temple.id);
        setSelectedTemple(null);
        alert('Templo excluído com sucesso!');
      } catch (error) {
        console.error('Error deleting temple:', error);
        alert('Erro ao excluir templo. Tente novamente.');
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFounderToggle = (studentId: string) => {
    const currentFounders = formData.founders || [];
    const isSelected = currentFounders.includes(studentId);
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        founders: currentFounders.filter(id => id !== studentId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        founders: [...currentFounders, studentId]
      }));
    }
  };

  const getTempleStats = (temple: Temple) => {
    const templeStudents = students.filter(s => s.unit === temple.abbreviation && !s.isGuest);
    const templeEvents = events.filter(e => e.unit === temple.abbreviation);
    const activeStudents = templeStudents.filter(s => s.isActive).length;
    const founders = students.filter(s => temple.founders.includes(s.id));
    
    return {
      totalStudents: templeStudents.length,
      activeStudents,
      totalEvents: templeEvents.length,
      founders: founders.length
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Templos</h1>
          <p className="text-gray-400">Gerencie as unidades do sistema</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Templo</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar templos por nome, cidade ou sigla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Temples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemples.map(temple => {
          const stats = getTempleStats(temple);
          
          return (
            <div key={temple.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-red-600 transition-colors">
              {/* Temple Logo/Photo */}
              <div className="relative mb-4">
                <img
                  src={temple.logo || temple.photo || 'https://images.pexels.com/photos/161758/governor-s-mansion-montgomery-alabama-grand-staircase-161758.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'}
                  alt={temple.name}
                  className={`w-full h-48 object-cover rounded-lg ${temple.logo ? 'object-contain bg-gray-800' : ''}`}
                />
                <div className="absolute top-2 right-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    temple.isActive 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {temple.isActive ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
              </div>

              {/* Temple Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{temple.name}</h3>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{temple.city}</span>
                    <span>•</span>
                    <span className="font-mono bg-gray-800 px-2 py-1 rounded">
                      {temple.abbreviation}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  <p>{temple.address}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-800">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-blue-400">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{stats.activeStudents}</span>
                    </div>
                    <p className="text-xs text-gray-400">Alunos Ativos</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-purple-400">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">{stats.totalEvents}</span>
                    </div>
                    <p className="text-xs text-gray-400">Eventos</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3">
                  <button
                    onClick={() => setSelectedTemple(temple)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Ver Detalhes
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(temple)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(temple)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemples.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {searchTerm ? 'Nenhum templo encontrado' : 'Nenhum templo cadastrado'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Tente ajustar o termo de busca' 
              : 'Clique em "Cadastrar Templo" para adicionar o primeiro templo'
            }
          </p>
        </div>
      )}

      {/* Add/Edit Temple Modal */}
      <Modal
        isOpen={showAddModal || isEditing}
        onClose={() => {
          setShowAddModal(false);
          setIsEditing(false);
          setFormData({
            city: '',
            abbreviation: '',
            street: '',
            number: '',
            neighborhood: '',
            zipCode: '',
            state: '',
            founders: [],
            isActive: true
          });
          setPhoto('');
          setLogo('');
          setErrors({});
        }}
        title={isEditing ? 'Editar Templo' : 'Cadastrar Templo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo and Logo Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo do Templo *
              </label>
              <div className="relative">
                <div className="w-full h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-600">
                  {logo ? (
                    <img src={logo} alt="Logo Preview" className="w-full h-full object-contain bg-gray-800" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Logo Quadrado</p>
                        <p className="text-gray-500 text-xs">Personalizado da cidade</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Foto da Fachada
              </label>
              <div className="relative">
                <div className="w-full h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-600">
                  {photo ? (
                    <img src={photo} alt="Photo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Foto da Fachada</p>
                        <p className="text-gray-500 text-xs">Opcional</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sigla *
              </label>
              <input
                type="text"
                value={formData.abbreviation || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, abbreviation: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                placeholder="Ex: SP, BH, CP"
                maxLength={5}
              />
              {errors.abbreviation && <p className="text-red-400 text-sm mt-1">{errors.abbreviation}</p>}
              <p className="text-gray-400 text-xs mt-1">
                Nome será: Templo {formData.abbreviation || '[Sigla]'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cidade *
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                placeholder="Ex: São Paulo"
              />
              {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Endereço</h3>
            
            {/* CEP */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CEP *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.zipCode || ''}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  placeholder="00000-000"
                  maxLength={9}
                />
                {isLoadingCep && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  </div>
                )}
              </div>
              {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
              <p className="text-gray-400 text-xs mt-1">
                Digite o CEP para preenchimento automático
              </p>
            </div>

            {/* Street and Number */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rua *
                </label>
                <input
                  type="text"
                  value={formData.street || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  placeholder="Nome da rua"
                />
                {errors.street && <p className="text-red-400 text-sm mt-1">{errors.street}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  value={formData.number || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  placeholder="123"
                />
                {errors.number && <p className="text-red-400 text-sm mt-1">{errors.number}</p>}
              </div>
            </div>

            {/* Neighborhood and State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bairro *
                </label>
                <input
                  type="text"
                  value={formData.neighborhood || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  placeholder="Nome do bairro"
                />
                {errors.neighborhood && <p className="text-red-400 text-sm mt-1">{errors.neighborhood}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado *
                </label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
              </div>
            </div>
          </div>

          {/* Founders Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fundadores
            </label>
            <p className="text-gray-400 text-sm mb-3">
              Selecione os fundadores deste templo da lista de alunos
            </p>
            
            <div className="max-h-48 overflow-y-auto bg-gray-800 rounded-lg border border-gray-700">
              {founderStudents.length > 0 ? (
                <div className="p-4 space-y-2">
                  {founderStudents.map(student => (
                    <label key={student.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={(formData.founders || []).includes(student.id)}
                        onChange={() => handleFounderToggle(student.id)}
                        className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-600 focus:ring-offset-gray-800"
                      />
                      <img
                        src={student.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'}
                        alt={student.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{student.fullName}</p>
                        <p className="text-gray-400 text-xs">{student.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  Nenhum fundador disponível
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-700 bg-gray-800 text-green-600 focus:ring-green-600 focus:ring-offset-gray-900"
              />
              <span className="text-gray-300">Templo ativo</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setIsEditing(false);
                setFormData({
                  city: '',
                  abbreviation: '',
                  street: '',
                  number: '',
                  neighborhood: '',
                  zipCode: '',
                  state: '',
                  founders: [],
                  isActive: true
                });
                setPhoto('');
                setLogo('');
                setErrors({});
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Temple Details Modal */}
      {selectedTemple && !isEditing && (
        <Modal
          isOpen={!!selectedTemple}
          onClose={() => setSelectedTemple(null)}
          title="Detalhes do Templo"
          size="lg"
        >
          <div className="space-y-6">
            {/* Temple Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTemple.logo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Logo do Templo</h4>
                  <img
                    src={selectedTemple.logo}
                    alt={`Logo ${selectedTemple.name}`}
                    className="w-full h-48 object-contain bg-gray-800 rounded-lg"
                  />
                </div>
              )}
              
              {selectedTemple.photo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Foto da Fachada</h4>
                  <img
                    src={selectedTemple.photo}
                    alt={`Fachada ${selectedTemple.name}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Informações Básicas</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Nome:</span>
                    <p className="text-white">{selectedTemple.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Cidade:</span>
                    <p className="text-white">{selectedTemple.city}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Sigla:</span>
                    <p className="text-white font-mono bg-gray-800 px-2 py-1 rounded inline-block">
                      {selectedTemple.abbreviation}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Status:</span>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedTemple.isActive 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {selectedTemple.isActive ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Estatísticas</h3>
                <div className="space-y-3">
                  {(() => {
                    const stats = getTempleStats(selectedTemple);
                    return (
                      <>
                        <div>
                          <span className="text-gray-400 text-sm">Total de Alunos:</span>
                          <p className="text-white">{stats.totalStudents}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Alunos Ativos:</span>
                          <p className="text-white">{stats.activeStudents}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Total de Eventos:</span>
                          <p className="text-white">{stats.totalEvents}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Fundadores:</span>
                          <p className="text-white">{stats.founders}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Endereço</h3>
              <p className="text-gray-300">{selectedTemple.address}</p>
            </div>

            {/* Founders */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Fundadores</h3>
              {selectedTemple.founders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTemple.founders.map(founderId => {
                    const founder = students.find(s => s.id === founderId);
                    if (!founder) return null;
                    
                    return (
                      <div key={founderId} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                        <img
                          src={founder.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'}
                          alt={founder.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white font-medium">{founder.fullName}</p>
                          <p className="text-gray-400 text-sm">{founder.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400">Nenhum fundador cadastrado</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => handleEdit(selectedTemple)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDelete(selectedTemple)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Temples;