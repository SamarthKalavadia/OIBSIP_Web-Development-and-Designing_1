import { useEffect, useState } from 'react';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../services/api';
import { toast } from 'react-toastify';
import './Inventory.css';

const categories = ['all', 'base', 'sauce', 'cheese', 'veggie', 'meat'];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'quantity', 'price'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  const [form, setForm] = useState({ 
    category: 'base', 
    name: '', 
    quantity: 100, 
    threshold: 20, 
    price: 0, 
    image: '🍕' 
  });

  const fetchItems = async () => {
    try {
      const { data } = await getInventory();
      setItems(data);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  // Filter, Search, Sort Logic
  const getProcessedItems = () => {
    let result = [...items];

    // Filter
    if (filter !== 'all') {
      result = result.filter(item => item.category === filter);
    }

    // Search
    if (search.trim() !== '') {
      const query = search.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  };

  const processedItems = getProcessedItems();

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Status computation based on threshold
  const getStockStatus = (quantity, threshold = 20) => {
    if (quantity === 0) return { label: 'Out Of Stock', class: 'out-of-stock', dot: '🔴' };
    if (quantity < threshold) return { label: 'Low Stock', class: 'low-stock', dot: '🟡' };
    return { label: 'In Stock', class: 'in-stock', dot: '🟢' };
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ category: 'base', name: '', quantity: 100, threshold: 20, price: 0, image: '🍕' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ 
      category: item.category, 
      name: item.name, 
      quantity: item.quantity, 
      threshold: item.threshold || 20, 
      price: item.price, 
      image: item.image 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateInventoryItem(editItem._id, form);
        toast.success('Item updated successfully');
      } else {
        await addInventoryItem(form);
        toast.success('Item added successfully');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;
    try {
      await deleteInventoryItem(id);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (err) {
      toast.error('Error deleting item');
    }
  };

  // Selection for bulk actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentItems.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Delete ${selectedItems.length} selected items?`)) return;
    
    try {
      setLoading(true);
      await Promise.all(selectedItems.map(id => deleteInventoryItem(id)));
      toast.success(`Successfully deleted ${selectedItems.length} items.`);
      setSelectedItems([]);
      fetchItems();
    } catch (err) {
      toast.error('Error deleting some items');
      fetchItems();
    }
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="loading-spinner">🍕</div>
        <p>Loading Inventory Ledger...</p>
      </div>
    );
  }

  return (
    <div className="inventory-console">
      {/* ━━━ TABLE CONTROLS & FILTER BAR ━━━ */}
      <section className="inventory-action-bar">
        {/* Category Tabs */}
        <div className="category-tabs-container">
          {categories.map(c => (
            <button 
              key={c} 
              className={`category-tab-btn ${filter === c ? 'active' : ''}`} 
              onClick={() => { setFilter(c); setCurrentPage(1); }}
            >
              {c === 'all' ? '🌐 All Items' : c.charAt(0).toUpperCase() + c.slice(1)}
              <span className="category-count">
                {c === 'all' ? items.length : items.filter(i => i.category === c).length}
              </span>
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="controls-row">
          <div className="search-and-filter">
            <div className="table-search">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            {selectedItems.length > 0 && (
              <div className="bulk-actions-bar">
                <span>{selectedItems.length} selected</span>
                <button className="bulk-delete-btn" onClick={handleBulkDelete}>
                  🗑️ Bulk Delete
                </button>
              </div>
            )}
          </div>

          <button className="add-ingredient-btn" onClick={openAdd}>
            ➕ Add New Ingredient
          </button>
        </div>
      </section>

      {/* ━━━ PROFESSIONAL SaaS TABLE ━━━ */}
      <section className="table-card-container">
        {processedItems.length === 0 ? (
          <div className="table-empty-state">
            <span>📦</span>
            <h3>No ingredients found</h3>
            <p>Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive-wrapper">
              <table className="saas-inventory-table">
                <thead>
                  <tr>
                    <th width="40">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                      />
                    </th>
                    <th onClick={() => toggleSort('name')} className="sortable-th">
                      Item Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th>Category</th>
                    <th onClick={() => toggleSort('quantity')} className="sortable-th text-center">
                      Stock {sortBy === 'quantity' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="text-center">Threshold</th>
                    <th>Status</th>
                    <th onClick={() => toggleSort('price')} className="sortable-th">
                      Price {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(item => {
                    const status = getStockStatus(item.quantity, item.threshold);
                    return (
                      <tr key={item._id} className={selectedItems.includes(item._id) ? 'row-selected' : ''}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                          />
                        </td>
                        <td>
                          <div className="item-name-cell">
                            <span className="item-emoji">{item.image}</span>
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span className={`category-tag cat-${item.category}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="text-center">
                          <strong className={`stock-level-num ${status.class}`}>
                            {item.quantity}
                          </strong>
                        </td>
                        <td className="text-center text-muted">
                          {item.threshold || 20}
                        </td>
                        <td>
                          <span className={`stock-status-badge ${status.class}`}>
                            <span className="badge-dot-indicator">{status.dot}</span>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <strong className="item-price-val">₹{item.price}</strong>
                        </td>
                        <td className="text-right table-actions-cell">
                          <button className="action-icon-btn edit-icon-btn" onClick={() => openEdit(item)} title="Edit Item">
                            ✏️
                          </button>
                          <button className="action-icon-btn delete-icon-btn" onClick={() => handleDelete(item._id)} title="Delete Item">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="table-pagination">
                <span className="pagination-info">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, processedItems.length)} of {processedItems.length} items
                </span>
                <div className="pagination-pages">
                  <button 
                    className="page-nav-btn" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ◀ Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button 
                      key={index + 1} 
                      className={`page-num-btn ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button 
                    className="page-nav-btn" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ━━━ DRAWER MODAL ━━━ */}
      {showModal && (
        <div className="inventory-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="inventory-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{editItem ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
              <button className="drawer-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="drawer-form">
              <div className="form-grid">
                {!editItem && (
                  <div className="drawer-form-group">
                    <label>Category</label>
                    <select 
                      value={form.category} 
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option value="base">Base Crust</option>
                      <option value="sauce">Pizza Sauce</option>
                      <option value="cheese">Cheese</option>
                      <option value="veggie">Veggies</option>
                      <option value="meat">Meats</option>
                    </select>
                  </div>
                )}
                
                <div className="drawer-form-group">
                  <label>Ingredient Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Buffalo Sauce" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                  />
                </div>

                <div className="drawer-form-group">
                  <label>Stock Quantity</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={form.quantity} 
                    onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 0})} 
                    required 
                  />
                </div>

                <div className="drawer-form-group">
                  <label>Low Stock Threshold Alert</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={form.threshold} 
                    onChange={e => setForm({...form, threshold: parseInt(e.target.value) || 0})} 
                    required 
                  />
                </div>

                <div className="drawer-form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={form.price} 
                    onChange={e => setForm({...form, price: parseInt(e.target.value) || 0})} 
                    required 
                  />
                </div>

                <div className="drawer-form-group">
                  <label>Emoji Icon representation</label>
                  <input 
                    type="text" 
                    value={form.image} 
                    onChange={e => setForm({...form, image: e.target.value})} 
                  />
                </div>
              </div>

              <div className="drawer-actions">
                <button type="submit" className="drawer-submit-btn">
                  {editItem ? '💾 Save Changes' : '➕ Add Ingredient'}
                </button>
                <button type="button" className="drawer-cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
