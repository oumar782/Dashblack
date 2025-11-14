import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X,
  BarChart3,
  Palette,
  Key,
  Type,
  FileText,
  List,
  AlertCircle
} from 'lucide-react';
import './defis.css';

const DefisManager = () => {
  const [defis, setDefis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDefi, setEditingDefi] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire de défi
  const [formData, setFormData] = useState({
    section_key: '',
    title: '',
    color: '#e25822',
    stats: '',
    content: '',
    full_content: ''
  });

  // Charger les données initiales
  useEffect(() => {
    fetchDefis();
  }, []);

  // Fonction pour parser les statistiques en toute sécurité
  const parseStatsSafely = (statsString) => {
    if (!statsString) return [];
    
    try {
      // Nettoyer la chaîne JSON
      const cleanedStats = statsString.trim();
      if (!cleanedStats) return [];
      
      // Si c'est déjà un tableau JSON valide
      if (cleanedStats.startsWith('[') && cleanedStats.endsWith(']')) {
        const parsed = JSON.parse(cleanedStats);
        return Array.isArray(parsed) ? parsed : [cleanedStats];
      }
      
      // Si c'est une chaîne simple, la transformer en tableau
      return [cleanedStats];
    } catch (error) {
      console.warn('Erreur de parsing des statistiques:', error);
      // Si le parsing échoue, retourner la chaîne originale dans un tableau
      return [statsString];
    }
  };

  // Calculer le total des statistiques de manière sécurisée
  const totalStats = defis.reduce((acc, defi) => {
    const stats = parseStatsSafely(defi.stats);
    return acc + stats.length;
  }, 0);

  // Filtrer les défis
  const filteredDefis = defis.filter(defi => {
    const matchesSearch = defi.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defi.section_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defi.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // API calls
  const fetchDefis = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://backblack.vercel.app/api/defis');
      const data = await response.json();
      if (data.success) {
        setDefis(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des défis');
    } finally {
      setLoading(false);
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
      section_key: '',
      title: '',
      color: '#e25822',
      stats: '',
      content: '',
      full_content: ''
    });
    setEditingDefi(null);
  };

  const openModal = (defi = null) => {
    if (defi) {
      setEditingDefi(defi);
      setFormData({
        section_key: defi.section_key,
        title: defi.title,
        color: defi.color,
        stats: defi.stats,
        content: defi.content,
        full_content: defi.full_content
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
  const createDefi = async (e) => {
    e.preventDefault();
    try {
      // Valider et formater les statistiques
      const formattedData = {
        ...formData,
        stats: formData.stats ? formData.stats : '[]'
      };

      const response = await fetch('https://backblack.vercel.app/api/defis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      const data = await response.json();
      if (data.success) {
        fetchDefis();
        closeModal();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la création du défi');
    }
  };

  const updateDefi = async (e) => {
    e.preventDefault();
    try {
      // Valider et formater les statistiques
      const formattedData = {
        ...formData,
        stats: formData.stats ? formData.stats : '[]'
      };

      const response = await fetch(`https://backblack.vercel.app/api/defis/id/${editingDefi.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      const data = await response.json();
      if (data.success) {
        fetchDefis();
        closeModal();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du défi');
    }
  };

  const deleteDefi = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce défi ?')) {
      try {
        const response = await fetch(`https://backblack.vercel.app/api/defis/id/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchDefis();
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Erreur lors de la suppression du défi');
      }
    }
  };

  // Affichage conditionnel
  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      Chargement des défis...
    </div>
  );
  
  if (error) return (
    <div className="error">
      <X size={24} />
      Erreur: {error}
    </div>
  );

  return (
    <div className="defis-manager">
      {/* Header */}
      <header className="defis-header">
        <div className="header-left">
          <h1>
            <Target size={32} />
            Gestion des Défis
          </h1>
          <p>Créez, modifiez et gérez vos défis</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Nouveau Défi
        </button>
      </header>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-value">{defis.length}</div>
          <div className="stat-label">Défis totaux</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Key size={24} />
          </div>
          <div className="stat-value">{new Set(defis.map(d => d.section_key)).size}</div>
          <div className="stat-label">Clés uniques</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Palette size={24} />
          </div>
          <div className="stat-value">{new Set(defis.map(d => d.color)).size}</div>
          <div className="stat-label">Couleurs utilisées</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <List size={24} />
          </div>
          <div className="stat-value">{totalStats}</div>
          <div className="stat-label">Statistiques totales</div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un défi par titre, clé ou contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="stats">
          {filteredDefis.length} défi(s) trouvé(s)
        </div>
      </div>

      {/* Grille de défis */}
      <div className="defis-grid">
        {filteredDefis.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Target size={48} />
            </div>
            <h3>Aucun défi trouvé</h3>
            <p>Essayez de modifier votre recherche ou créez un nouveau défi</p>
          </div>
        ) : (
          filteredDefis.map(defi => {
            const statsArray = parseStatsSafely(defi.stats);
            
            return (
              <div key={defi.id} className="defi-card" style={{ borderLeftColor: defi.color }}>
                <div className="defi-header">
                  <div className="defi-key">
                    <Key size={14} />
                    <span>{defi.section_key}</span>
                  </div>
                  <div className="defi-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => openModal(defi)}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon danger" 
                      onClick={() => deleteDefi(defi.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="defi-content">
                  <h3 className="defi-title">{defi.title}</h3>
                  <div className="defi-color">
                    <Palette size={14} />
                    <span style={{ color: defi.color }}>{defi.color}</span>
                  </div>
                  <p className="defi-description">{defi.content}</p>
                </div>

                {statsArray.length > 0 && (
                  <div className="defi-stats">
                    <h4>
                      <BarChart3 size={16} />
                      Statistiques
                    </h4>
                    <div className="stats-list">
                      {statsArray.map((stat, index) => (
                        <div key={index} className="stat-item">
                          {stat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {defi.stats && statsArray.length === 0 && (
                  <div className="defi-stats-error">
                    <AlertCircle size={14} />
                    <span>Format de statistiques invalide</span>
                  </div>
                )}

                <div className="defi-footer">
                  <div className="defi-meta">
                    <div className="meta-item">
                      <Type size={14} />
                      <span>{defi.content?.length || 0} caractères</span>
                    </div>
                    <div className="meta-item">
                      <FileText size={14} />
                      <span>{defi.full_content?.length || 0} caractères (contenu complet)</span>
                    </div>
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
                <Target size={24} />
                {editingDefi ? 'Modifier le défi' : 'Créer un nouveau défi'}
              </h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={editingDefi ? updateDefi : createDefi}>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <Key size={16} />
                    Clé de section *
                  </label>
                  <input
                    type="text"
                    name="section_key"
                    value={formData.section_key}
                    onChange={handleInputChange}
                    placeholder="ex: defi_innovation"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Type size={16} />
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="ex: Défi Innovation"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Palette size={16} />
                    Couleur *
                  </label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="#e25822"
                      required
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>
                    <BarChart3 size={16} />
                    Statistiques (JSON array ou texte simple)
                  </label>
                  <textarea
                    name="stats"
                    value={formData.stats}
                    onChange={handleInputChange}
                    placeholder=''
                    rows="3"
                  />
                  <small>
                    Format accepté: JSON array (["stat1", "stat2"]) ou texte simple
                  </small>
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
                    placeholder="Description courte du défi..."
                    required
                    rows="4"
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    <FileText size={16} />
                    Contenu complet *
                  </label>
                  <textarea
                    name="full_content"
                    value={formData.full_content}
                    onChange={handleInputChange}
                    placeholder="Contenu détaillé du défi..."
                    required
                    rows="6"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  <X size={16} />
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingDefi ? (
                    <>
                      <Edit size={16} />
                      Mettre à jour
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Créer le défi
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

export default DefisManager;