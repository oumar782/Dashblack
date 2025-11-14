import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X,
  BarChart3,
  Clock,
  Eye,
  EyeOff,
  Tag,
  Type,
  FileText
} from 'lucide-react';
import './priere.css';

const PrayersManager = () => {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire de prière
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: '',
    category: '',
    duration: '',
    is_active: true
  });

  // Types et catégories prédéfinis
  const prayerTypes = ['matin', 'soir', 'repas', 'méditation', 'action de grâce', 'demande', 'louange'];
  const prayerCategories = ['quotidienne', 'spéciale', 'communauté', 'personnelle', 'famille', 'travail'];

  // Charger les données initiales
  useEffect(() => {
    fetchPrayers();
  }, []);

  // Filtrer les prières
  const filteredPrayers = prayers.filter(prayer => {
    const matchesSearch = prayer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prayer.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'all' || prayer.type === filters.type;
    const matchesCategory = filters.category === 'all' || prayer.category === filters.category;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && prayer.is_active) ||
                         (filters.status === 'inactive' && !prayer.is_active);
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  // API calls
  const fetchPrayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://backblack.vercel.app/api/priere/');
      if (!response.ok) {
        throw new Error('Erreur réseau');
      }
      const data = await response.json();
      setPrayers(data);
    } catch (err) {
      setError('Erreur lors du chargement des prières');
    } finally {
      setLoading(false);
    }
  };

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: '',
      category: '',
      duration: '',
      is_active: true
    });
    setEditingPrayer(null);
  };

  const openModal = (prayer = null) => {
    if (prayer) {
      setEditingPrayer(prayer);
      setFormData({
        title: prayer.title || '',
        content: prayer.content || '',
        type: prayer.type || '',
        category: prayer.category || '',
        duration: prayer.duration || '',
        is_active: prayer.is_active !== false
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // CRUD Operations
  const createPrayer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://backblack.vercel.app/api/priere/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }
      
      const data = await response.json();
      fetchPrayers();
      closeModal();
    } catch (err) {
      setError('Erreur lors de la création de la prière');
    }
  };

  const updatePrayer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backblack.vercel.app/api/priere/${editingPrayer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      
      const data = await response.json();
      fetchPrayers();
      closeModal();
    } catch (err) {
      setError('Erreur lors de la mise à jour de la prière');
    }
  };

  const deletePrayer = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prière ?')) {
      try {
        const response = await fetch(`https://backblack.vercel.app/api/priere/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }
        
        const data = await response.json();
        fetchPrayers();
      } catch (err) {
        setError('Erreur lors de la suppression de la prière');
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const prayerToUpdate = prayers.find(p => p.id === id);
      if (!prayerToUpdate) return;

      const updatedData = {
        title: prayerToUpdate.title,
        content: prayerToUpdate.content,
        type: prayerToUpdate.type,
        category: prayerToUpdate.category,
        duration: prayerToUpdate.duration,
        is_active: !currentStatus
      };

      const response = await fetch(`https://backblack.vercel.app/api/priere/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du changement de statut');
      }
      
      fetchPrayers();
    } catch (err) {
      setError('Erreur lors du changement de statut');
    }
  };

  // Statistiques
  const stats = {
    total: prayers.length,
    active: prayers.filter(p => p.is_active).length,
    types: new Set(prayers.map(p => p.type).filter(Boolean)).size,
    categories: new Set(prayers.map(p => p.category).filter(Boolean)).size
  };

  // Affichage conditionnel
  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      Chargement des prières...
    </div>
  );
  
  if (error) return (
    <div className="error">
      <X size={24} />
      Erreur: {error}
    </div>
  );

  return (
    <div className="prayers-manager">
      {/* Header */}
      <header className="prayers-header">
        <div className="header-left">
          <h1>
            <BookOpen size={32} />
            Gestion des Prières
          </h1>
          <p>Créez, modifiez et gérez vos prières</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Nouvelle Prière
        </button>
      </header>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Prière{stats.total > 1 ? 's' : ''} totale{stats.total > 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Eye size={24} />
          </div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Prière{stats.active > 1 ? 's' : ''} active{stats.active > 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Type size={24} />
          </div>
          <div className="stat-value">{stats.types}</div>
          <div className="stat-label">Type{stats.types > 1 ? 's' : ''} différent{stats.types > 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Tag size={24} />
          </div>
          <div className="stat-value">{stats.categories}</div>
          <div className="stat-label">Catégorie{stats.categories > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une prière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <label>Type:</label>
          <select 
            value={filters.type} 
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="all">Tous les types</option>
            {prayerTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Catégorie:</label>
          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="all">Toutes les catégories</option>
            {prayerCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Statut:</label>
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">Tous</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>
        </div>

        <div className="stats">
          {filteredPrayers.length} prière{filteredPrayers.length > 1 ? 's' : ''} trouvée{filteredPrayers.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grille de prières */}
      <div className="prayers-grid">
        {filteredPrayers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BookOpen size={48} />
            </div>
            <h3>Aucune prière trouvée</h3>
            <p>Essayez de modifier vos filtres ou créez une nouvelle prière</p>
          </div>
        ) : (
          filteredPrayers.map(prayer => (
            <div key={prayer.id} className={`prayer-card ${prayer.is_active ? 'active' : 'inactive'}`}>
              <div className="prayer-header">
                <div className="prayer-type">
                  <Tag size={14} />
                  <span>{prayer.type || 'Non spécifié'}</span>
                </div>
                <div className="prayer-actions">
                  <button 
                    className={`btn-icon ${prayer.is_active ? 'active' : ''}`}
                    onClick={() => toggleActive(prayer.id, prayer.is_active)}
                    title={prayer.is_active ? "Désactiver" : "Activer"}
                  >
                    {prayer.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => openModal(prayer)}
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn-icon danger" 
                    onClick={() => deletePrayer(prayer.id)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="prayer-content">
                <h3 className="prayer-title">{prayer.title || 'Sans titre'}</h3>
                <p className="prayer-text">{prayer.content || 'Aucun contenu'}</p>
              </div>

              <div className="prayer-meta">
                <div className="meta-item">
                  <Tag size={14} />
                  <span>{prayer.category || 'Non catégorisé'}</span>
                </div>
                {prayer.duration && (
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{prayer.duration}</span>
                  </div>
                )}
                <div className="meta-item">
                  <FileText size={14} />
                  <span>{(prayer.content?.length || 0)} caractères</span>
                </div>
              </div>

              <div className="prayer-footer">
                <div className={`status-badge ${prayer.is_active ? 'active' : 'inactive'}`}>
                  {prayer.is_active ? (
                    <>
                      <Eye size={14} />
                      Active
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} />
                      Inactive
                    </>
                  )}
                </div>
                <div className="prayer-date">
                  {prayer.created_at ? new Date(prayer.created_at).toLocaleDateString() : 'Date inconnue'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <BookOpen size={24} />
                {editingPrayer ? 'Modifier la prière' : 'Créer une nouvelle prière'}
              </h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={editingPrayer ? updatePrayer : createPrayer}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>
                    <Type size={16} />
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="ex: Prière du matin"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Tag size={16} />
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez un type</option>
                    {prayerTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <Tag size={16} />
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {prayerCategories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <Clock size={16} />
                    Durée
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="ex: 5 minutes"
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    <FileText size={16} />
                    Contenu *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Entrez le texte de la prière..."
                    required
                    rows="6"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    {formData.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    Prière active
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  <X size={16} />
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingPrayer ? (
                    <>
                      <Edit size={16} />
                      Mettre à jour
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Créer la prière
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayersManager;