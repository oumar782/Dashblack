import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Users,
  Clock,
  DollarSign,
  User,
  X,
  BarChart3,
  CheckCircle,
  Circle
} from 'lucide-react';
import './event.css';

const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    featured: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire d'événement
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    format: '',
    event_date: '',
    event_time: '',
    duration: '',
    instructor: '',
    max_participants: '',
    price: '',
    level: '',
    is_featured: false,
    category: '',
    is_published: true
  });

  // Charger les données initiales
  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchTypes();
    fetchStats();
  }, []);

  // Filtrer les événements
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'all' || event.category === filters.category;
    const matchesType = filters.type === 'all' || event.type === filters.type;
    const matchesFeatured = filters.featured === 'all' || 
                           (filters.featured === 'featured' && event.is_featured) ||
                           (filters.featured === 'regular' && !event.is_featured);
    
    return matchesSearch && matchesCategory && matchesType && matchesFeatured;
  });

  // API calls
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://backblack.vercel.app/api/event/admin');
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://backblack.vercel.app/api/event/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories');
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch('https://backblack.vercel.app/api/event/types');
      const data = await response.json();
      if (data.success) {
        setTypes(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des types');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://backblack.vercel.app/api/event/stats/overview');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques');
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
      description: '',
      type: '',
      format: '',
      event_date: '',
      event_time: '',
      duration: '',
      instructor: '',
      max_participants: '',
      price: '',
      level: '',
      is_featured: false,
      category: '',
      is_published: true
    });
    setEditingEvent(null);
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        type: event.type,
        format: event.format,
        event_date: event.event_date,
        event_time: event.event_time,
        duration: event.duration,
        instructor: event.instructor,
        max_participants: event.max_participants,
        price: event.price,
        level: event.level,
        is_featured: event.is_featured,
        category: event.category,
        is_published: event.is_published
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
  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://backblack.vercel.app/api/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        fetchEvents();
        fetchStats();
        closeModal();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'événement');
    }
  };

  const updateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backblack.vercel.app/api/event/id/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        fetchEvents();
        fetchStats();
        closeModal();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'événement');
    }
  };

  const deleteEvent = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        const response = await fetch(`https://backblack.vercel.app/api/event/id/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchEvents();
          fetchStats();
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Erreur lors de la suppression de l\'événement');
      }
    }
  };

  const togglePublish = async (id) => {
    try {
      const response = await fetch(`https://backblack.vercel.app/api/event/id/${id}/toggle-publish`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (data.success) {
        fetchEvents();
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du changement de statut de publication');
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const response = await fetch(`https://backblack.vercel.app/api/event/id/${id}/toggle-featured`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (data.success) {
        fetchEvents();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du changement de statut vedette');
    }
  };

  // Affichage conditionnel
  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      Chargement des événements...
    </div>
  );
  
  if (error) return (
    <div className="error">
      <X size={24} />
      Erreur: {error}
    </div>
  );

  return (
    <div className="events-manager">
      {/* Header */}
      <header className="events-header">
        <div className="header-left">
          <h1>
            <Calendar size={32} />
            Gestion des Événements
          </h1>
          <p>Créez, modifiez et gérez vos événements</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Nouvel Événement
        </button>
      </header>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-value">{stats.total_events || 0}</div>
          <div className="stat-label">Événements totaux</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Eye size={24} />
          </div>
          <div className="stat-value">{stats.published_events || 0}</div>
          <div className="stat-label">Événements publiés</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-value">{stats.featured_events || 0}</div>
          <div className="stat-label">En vedette</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-value">{stats.total_participants || 0}</div>
          <div className="stat-label">Participants</div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <label>Catégorie:</label>
          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.event_count})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select 
            value={filters.type} 
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="all">Tous les types</option>
            {types.map(type => (
              <option key={type.type} value={type.type}>
                {type.type} ({type.event_count})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Statut:</label>
          <select 
            value={filters.featured} 
            onChange={(e) => setFilters({...filters, featured: e.target.value})}
          >
            <option value="all">Tous</option>
            <option value="featured">En vedette</option>
            <option value="regular">Ordinaires</option>
          </select>
        </div>

        <div className="stats">
          {filteredEvents.length} événement(s) trouvé(s)
        </div>
      </div>

      {/* Grille d'événements */}
      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h3>Aucun événement trouvé</h3>
            <p>Essayez de modifier vos filtres ou créez un nouvel événement</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className={`event-card ${event.is_featured ? 'featured' : ''}`}>
              <div className="event-header">
                <div className="event-category">
                  <span>{event.category}</span>
                </div>
                <div className="event-actions">
                  <button 
                    className={`btn-icon ${event.is_featured ? 'active' : ''}`}
                    onClick={() => toggleFeatured(event.id)}
                    title={event.is_featured ? "Retirer des vedettes" : "Mettre en vedette"}
                  >
                    <Star size={16} />
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => openModal(event)}
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn-icon danger" 
                    onClick={() => deleteEvent(event.id)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
              </div>

              <div className="event-meta">
                <div className="meta-item">
                  <User size={16} />
                  <span>{event.instructor}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{event.duration}</span>
                </div>
                <div className="meta-item">
                  <Users size={16} />
                  <span>{event.participants || 0}/{event.max_participants}</span>
                </div>
                <div className="meta-item">
                  <DollarSign size={16} />
                  <span>{event.price}€</span>
                </div>
              </div>

              <div className="event-footer">
                <div className={`status-badge ${event.is_published ? 'published' : 'draft'}`}>
                  {event.is_published ? (
                    <>
                      <Eye size={14} />
                      Publié
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} />
                      Brouillon
                    </>
                  )}
                </div>
                <button 
                  className="btn-view"
                  onClick={() => togglePublish(event.id)}
                >
                  {event.is_published ? (
                    <>
                      <EyeOff size={14} />
                      Dépublier
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      Publier
                    </>
                  )}
                </button>
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
                <Calendar size={24} />
                {editingEvent ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
              </h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={editingEvent ? updateEvent : createEvent}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Titre *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez un type</option>
                    {types.map(type => (
                      <option key={type.type} value={type.type}>{type.type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Format *</label>
                  <input
                    type="text"
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Heure *</label>
                  <input
                    type="time"
                    name="event_time"
                    value={formData.event_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Durée *</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="ex: 2 heures"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Instructeur *</label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Participants max *</label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Prix (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Niveau *</label>
                  <input
                    type="text"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    placeholder="ex: Débutant, Intermédiaire"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Catégorie *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.category} value={cat.category}>{cat.category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                    />
                    <Star size={16} />
                    Mettre en vedette
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleInputChange}
                    />
                    {formData.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                    Publier immédiatement
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  <X size={16} />
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingEvent ? (
                    <>
                      <Edit size={16} />
                      Mettre à jour
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Créer l'événement
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

export default EventsManager;