import { useState, useCallback } from 'react';

export const useTableView = (initialData = []) => {
  // View mode: 'table' or 'card'
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('viewMode');
    return saved || 'table';
  });

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Table data
  const [tableData, setTableData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);

  // Toggle between table and card view
  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'table' ? 'card' : 'table';
    setViewMode(newMode);
    localStorage.setItem('viewMode', newMode);
  }, [viewMode]);

  // Start editing an item
  const startEditing = useCallback((item) => {
    setIsEditing(true);
    setEditingItem(item);
    setOriginalData([...tableData]);
  }, [tableData]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditingItem(null);
    setTableData([...originalData]);
  }, [originalData]);

  // Save edited item
  const saveEditing = useCallback((updatedItem) => {
    setTableData(prevData =>
      prevData.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    setIsEditing(false);
    setEditingItem(null);
  }, []);

  // Update item in editing
  const updateEditingItem = useCallback((field, value) => {
    setEditingItem(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Select/deselect items
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Select all items
  const selectAllItems = useCallback(() => {
    setSelectedItems(tableData.map(item => item.id));
  }, [tableData]);

  // Deselect all items
  const deselectAllItems = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Delete selected items
  const deleteSelectedItems = useCallback(() => {
    setTableData(prevData =>
      prevData.filter(item => !selectedItems.includes(item.id))
    );
    setSelectedItems([]);
  }, [selectedItems]);

  // Add new item
  const addItem = useCallback((newItem) => {
    const itemWithId = {
      ...newItem,
      id: Date.now().toString() // Simple ID generation
    };
    setTableData(prevData => [...prevData, itemWithId]);
  }, []);

  // Update existing item
  const updateItem = useCallback((updatedItem) => {
    setTableData(prevData =>
      prevData.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  }, []);

  // Delete item
  const deleteItem = useCallback((itemId) => {
    setTableData(prevData =>
      prevData.filter(item => item.id !== itemId)
    );
  }, []);

  // Bulk update selected items
  const bulkUpdateItems = useCallback((updates) => {
    setTableData(prevData =>
      prevData.map(item =>
        selectedItems.includes(item.id)
          ? { ...item, ...updates }
          : item
      )
    );
  }, [selectedItems]);

  return {
    // View mode
    viewMode,
    toggleViewMode,

    // Editing state
    isEditing,
    editingItem,
    startEditing,
    cancelEditing,
    saveEditing,
    updateEditingItem,

    // Selection
    selectedItems,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    isAllSelected: selectedItems.length === tableData.length && tableData.length > 0,
    hasSelections: selectedItems.length > 0,

    // Data management
    tableData,
    setTableData,
    addItem,
    updateItem,
    deleteItem,
    deleteSelectedItems,
    bulkUpdateItems,

    // Utilities
    itemCount: tableData.length,
    selectedCount: selectedItems.length
  };
};