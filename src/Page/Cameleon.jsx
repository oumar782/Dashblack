import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X,
  BarChart3,
  Tag,
  Calendar,
  Star,
  Eye,
  EyeOff,
  Users,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import './cameleon.css';

const ArticlesManager = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    featured: 'all',
    level: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire d'article
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    content: '',
    stats: '',
    publish_date: '',
    tags: '',
    is_featured: false,
    level: '',
    is_published: true
  });

  // Charger les données initiales
  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchStats();
  }, []);

  // Fonction pour parser les statistiques en toute sécurité
  const parseStatsSafely = (statsString) => {
    if (!statsString) return [];
    
    try {
      const cleanedStats = statsString.trim();
      if (!cleanedStats) return [];
      
      if (cleanedStats.startsWith('[') && cleanedStats.endsWith(']')) {
        const parsed = JSON.parse(cleanedStats);
        return Array.isArray(parsed) ? parsed : [cleanedStats];
      }
      
      return [cleanedStats];
    } catch (error) {
      console.warn('Erreur de parsing des statistiques:', error);
      return [statsString];
    }
  };

  // Filtrer les articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'all' || article.category === filters.category;
    const matchesFeatured = filters.featured === 'all' || 
                           (filters.featured === 'featured' && article.is_featured) ||
                           (filters.featured === 'regular' && !article.is_featured);
    const matchesLevel = filters.level === 'all' || article.level === filters.level;
    
    return matchesSearch && matchesCategory && matchesFeatured && matchesLevel;
  });

  // API calls
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://backblack.vercel.app/api/cameleon/admin');
      const data = await response.json();
      if (data.success) {
        setArticles(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://backblack.vercel.app/api/cameleon/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://backblack.vercel.app/api/cameleon/stats/overview');
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
      category: '',
      description: '',
      content: '',
      stats: '',
      publish_date: '',
      tags: '',
      is_featured: false,
      level: '',
      is_published: true
    });
    setEditingArticle(null);
  };

  const openModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        category: article.category,
        description: article.description,
        content: article.content,
        stats: article.stats,
        publish_date: article.publish_date,
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags,
        is_featured: article.is_featured,
        level: article.level,
        is_published: article.is_published
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
  const createArticle = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        stats: formData.stats ? formData.stats : '[]'
      };

      const response = await fetch('https://backblack.vercel.app/api/cameleon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      const data = await response.json();
      if (data.success) {
        fetchArticles();
        fetchStats();
        closeModal();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'article');
    }
  };

  const updateArticle = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        stats: formData.stats ? formData.stats : '[]'
      };

      const response = await fetch(`https://backblack.vercel.app/api/cameleon/id/${editingArticle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      const data = await response.json();
      if (data.success) {
        fetchArticles();
        fetchStats();
        closeModal();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'article');
    }
  };

  const deleteArticle = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        const response = await fetch(`https://backblack.vercel.app/api/cameleon/id/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchArticles();
          fetchStats();
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Erreur lors de la suppression de l\'article');
      }
    }
  };

  const togglePublish = async (id) => {
    try {
      const response = await fetch(`https://backblack.vercel.app/api/cameleon/id/${id}/toggle-publish`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (data.success) {
        fetchArticles();
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
      const response = await fetch(`https://backblack.vercel.app/api/cameleon/id/${id}/toggle-featured`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (data.success) {
        fetchArticles();
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
      Chargement des articles...
    </div>
  );
  
  if (error) return (
    <div className="error">
      <X size={24} />
      Erreur: {error}
    </div>
  );

  return (
    <div className="articles-manager">
      {/* Header */}
      <header className="articles-header">
        <div className="header-left">
          <h1>
            <FileText size={32} />
            Gestion des Articles
          </h1>
          <p>Créez, modifiez et gérez vos articles</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Nouvel Article
        </button>
      </header>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-value">{stats.total_articles || 0}</div>
          <div className="stat-label">Articles totaux</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Eye size={24} />
          </div>
          <div className="stat-value">{stats.published_articles || 0}</div>
          <div className="stat-label">Articles publiés</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-value">{stats.featured_articles || 0}</div>
          <div className="stat-label">En vedette</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Tag size={24} />
          </div>
          <div className="stat-value">{stats.categories_count || 0}</div>
          <div className="stat-label">Catégories</div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un article..."
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
                {cat.category} ({cat.article_count})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Niveau:</label>
          <select 
            value={filters.level} 
            onChange={(e) => setFilters({...filters, level: e.target.value})}
          >
            <option value="all">Tous les niveaux</option>
            <option value="débutant">Débutant</option>
            <option value="intermédiaire">Intermédiaire</option>
            <option value="avancé">Avancé</option>
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
          {filteredArticles.length} article(s) trouvé(s)
        </div>
      </div>

      {/* Grille d'articles */}
      <div className="articles-grid">
        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={48} />
            </div>
            <h3>Aucun article trouvé</h3>
            <p>Essayez de modifier vos filtres ou créez un nouvel article</p>
          </div>
        ) : (
          filteredArticles.map(article => {
            const statsArray = parseStatsSafely(article.stats);
            
            return (
              <div key={article.id} className={`article-card ${article.is_featured ? 'featured' : ''}`}>
                <div className="article-header">
                  <div className="article-category">
                    <Tag size={14} />
                    <span>{article.category}</span>
                  </div>
                  <div className="article-actions">
                    <button 
                      className={`btn-icon ${article.is_featured ? 'active' : ''}`}
                      onClick={() => toggleFeatured(article.id)}
                      title={article.is_featured ? "Retirer des vedettes" : "Mettre en vedette"}
                    >
                      <Star size={16} />
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => openModal(article)}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon danger" 
                      onClick={() => deleteArticle(article.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="article-content">
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-description">{article.description}</p>
                </div>

                {statsArray.length > 0 && (
                  <div className="article-stats">
                    <h4>
                      <TrendingUp size={16} />
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

                {article.tags && article.tags.length > 0 && (
                  <div className="article-tags">
                    <div className="tags-list">
                      {article.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="article-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{new Date(article.publish_date).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={14} />
                    <span>{article.level}</span>
                  </div>
                </div>

                <div className="article-footer">
                  <div className={`status-badge ${article.is_published ? 'published' : 'draft'}`}>
                    {article.is_published ? (
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
                    onClick={() => togglePublish(article.id)}
                  >
                    {article.is_published ? (
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
                <FileText size={24} />
                {editingArticle ? 'Modifier l\'article' : 'Créer un nouvel article'}
              </h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={editingArticle ? updateArticle : createArticle}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>
                    <FileText size={16} />
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
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
                    {categories.map(cat => (
                      <option key={cat.category} value={cat.category}>{cat.category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <Users size={16} />
                    Niveau *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez un niveau</option>
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                  </select>
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
                    required
                    rows="3"
                  />
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
                    placeholder='["+25% de trafic", "1000 lectures"] ou texte simple'
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    <Tag size={16} />
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="tech, innovation, web"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Date de publication *
                  </label>
                  <input
                    type="date"
                    name="publish_date"
                    value={formData.publish_date}
                    onChange={handleInputChange}
                    required
                  />
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

                <div className="form-group full-width">
                  <label>
                    <FileText size={16} />
                    Contenu *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="8"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  <X size={16} />
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingArticle ? (
                    <>
                      <Edit size={16} />
                      Mettre à jour
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Créer l'article
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

export default ArticlesManager;