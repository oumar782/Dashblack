import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X,
  Clock,
  Eye,
  EyeOff,
  Tag,
  Type,
  Calendar,
  BookOpen
} from 'lucide-react';
import './lada.css';

const ArticlesLadaManager = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire d'article
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    read_time: '',
    publish_date: '',
    content: '',
    is_published: true
  });

  // Catégories prédéfinies
  const categories = ['technologie', 'santé', 'éducation', 'business', 'divertissement', 'sports', 'politique', 'culture'];

  // Charger les données initiales
  useEffect(() => {
    fetchArticles();
  }, []);

  // Filtrer les articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'all' || article.category === filters.category;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'published' && article.is_published) ||
                         (filters.status === 'draft' && !article.is_published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // API calls - Version robuste avec gestion d'erreur améliorée
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Essayer d'abord l'endpoint admin, puis l'endpoint public en cas d'erreur
      let response = await fetch('https://backblack.vercel.app/api/lada/admin');
      
      if (!response.ok) {
        console.log('Endpoint admin échoué, tentative avec endpoint public...');
        response = await fetch('https://backblack.vercel.app/api/lada/');
      }
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.data || []);
      } else {
        throw new Error(data.error || 'Erreur inconnue du serveur');
      }
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(`Impossible de charger les articles: ${err.message}`);
      // Initialiser avec des données vides pour éviter les erreurs
      setArticles([]);
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
      excerpt: '',
      category: '',
      read_time: '',
      publish_date: '',
      content: '',
      is_published: true
    });
    setEditingArticle(null);
  };

  const openModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title || '',
        excerpt: article.excerpt || '',
        category: article.category || '',
        read_time: article.read_time || '',
        publish_date: article.publish_date || '',
        content: article.content || '',
        is_published: article.is_published !== false
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

  // CRUD Operations avec gestion d'erreur améliorée
  const createArticle = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await fetch('https://backblack.vercel.app/api/lada/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchArticles();
        closeModal();
      } else {
        throw new Error(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError(`Erreur création: ${err.message}`);
    }
  };

  const updateArticle = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await fetch(`https://backblack.vercel.app/api/lada/id/${editingArticle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchArticles();
        closeModal();
      } else {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError(`Erreur mise à jour: ${err.message}`);
    }
  };

  const deleteArticle = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        setError(null);
        const response = await fetch(`https://backblack.vercel.app/api/lada/id/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        if (data.success) {
          await fetchArticles();
        } else {
          throw new Error(data.error || 'Erreur lors de la suppression');
        }
      } catch (err) {
        setError(`Erreur suppression: ${err.message}`);
      }
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      setError(null);
      const response = await fetch(`https://backblack.vercel.app/api/lada/id/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_published: !currentStatus }),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchArticles();
      } else {
        throw new Error(data.error || 'Erreur lors du changement de statut');
      }
    } catch (err) {
      setError(`Erreur publication: ${err.message}`);
    }
  };

  // Statistiques
  const stats = {
    total: articles.length,
    published: articles.filter(a => a.is_published).length,
    drafts: articles.filter(a => !a.is_published).length,
    categories: new Set(articles.map(a => a.category).filter(Boolean)).size
  };

  // Affichage conditionnel
  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      Chargement des articles...
    </div>
  );

  return (
    <div className="articles-lada-manager">
      {/* Header */}
      <header className="articles-lada-header">
        <div className="header-left">
          <h1>
            <FileText size={32} />
            Gestion des Articles Lada
          </h1>
          <p>Créez, modifiez et gérez vos articles</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Nouvel Article
        </button>
      </header>

      {/* Affichage des erreurs */}
      {error && (
        <div className="error-banner">
          <X size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn-close-small">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Articles totaux</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Eye size={24} />
          </div>
          <div className="stat-value">{stats.published}</div>
          <div className="stat-label">Articles publiés</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <EyeOff size={24} />
          </div>
          <div className="stat-value">{stats.drafts}</div>
          <div className="stat-label">Brouillons</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Tag size={24} />
          </div>
          <div className="stat-value">{stats.categories}</div>
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
            {categories.map(category => (
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
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>

        <div className="stats">
          {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} trouvé{filteredArticles.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grille d'articles */}
      <div className="articles-lada-grid">
        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={48} />
            </div>
            <h3>Aucun article trouvé</h3>
            <p>Essayez de modifier vos filtres ou créez un nouvel article</p>
          </div>
        ) : (
          filteredArticles.map(article => (
            <div key={article.id} className={`article-lada-card ${article.is_published ? 'published' : 'draft'}`}>
              <div className="article-lada-header">
                <div className="article-lada-category">
                  <Tag size={14} />
                  <span>{article.category || 'Non catégorisé'}</span>
                </div>
                <div className="article-lada-actions">
                  <button 
                    className={`btn-icon ${article.is_published ? 'active' : ''}`}
                    onClick={() => togglePublish(article.id, article.is_published)}
                    title={article.is_published ? "Dépublier" : "Publier"}
                  >
                    {article.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
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

              <div className="article-lada-content">
                <h3 className="article-lada-title">{article.title || 'Sans titre'}</h3>
                <p className="article-lada-excerpt">{article.excerpt || 'Aucun extrait'}</p>
              </div>

              <div className="article-lada-meta">
                <div className="meta-item">
                  <Clock size={14} />
                  <span>{article.read_time || 'Non spécifié'}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>{article.publish_date ? new Date(article.publish_date).toLocaleDateString() : 'Date inconnue'}</span>
                </div>
                <div className="meta-item">
                  <FileText size={14} />
                  <span>{(article.content?.length || 0)} caractères</span>
                </div>
              </div>

              <div className="article-lada-footer">
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
                <div className="article-lada-date">
                  ID: {article.id}
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
                    <Type size={16} />
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="ex: Les dernières innovations technologiques"
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
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <Clock size={16} />
                    Temps de lecture *
                  </label>
                  <input
                    type="text"
                    name="read_time"
                    value={formData.read_time}
                    onChange={handleInputChange}
                    placeholder="ex: 5 min"
                    required
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

                <div className="form-group full-width">
                  <label>
                    <FileText size={16} />
                    Extrait *
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Entrez un court extrait de l'article..."
                    required
                    rows="3"
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
                    placeholder="Entrez le contenu complet de l'article..."
                    required
                    rows="8"
                  />
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
                    Article publié
                  </label>
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

export default ArticlesLadaManager;