import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X,
  BarChart3,
  MapPin,
  User,
  Clock,
  Eye,
  EyeOff,
  Tag,
  Type,
  FileText,
  CheckCircle,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import './fracture.css';

const FracturesManager = () => {
  const [fractures, setFractures] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFracture, setEditingFracture] = useState(null);
  const [filters, setFilters] = useState({
    statut: 'all',
    niveau_urgence: 'all',
    categorie: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire de fracture
  const [formData, setFormData] = useState({
    titre: '',
    categorie: '',
    description: '',
    lieu: '',
    niveau_urgence: 'moyen',
    contact: '',
    statut: 'en_attente'
  });

  // Catégories et statuts prédéfinis
  const categories = ['infrastructure', 'routière', 'bâtiment', 'équipement', 'autre'];
  const niveauxUrgence = [
    { value: 'faible', label: 'Faible', color: '#10B981' },
    { value: 'moyen', label: 'Moyen', color: '#F59E0B' },
    { value: 'eleve', label: 'Élevé', color: '#EF4444' }
  ];
  const statuts = [
    { value: 'en_attente', label: 'En attente', icon: Clock },
    { value: 'en_cours', label: 'En cours', icon: PlayCircle },
    { value: 'traite', label: 'Traité', icon: CheckCircle }
  ];

  // Charger les données initiales
  useEffect(() => {
    fetchFractures();
    fetchStats();
  }, []);

  // Filtrer les fractures
  const filteredFractures = fractures.filter(fracture => {
    const matchesSearch = fracture.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fracture.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fracture.lieu?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filters.statut === 'all' || fracture.statut === filters.statut;
    const matchesUrgence = filters.niveau_urgence === 'all' || fracture.niveau_urgence === filters.niveau_urgence;
    const matchesCategorie = filters.categorie === 'all' || fracture.categorie === filters.categorie;
    
    return matchesSearch && matchesStatut && matchesUrgence && matchesCategorie;
  });

  // API calls
  const fetchFractures = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://backblack.vercel.app/api/fracture/');
      const data = await response.json();
      if (data.success) {
        setFractures(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des fractures');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://backblack.vercel.app/api/fracture/statistiques/total');
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      categorie: '',
      description: '',
      lieu: '',
      niveau_urgence: 'moyen',
      contact: '',
      statut: 'en_attente'
    });
    setEditingFracture(null);
  };

  const openModal = (fracture = null) => {
    if (fracture) {
      setEditingFracture(fracture);
      setFormData({
        titre: fracture.titre || '',
        categorie: fracture.categorie || '',
        description: fracture.description || '',
        lieu: fracture.lieu || '',
        niveau_urgence: fracture.niveau_urgence || 'moyen',
        contact: fracture.contact || '',
        statut: fracture.statut || 'en_attente'
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
  const createFracture = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://backblack.vercel.app/api/fracture/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        fetchFractures();
        fetchStats();
        closeModal();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la création de la fracture');
    }
  };

  const updateFracture = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backblack.vercel.app/api/fracture/id/${editingFracture.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        fetchFractures();
        fetchStats();
        closeModal();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de la fracture');
    }
  };

  const deleteFracture = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette fracture ?')) {
      try {
        const response = await fetch(`https://backblack.vercel.app/api/fracture/id/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchFractures();
          fetchStats();
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Erreur lors de la suppression de la fracture');
      }
    }
  };

  const updateStatut = async (id, nouveauStatut) => {
    try {
      const response = await fetch(`https://backblack.vercel.app/api/fracture/id/${id}/statut`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: nouveauStatut }),
      });
      const data = await response.json();
      if (data.success) {
        fetchFractures();
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  // Obtenir les informations d'un statut
  const getStatutInfo = (statut) => {
    return statuts.find(s => s.value === statut) || statuts[0];
  };

  // Obtenir les informations d'un niveau d'urgence
  const getUrgenceInfo = (urgence) => {
    return niveauxUrgence.find(u => u.value === urgence) || niveauxUrgence[1];
  };

  // Affichage conditionnel
  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      Chargement des fractures...
    </div>
  );
  
  if (error) return (
    <div className="error">
      <X size={24} />
      Erreur: {error}
    </div>
  );

  return (
    <div className="fractures-manager">
      {/* Header */}
      <header className="fractures-header">
        <div className="header-left">
          <h1>
            <AlertTriangle size={32} />
            Gestion des Fractures
          </h1>
          <p>Signalez et gérez les fractures et dommages</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Nouvelle Fracture
        </button>
      </header>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-value">{stats.total_fractures || 0}</div>
          <div className="stat-label">Fractures totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <AlertCircle size={24} />
          </div>
          <div className="stat-value">{stats.fractures_urgentes || 0}</div>
          <div className="stat-label">Fractures urgentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-value">{stats.en_attente || 0}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-value">{stats.traitees || 0}</div>
          <div className="stat-label">Traitées</div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une fracture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <label>Statut:</label>
          <select 
            value={filters.statut} 
            onChange={(e) => setFilters({...filters, statut: e.target.value})}
          >
            <option value="all">Tous les statuts</option>
            {statuts.map(statut => (
              <option key={statut.value} value={statut.value}>
                {statut.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Urgence:</label>
          <select 
            value={filters.niveau_urgence} 
            onChange={(e) => setFilters({...filters, niveau_urgence: e.target.value})}
          >
            <option value="all">Tous les niveaux</option>
            {niveauxUrgence.map(urgence => (
              <option key={urgence.value} value={urgence.value}>
                {urgence.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Catégorie:</label>
          <select 
            value={filters.categorie} 
            onChange={(e) => setFilters({...filters, categorie: e.target.value})}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(categorie => (
              <option key={categorie} value={categorie}>
                {categorie.charAt(0).toUpperCase() + categorie.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="stats">
          {filteredFractures.length} fracture{filteredFractures.length > 1 ? 's' : ''} trouvée{filteredFractures.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grille de fractures */}
      <div className="fractures-grid">
        {filteredFractures.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <AlertTriangle size={48} />
            </div>
            <h3>Aucune fracture trouvée</h3>
            <p>Essayez de modifier vos filtres ou signalez une nouvelle fracture</p>
          </div>
        ) : (
          filteredFractures.map(fracture => {
            const urgenceInfo = getUrgenceInfo(fracture.niveau_urgence);
            const statutInfo = getStatutInfo(fracture.statut);
            const StatutIcon = statutInfo.icon;
            
            return (
              <div key={fracture.id} className="fracture-card">
                <div className="fracture-header">
                  <div className="fracture-urgence" style={{ color: urgenceInfo.color }}>
                    <AlertTriangle size={14} />
                    <span>Urgence {urgenceInfo.label}</span>
                  </div>
                  <div className="fracture-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => openModal(fracture)}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon danger" 
                      onClick={() => deleteFracture(fracture.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="fracture-content">
                  <h3 className="fracture-title">{fracture.titre}</h3>
                  <div className="fracture-categorie">
                    <Tag size={14} />
                    <span>{fracture.categorie}</span>
                  </div>
                  <p className="fracture-description">{fracture.description}</p>
                </div>

                <div className="fracture-meta">
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{fracture.lieu}</span>
                  </div>
                  {fracture.contact && (
                    <div className="meta-item">
                      <User size={14} />
                      <span>{fracture.contact}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{new Date(fracture.date_creation).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="fracture-footer">
                  <div className="statut-selector">
                    <label>Statut:</label>
                    <select 
                      value={fracture.statut} 
                      onChange={(e) => updateStatut(fracture.id, e.target.value)}
                      style={{ color: statutInfo.color }}
                    >
                      {statuts.map(statut => {
                        const Icon = statut.icon;
                        return (
                          <option key={statut.value} value={statut.value}>
                            {statut.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className={`status-badge`} style={{ color: statutInfo.color, borderColor: statutInfo.color }}>
                    <StatutIcon size={14} />
                    <span>{statutInfo.label}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <AlertTriangle size={24} />
                {editingFracture ? 'Modifier la fracture' : 'Signaler une nouvelle fracture'}
              </h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={editingFracture ? updateFracture : createFracture}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>
                    <Type size={16} />
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    placeholder="ex: Fissure dans le mur principal"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Tag size={16} />
                    Catégorie *
                  </label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map(categorie => (
                      <option key={categorie} value={categorie}>
                        {categorie.charAt(0).toUpperCase() + categorie.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <AlertTriangle size={16} />
                    Niveau d'urgence *
                  </label>
                  <select
                    name="niveau_urgence"
                    value={formData.niveau_urgence}
                    onChange={handleInputChange}
                    required
                  >
                    {niveauxUrgence.map(urgence => (
                      <option key={urgence.value} value={urgence.value}>
                        {urgence.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <Clock size={16} />
                    Statut *
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    required
                  >
                    {statuts.map(statut => (
                      <option key={statut.value} value={statut.value}>
                        {statut.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>
                    <MapPin size={16} />
                    Lieu *
                  </label>
                  <input
                    type="text"
                    name="lieu"
                    value={formData.lieu}
                    onChange={handleInputChange}
                    placeholder="ex: Bâtiment A, étage 2"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <User size={16} />
                    Contact
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="ex: John Doe - 01 23 45 67 89"
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    <FileText size={16} />
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez la fracture en détail..."
                    required
                    rows="4"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  <X size={16} />
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingFracture ? (
                    <>
                      <Edit size={16} />
                      Mettre à jour
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Créer la fracture
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

export default FracturesManager;