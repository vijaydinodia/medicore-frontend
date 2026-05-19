import { useState } from "react";

export const useTableView = (initialData = []) => {
  const savedViewMode = localStorage.getItem("viewMode") || "table";

  const [viewMode, setViewMode] = useState(savedViewMode);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [tableData, setTableData] = useState(initialData);
  const [oldData, setOldData] = useState(initialData);

  const toggleViewMode = () => {
    let nextMode = "table";

    if (viewMode === "table") {
      nextMode = "card";
    }

    setViewMode(nextMode);
    localStorage.setItem("viewMode", nextMode);
  };

  const startEditing = (item) => {
    setOldData(tableData);
    setEditingItem(item);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTableData(oldData);
    setEditingItem(null);
    setIsEditing(false);
  };

  const saveEditing = (updatedItem) => {
    const updatedData = tableData.map((item) => {
      if (item.id === updatedItem.id || item._id === updatedItem._id) {
        return updatedItem;
      }

      return item;
    });

    setTableData(updatedData);
    setEditingItem(null);
    setIsEditing(false);
  };

  const updateEditingItem = (field, value) => {
    setEditingItem({
      ...editingItem,
      [field]: value,
    });
  };

  const toggleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const selectAllItems = () => {
    setSelectedItems(tableData.map((item) => item.id || item._id));
  };

  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  const deleteSelectedItems = () => {
    const filteredData = tableData.filter((item) => {
      const id = item.id || item._id;
      return !selectedItems.includes(id);
    });

    setTableData(filteredData);
    setSelectedItems([]);
  };

  const addItem = (newItem) => {
    const item = {
      ...newItem,
      id: Date.now().toString(),
    };

    setTableData([...tableData, item]);
  };

  const updateItem = (updatedItem) => {
    const updatedData = tableData.map((item) => {
      if (item.id === updatedItem.id || item._id === updatedItem._id) {
        return updatedItem;
      }

      return item;
    });

    setTableData(updatedData);
  };

  const deleteItem = (itemId) => {
    setTableData(tableData.filter((item) => (item.id || item._id) !== itemId));
  };

  const bulkUpdateItems = (updates) => {
    const updatedData = tableData.map((item) => {
      const id = item.id || item._id;

      if (selectedItems.includes(id)) {
        return { ...item, ...updates };
      }

      return item;
    });

    setTableData(updatedData);
  };

  return {
    viewMode,
    toggleViewMode,
    isEditing,
    editingItem,
    startEditing,
    cancelEditing,
    saveEditing,
    updateEditingItem,
    selectedItems,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    isAllSelected: selectedItems.length === tableData.length && tableData.length > 0,
    hasSelections: selectedItems.length > 0,
    tableData,
    setTableData,
    addItem,
    updateItem,
    deleteItem,
    deleteSelectedItems,
    bulkUpdateItems,
    itemCount: tableData.length,
    selectedCount: selectedItems.length,
  };
};
