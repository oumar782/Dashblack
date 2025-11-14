import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, Clock, User, 
  Calendar, BookOpen, X, Save, Loader, AlertCircle, 
  CheckCircle, FileText, Tag, RefreshCw
} from 'lucide-react';

const ApexBlogInterface = () => {
  // États
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [viewingPost, setViewingPost] = useState(null);
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    author_name: '',
    read_time: '',
    is_published: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // URL de base de l'API
  const API_URL = 'https://backblack.vercel.app/api/apex';

  // Charger les articles au montage du composant
  useEffect(() => {
    fetchPosts();
  }, []);

  // Extraire les catégories uniques des articles
  useEffect(() => {
    if (posts.length > 0) {
      const uniqueCategories = [...new Set(posts.map(post => post.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [posts]);

  // Filtrer les articles en fonction de la recherche et de la catégorie
  useEffect(() => {
    let filtered = posts;
    
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedCategory]);

  // Récupérer tous les articles
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        queryParams.append('category', selectedCategory);
      }
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      const url = queryParams.toString() 
        ? `${API_URL}?${queryParams.toString()}`
        : API_URL;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPosts(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du chargement des articles:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouvel article
  const createPost = async (postData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const newPost = await response.json();
      
      // Ajouter le nouveau post à la liste
      setPosts(prev => [newPost, ...prev]);
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        author_name: '',
        read_time: '',
        is_published: true
      });
      
      // Fermer le modal et afficher un message de succès
      setShowModal(false);
      setSuccessMessage('Article créé avec succès!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
      return newPost;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la création de l\'article:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Mettre à jour un article
  const updatePost = async (id, postData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // S'assurer que is_published est défini
      const dataToSend = {
        ...postData,
        is_published: postData.is_published !== false
      };
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const updatedPost = await response.json();
      
      // Mettre à jour la liste des articles
      setPosts(prev => prev.map(post => 
        post.id === id ? updatedPost : post
      ));
      
      // Fermer le modal et afficher un message de succès
      setShowModal(false);
      setEditingPost(null);
      setSuccessMessage('Article modifié avec succès!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
      return updatedPost;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la modification de l\'article:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un article
  const deletePost = async (id) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      // Supprimer l'article de la liste
      setPosts(prev => prev.filter(post => post.id !== id));
      
      setDeleteConfirm(null);
      setSuccessMessage('Article supprimé avec succès!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la suppression de l\'article:', err);
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur pour ce champ s'il y en a une
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Le titre est requis';
    if (!formData.content.trim()) errors.content = 'Le contenu est requis';
    if (!formData.excerpt.trim()) errors.excerpt = 'L\'extrait est requis';
    if (!formData.category.trim()) errors.category = 'La catégorie est requise';
    if (!formData.author_name.trim()) errors.author_name = 'Le nom de l\'auteur est requis';
    if (!formData.read_time || formData.read_time <= 0) errors.read_time = 'Le temps de lecture doit être positif';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (editingPost) {
        updatePost(editingPost.id, formData);
      } else {
        createPost(formData);
      }
    }
  };

  // Ouvrir le modal pour créer un nouvel article
  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      author_name: '',
      read_time: '',
      is_published: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier un article
  const openEditModal = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      category: post.category || '',
      author_name: post.author_name || '',
      read_time: post.read_time || '',
      is_published: post.is_published !== false
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Voir un article
  const handleViewPost = async (post) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${post.id}`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const postDetails = await response.json();
      setViewingPost(postDetails);
    } catch (err) {
      setError('Erreur lors du chargement de l\'article');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Confirmer la suppression
  const confirmDelete = (post) => {
    setDeleteConfirm(post);
  };

  // Annuler la suppression
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non publié';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch {
      return 'Date invalide';
    }
  };

  // Rendu du composant
  return (
    <div className="apex-interface">
      {/* En-tête */}
      <header className="apex-header">
        <div className="header-left">
          <h1>
            <FileText size={32} />
            Apex Blog
          </h1>
          <p>Gérez et consultez tous vos articles de blog</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchPosts} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spinner' : ''} />
            Actualiser
          </button>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            Nouvel Article
          </button>
        </div>
      </header>

      {/* Barre de filtres */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={18} />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="select-arrow">▼</div>
        </div>
        
        <button className="btn-secondary" onClick={resetFilters}>
          Réinitialiser
        </button>
        
        <div className="stats">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} trouvé(s)
        </div>
      </div>

      {/* Messages de feedback */}
      {successMessage && (
        <div className="success-message">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Contenu principal */}
      <main>
        {loading ? (
          <div className="loading">
            <Loader size={32} className="spinner" />
            <p>Chargement des articles...</p>
          </div>
        ) : (
          <>
            {filteredPosts.length === 0 ? (
              <div className="empty-state">
                <FileText size={64} />
                <h3>Aucun article trouvé</h3>
                <p>
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Essayez de modifier vos critères de recherche' 
                    : 'Commencez par créer votre premier article'}
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <button className="btn-primary" onClick={openCreateModal}>
                    <Plus size={18} />
                    Créer un article
                  </button>
                )}
              </div>
            ) : (
              <div className="posts-grid">
                {filteredPosts.map(post => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="post-category">
                        <Tag size={14} />
                        {post.category || 'Non catégorisé'}
                      </div>
                      <div className="post-actions">
                        <button 
                          className="btn-icon" 
                          title="Voir l'article"
                          onClick={() => handleViewPost(post)}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Modifier l'article"
                          onClick={() => openEditModal(post)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon danger" 
                          title="Supprimer l'article"
                          onClick={() => confirmDelete(post)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="post-content">
                      <h3 className="post-title">{post.title || 'Sans titre'}</h3>
                      <p className="post-excerpt">{post.excerpt || 'Aucun extrait'}</p>
                    </div>
                    
                    <div className="post-meta">
                      <div className="meta-item">
                        <User size={14} />
                        {post.author_name || 'Auteur inconnu'}
                      </div>
                      <div className="meta-item">
                        <Clock size={14} />
                        {post.read_time || '?'} min
                      </div>
                      <div className="meta-item">
                        <Calendar size={14} />
                        {formatDate(post.published_at || post.created_at)}
                      </div>
                    </div>
                    
                    <div className="post-footer">
                      <div className={`status-badge ${post.is_published ? 'published' : 'draft'}`}>
                        {post.is_published ? 'Publié' : 'Brouillon'}
                      </div>
                      <button 
                        className="btn-view"
                        onClick={() => handleViewPost(post)}
                      >
                        <BookOpen size={14} />
                        Lire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de création/modification */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingPost ? 'Modifier l\'article' : 'Créer un nouvel article'}
              </h2>
              <button 
                className="btn-close" 
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">Titre *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Titre de l'article"
                    disabled={submitting}
                  />
                  {formErrors.title && <span className="field-error">{formErrors.title}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Catégorie *</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Catégorie"
                    disabled={submitting}
                  />
                  {formErrors.category && <span className="field-error">{formErrors.category}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="author_name">Auteur *</label>
                  <input
                    type="text"
                    id="author_name"
                    name="author_name"
                    value={formData.author_name}
                    onChange={handleInputChange}
                    placeholder="Nom de l'auteur"
                    disabled={submitting}
                  />
                  {formErrors.author_name && <span className="field-error">{formErrors.author_name}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="read_time">Temps de lecture (min) *</label>
                  <input
                    type="number"
                    id="read_time"
                    name="read_time"
                    value={formData.read_time}
                    onChange={handleInputChange}
                    placeholder="5"
                    min="1"
                    disabled={submitting}
                  />
                  {formErrors.read_time && <span className="field-error">{formErrors.read_time}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="is_published" className="checkbox-label">
                    <input
                      type="checkbox"
                      id="is_published"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    Publié
                  </label>
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="excerpt">Extrait *</label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Court résumé de l'article"
                    rows="3"
                    disabled={submitting}
                  />
                  {formErrors.excerpt && <span className="field-error">{formErrors.excerpt}</span>}
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="content">Contenu *</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Contenu complet de l'article"
                    rows="8"
                    disabled={submitting}
                  />
                  {formErrors.content && <span className="field-error">{formErrors.content}</span>}
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader size={18} className="spinner" />
                      En cours...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingPost ? 'Modifier' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation d'article */}
      {viewingPost && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h2>{viewingPost.title || 'Sans titre'}</h2>
              <button className="btn-close" onClick={() => setViewingPost(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="post-detail">
              <div className="post-meta-large">
                <div className="meta-item">
                  <User size={16} />
                  <span>{viewingPost.author_name || 'Auteur inconnu'}</span>
                </div>
                <div className="meta-item">
                  <Tag size={16} />
                  <span>{viewingPost.category || 'Non catégorisé'}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{viewingPost.read_time || '?'} min de lecture</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{formatDate(viewingPost.published_at || viewingPost.created_at)}</span>
                </div>
              </div>
              
              <div className="post-excerpt-large">
                {viewingPost.excerpt || 'Aucun extrait'}
              </div>
              
              <div className="post-content-large">
                {viewingPost.content || 'Aucun contenu'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
            </div>
            
            <div className="confirm-content">
              <AlertCircle size={48} className="warning-icon" />
              <p>Êtes-vous sûr de vouloir supprimer l'article <strong>"{deleteConfirm.title}"</strong> ?</p>
              <p className="warning-text">Cette action est irréversible.</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={cancelDelete}
              >
                Annuler
              </button>
              <button 
                className="btn-danger" 
                onClick={() => deletePost(deleteConfirm.id)}
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Styles globaux */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          background: #1a1a1a;
          color: white;
          margin-bottom: -3500px;

        }
        
        /* Interface Apex */
        .apex-interface {
          padding: 30px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          min-height: 100vh;
          color: white;
        }
        
        /* En-tête */
        .apex-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #333;
        }
        
        .header-left h1 {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 2rem;
          margin-bottom: 8px;
          background: linear-gradient(45deg, #fff, #e25822);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .header-left p {
          color: #888;
          font-size: 1rem;
        }
        
        .header-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        
        /* Boutons */
        .btn-primary {
          background: linear-gradient(45deg, #e25822, #f9a825);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(226, 88, 34, 0.3);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid #333;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .btn-secondary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-danger {
          background: linear-gradient(45deg, #ff6b6b, #ff4757);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        
        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
        }
        
        .btn-icon {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #333;
          border-radius: 6px;
          padding: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-icon:hover {
          background: rgba(226, 88, 34, 0.2);
          border-color: #e25822;
        }
        
        .btn-icon.danger:hover {
          background: rgba(255, 107, 107, 0.2);
          border-color: #ff6b6b;
        }
        
        .btn-view {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid #333;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
        }
        
        .btn-view:hover {
          background: rgba(226, 88, 34, 0.2);
          border-color: #e25822;
        }
        
        .btn-close {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 5px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        
        .btn-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        /* Barre de filtres */
        .filters-bar {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }
        
        .search-box svg {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
        }
        
        .search-box input {
          width: 100%;
          padding: 12px 20px 12px 45px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid #333;
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #e25822;
          background: rgba(255, 255, 255, 0.12);
        }
        
        .filter-group {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #888;
        }
        
        .filter-group select {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid #333;
          border-radius: 10px;
          padding: 12px 35px 12px 15px;
          color: white;
          cursor: pointer;
          appearance: none;
          min-width: 200px;
        }
        
        .select-arrow {
          position: absolute;
          right: 12px;
          pointer-events: none;
        }
        
        .stats {
          color: #888;
          font-size: 0.9rem;
          margin-left: auto;
        }
        
        /* Messages de feedback */
        .success-message {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }
        
        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 107, 107, 0.2);
          color: #ff6b6b;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }
        
        /* Grille d'articles */
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
        }
        
        .post-card {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
          border-radius: 15px;
          padding: 20px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .post-card:hover {
          transform: translateY(-5px);
          border-color: #e25822;
          box-shadow: 0 10px 25px rgba(226, 88, 34, 0.1);
        }
        
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        
        .post-category {
          background: rgba(226, 88, 34, 0.2);
          color: #e25822;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .post-actions {
          display: flex;
          gap: 5px;
        }
        
        .post-content {
          flex: 1;
          margin-bottom: 20px;
        }
        
        .post-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 10px;
          line-height: 1.4;
          color: white;
        }
        
        .post-excerpt {
          color: #ccc;
          font-size: 0.9rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .post-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
          padding-top: 15px;
          border-top: 1px solid #333;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #888;
          font-size: 0.8rem;
        }
        
        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .status-badge.published {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
        }
        
        .status-badge.draft {
          background: rgba(241, 196, 15, 0.2);
          color: #f1c40f;
        }
        
        /* États de chargement et erreur */
        .loading, .error {
          text-align: center;
          padding: 60px 20px;
          font-size: 1.1rem;
        }
        
        .error {
          color: #ff6b6b;
        }
        
        .loading {
          color: #e25822;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* État vide */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #888;
        }
        
        .empty-state svg {
          margin-bottom: 20px;
          opacity: 0.5;
        }
        
        .empty-state h3 {
          color: #ccc;
          margin-bottom: 10px;
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 20px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .large-modal {
          max-width: 800px;
        }
        
        .confirm-modal {
          max-width: 500px;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 1px solid #333;
        }
        
        .modal-header h2 {
          background: linear-gradient(45deg, #fff, #e25822);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .modal-form {
          padding: 30px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        
        .form-group label {
          margin-bottom: 8px;
          font-weight: 600;
          color: #ccc;
          font-size: 0.9rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-top: 25px;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
        }
        
        .form-group input,
        .form-group textarea {
          padding: 12px 15px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid #333;
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #e25822;
          background: rgba(255, 255, 255, 0.12);
        }
        
        .form-group input:disabled,
        .form-group textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .form-group textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }
        
        .field-error {
          color: #ff6b6b;
          font-size: 0.8rem;
          margin-top: 5px;
        }
        
        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #333;
        }
        
        /* Détail de l'article */
        .post-detail {
          padding: 30px;
        }
        
        .post-meta-large {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #333;
        }
        
        .post-meta-large .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }
        
        .post-excerpt-large {
          font-size: 1.1rem;
          color: #ccc;
          font-style: italic;
          margin-bottom: 25px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border-left: 4px solid #e25822;
        }
        
        .post-content-large {
          color: #e0e0e0;
          line-height: 1.7;
          white-space: pre-wrap;
        }
        
        /* Confirmation de suppression */
        .confirm-content {
          padding: 40px 30px;
          text-align: center;
        }
        
        .warning-icon {
          color: #ff6b6b;
          margin-bottom: 20px;
        }
        
        .warning-text {
          color: #ff6b6b;
          font-weight: 600;
          margin-top: 10px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .apex-interface {
            padding: 20px 15px;
          }
        
          .apex-header {
            flex-direction: column;
            gap: 20px;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        
          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }
        
          .search-box {
            min-width: auto;
          }
          
          .filter-group {
            width: 100%;
          }
          
          .filter-group select {
            width: 100%;
          }
          
          .stats {
            margin-left: 0;
            text-align: center;
          }
        
          .posts-grid {
            grid-template-columns: 1fr;
          }
        
          .form-grid {
            grid-template-columns: 1fr;
          }
        
          .modal-actions {
            flex-direction: column;
          }
          
          .post-meta-large {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ApexBlogInterface;