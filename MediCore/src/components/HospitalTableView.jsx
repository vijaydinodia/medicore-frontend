import { useState } from 'react';
import { useTableView } from '../custom_hook/UseTableView';

const HospitalTableView = ({ hospitals, onApprove, onReject, onToggleActive, onDelete, onRestore, onViewDetails }) => {
  const {
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
    isAllSelected,
    hasSelections,
    deleteSelectedItems,
    itemCount,
    selectedCount
  } = useTableView(hospitals);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort hospitals
  const sortedHospitals = [...hospitals].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleBulkApprove = () => {
    selectedItems.forEach(id => {
      const hospital = hospitals.find(h => h._id === id);
      if (hospital && hospital.status !== 'approved') {
        onApprove(id);
      }
    });
    deselectAllItems();
  };

  const handleBulkReject = () => {
    selectedItems.forEach(id => {
      const hospital = hospitals.find(h => h._id === id);
      if (hospital && hospital.status !== 'rejected') {
        onReject(id);
      }
    });
    deselectAllItems();
  };

  const handleBulkActivate = () => {
    selectedItems.forEach(id => {
      const hospital = hospitals.find(h => h._id === id);
      if (hospital && !hospital.isActive) {
        onToggleActive(id);
      }
    });
    deselectAllItems();
  };

  const handleBulkDeactivate = () => {
    selectedItems.forEach(id => {
      const hospital = hospitals.find(h => h._id === id);
      if (hospital && hospital.isActive) {
        onToggleActive(id);
      }
    });
    deselectAllItems();
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={isAllSelected ? deselectAllItems : selectAllItems}
                className="rounded border-slate-300 dark:border-slate-600"
              />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white"
              onClick={() => handleSort('hospitalName')}
            >
              Hospital Name {getSortIcon('hospitalName')}
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white"
              onClick={() => handleSort('hospitalType')}
            >
              Type {getSortIcon('hospitalType')}
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white"
              onClick={() => handleSort('status')}
            >
              Status {getSortIcon('status')}
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white"
              onClick={() => handleSort('isActive')}
            >
              Active {getSortIcon('isActive')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedHospitals.map((hospital) => (
            <tr key={hospital._id} className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(hospital._id)}
                  onChange={() => toggleItemSelection(hospital._id)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
              </td>
              <td className="px-4 py-3">
                {isEditing && editingItem?._id === hospital._id ? (
                  <input
                    type="text"
                    value={editingItem.hospitalName}
                    onChange={(e) => updateEditingItem('hospitalName', e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                ) : (
                  <span className="font-medium text-slate-900 dark:text-white">{hospital.hospitalName}</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{hospital.hospitalType}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  hospital.status === "approved"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    : hospital.status === "rejected"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                }`}>
                  {hospital.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  hospital.isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                }`}>
                  {hospital.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {isEditing && editingItem?._id === hospital._id ? (
                    <>
                      <button
                        onClick={() => saveEditing(editingItem)}
                        className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(hospital)}
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      {!hospital.isDeleted ? (
                        <>
                          {hospital.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onApprove(hospital._id)}
                                className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => onReject(hospital._id)}
                                className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onToggleActive(hospital._id)}
                            className={`rounded px-2 py-1 text-xs text-white ${
                              hospital.isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {hospital.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => onDelete(hospital._id)}
                            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onRestore(hospital._id)}
                          className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => onViewDetails(hospital)}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      >
                        View
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedHospitals.map((hospital) => (
        <div
          key={hospital._id}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="mb-3 flex items-start justify-between">
            <input
              type="checkbox"
              checked={selectedItems.includes(hospital._id)}
              onChange={() => toggleItemSelection(hospital._id)}
              className="mt-1 rounded border-slate-300 dark:border-slate-600"
            />
            <div className="flex flex-wrap gap-1">
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                hospital.status === "approved"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  : hospital.status === "rejected"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              }`}>
                {hospital.status}
              </span>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                hospital.isActive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              }`}>
                {hospital.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {isEditing && editingItem?._id === hospital._id ? (
              <input
                type="text"
                value={editingItem.hospitalName}
                onChange={(e) => updateEditingItem('hospitalName', e.target.value)}
                className="w-full rounded border border-slate-300 px-2 py-1 text-lg font-bold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            ) : (
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{hospital.hospitalName}</h3>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold">Type:</span> {hospital.hospitalType}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold">Email:</span> {hospital.email}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {isEditing && editingItem?._id === hospital._id ? (
              <>
                <button
                  onClick={() => saveEditing(editingItem)}
                  className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditing}
                  className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => startEditing(hospital)}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  Edit
                </button>
                {!hospital.isDeleted ? (
                  <>
                    {hospital.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(hospital._id)}
                          className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(hospital._id)}
                          className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onToggleActive(hospital._id)}
                      className={`rounded px-3 py-1 text-sm text-white ${
                        hospital.isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {hospital.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => onDelete(hospital._id)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onRestore(hospital._id)}
                    className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
                  >
                    Restore
                  </button>
                )}
                <button
                  onClick={() => onViewDetails(hospital)}
                  className="rounded border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  View Details
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* View Toggle and Bulk Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={toggleViewMode}
              className={`rounded px-3 py-1 text-sm font-medium transition ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Table View
            </button>
            <button
              onClick={toggleViewMode}
              className={`rounded px-3 py-1 text-sm font-medium transition ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Card View
            </button>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {itemCount} hospitals
          </span>
        </div>

        {hasSelections && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {selectedCount} selected
            </span>
            <button
              onClick={deselectAllItems}
              className="rounded border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              Deselect All
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
              >
                Bulk Approve
              </button>
              <button
                onClick={handleBulkReject}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Bulk Reject
              </button>
              <button
                onClick={handleBulkActivate}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
              >
                Bulk Activate
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700"
              >
                Bulk Deactivate
              </button>
              <button
                onClick={deleteSelectedItems}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Bulk Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'table' ? renderTableView() : renderCardView()}
    </div>
  );
};

export default HospitalTableView;