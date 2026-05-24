import { useState } from "react";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { UseTableView } from "../custom_hook/UseTableView";
import SearchInput from "./SearchInput";

const icons = {
  approve: CheckCircleRoundedIcon,
  reject: CancelRoundedIcon,
  edit: EditRoundedIcon,
  save: SaveRoundedIcon,
  close: CloseRoundedIcon,
  power: PowerSettingsNewRoundedIcon,
  trash: DeleteRoundedIcon,
  restore: RestoreRoundedIcon,
  eye: VisibilityRoundedIcon,
  table: TableRowsRoundedIcon,
  card: GridViewRoundedIcon,
  deselect: RemoveRoundedIcon,
  sort: UnfoldMoreRoundedIcon,
  block: BlockRoundedIcon,
};

const Icon = ({ name, className = "h-4 w-4" }) => (
  icons[name] ? (() => {
    const Component = icons[name];
    return <Component className={className} aria-hidden="true" />;
  })() : null
);

const IconButton = ({ label, icon, tone = "neutral", className = "", ...props }) => {
  const tones = {
    primary: "border-teal-700 bg-teal-700 text-white shadow-sm shadow-teal-900/10 hover:bg-teal-800 dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400",
    success: "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700",
    danger: "border-rose-600 bg-rose-600 text-white shadow-sm shadow-rose-900/10 hover:bg-rose-700",
    warning: "border-amber-500 bg-amber-500 text-slate-950 shadow-sm shadow-amber-900/10 hover:bg-amber-400",
    neutral: "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:focus:ring-teal-950 ${tones[tone]} ${className}`}
      {...props}
    >
      <Icon name={icon} />
      <span className="sr-only">{label}</span>
    </button>
  );
};

const StatusBadge = ({ children, tone }) => {
  const tones = {
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    rejected: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    active: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-200",
    inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${tones[tone] || tones.inactive}`}>{children}</span>;
};

const getHospitalImage = (hospital) => hospital.logo || hospital.images?.find((image) => image?.url)?.url || "";

const HospitalTableView = ({
  hospitals,
  onApprove,
  onReject,
  onToggleActive,
  onDelete,
  onRestore,
  onViewDetails,
  externalSearchTerm,
  hideSearch = false,
  allowEdit = true,
}) => {
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
    selectedCount,
  } = UseTableView(hospitals);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");

  const activeSearchTerm = externalSearchTerm ?? searchTerm;

  const filteredHospitals = hospitals.filter((hospital) => {
    const query = activeSearchTerm.trim().toLowerCase();
    if (!query) return true;

    return [
      hospital.hospitalName,
      hospital.hospitalCode,
      hospital.hospitalType,
      hospital.email,
      hospital.phone,
      hospital.status,
      hospital.isActive ? "active" : "inactive",
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleBulkApprove = () => {
    selectedItems.forEach((id) => {
      const hospital = hospitals.find((item) => item._id === id);
      if (hospital && hospital.status !== "approved") onApprove(id);
    });
    deselectAllItems();
  };

  const handleBulkReject = () => {
    selectedItems.forEach((id) => {
      const hospital = hospitals.find((item) => item._id === id);
      if (hospital && hospital.status !== "rejected") onReject(id);
    });
    deselectAllItems();
  };

  const handleBulkActivate = () => {
    selectedItems.forEach((id) => {
      const hospital = hospitals.find((item) => item._id === id);
      if (hospital && !hospital.isActive) onToggleActive(id);
    });
    deselectAllItems();
  };

  const handleBulkDeactivate = () => {
    selectedItems.forEach((id) => {
      const hospital = hospitals.find((item) => item._id === id);
      if (hospital && hospital.isActive) onToggleActive(id);
    });
    deselectAllItems();
  };

  const SortHeader = ({ id, children }) => (
    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
      <button type="button" onClick={() => handleSort(id)} className="inline-flex items-center gap-2 rounded-md px-1 py-1 hover:text-teal-700 dark:hover:text-teal-300">
        <span>{children}</span>
        <Icon name="sort" className={`h-3.5 w-3.5 ${sortConfig.key === id ? "text-teal-700 dark:text-teal-300" : "text-slate-400"}`} />
      </button>
    </th>
  );

  const Actions = ({ hospital, compact = false }) => (
    <div className={`flex ${compact ? "flex-wrap" : "flex-nowrap"} gap-2`}>
      {isEditing && editingItem?._id === hospital._id ? (
        <>
          <IconButton label="Save" icon="save" tone="success" onClick={() => saveEditing(editingItem)} />
          <IconButton label="Cancel" icon="close" tone="neutral" onClick={cancelEditing} />
        </>
      ) : (
        <>
          {allowEdit && (
            <IconButton label="Edit hospital" icon="edit" tone="neutral" onClick={() => startEditing(hospital)} />
          )}
          {!hospital.isDeleted ? (
            <>
              {hospital.status === "pending" && (
                <>
                  <IconButton label="Approve hospital" icon="approve" tone="success" onClick={() => onApprove(hospital._id)} />
                  <IconButton label="Reject hospital" icon="reject" tone="danger" onClick={() => onReject(hospital._id)} />
                </>
              )}
          <IconButton label={hospital.isActive ? "Deactivate hospital" : "Restore hospital"} icon={hospital.isActive ? "block" : "restore"} tone={hospital.isActive ? "warning" : "success"} onClick={() => onToggleActive(hospital._id)} />
              <IconButton label="Delete hospital" icon="trash" tone="danger" onClick={() => onDelete(hospital._id)} />
            </>
          ) : (
            <IconButton label="Restore hospital" icon="restore" tone="success" onClick={() => onRestore(hospital._id)} />
          )}
          <IconButton label="View details" icon="eye" tone="primary" onClick={() => onViewDetails(hospital)} />
        </>
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[840px] border-collapse bg-white dark:bg-slate-950">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <th className="w-12 px-4 py-3 text-left">
              <input type="checkbox" checked={isAllSelected} onChange={isAllSelected ? deselectAllItems : selectAllItems} className="rounded border-slate-300 dark:border-slate-600" />
            </th>
            <SortHeader id="hospitalName">Hospital</SortHeader>
            <SortHeader id="hospitalType">Type</SortHeader>
            <SortHeader id="status">Status</SortHeader>
            <SortHeader id="isActive">Live</SortHeader>
            <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-200">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedHospitals.map((hospital) => (
            <tr key={hospital._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
              <td className="px-4 py-4">
                <input type="checkbox" checked={selectedItems.includes(hospital._id)} onChange={() => toggleItemSelection(hospital._id)} className="rounded border-slate-300 dark:border-slate-600" />
              </td>
              <td className="px-4 py-4">
                {isEditing && editingItem?._id === hospital._id ? (
                  <input type="text" value={editingItem.hospitalName} onChange={(e) => updateEditingItem("hospitalName", e.target.value)} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-teal-700 text-sm font-black text-white dark:bg-teal-500 dark:text-slate-950">
                      {getHospitalImage(hospital) ? (
                        <img src={getHospitalImage(hospital)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (hospital.hospitalName || "H").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950 dark:text-white">{hospital.hospitalName}</p>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{hospital.email}</p>
                    </div>
                  </div>
                )}
              </td>
              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{hospital.hospitalType || "-"}</td>
              <td className="px-4 py-4"><StatusBadge tone={hospital.status}>{hospital.status || "pending"}</StatusBadge></td>
              <td className="px-4 py-4"><StatusBadge tone={hospital.isActive ? "active" : "inactive"}>{hospital.isActive ? "Active" : "Inactive"}</StatusBadge></td>
              <td className="px-4 py-4"><Actions hospital={hospital} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sortedHospitals.map((hospital) => (
        <article key={hospital._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3">
            <input type="checkbox" checked={selectedItems.includes(hospital._id)} onChange={() => toggleItemSelection(hospital._id)} className="mt-1 rounded border-slate-300 dark:border-slate-600" />
            <div className="flex flex-wrap justify-end gap-1.5">
              <StatusBadge tone={hospital.status}>{hospital.status || "pending"}</StatusBadge>
              <StatusBadge tone={hospital.isActive ? "active" : "inactive"}>{hospital.isActive ? "Active" : "Inactive"}</StatusBadge>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {isEditing && editingItem?._id === hospital._id ? (
              <input type="text" value={editingItem.hospitalName} onChange={(e) => updateEditingItem("hospitalName", e.target.value)} className="h-11 w-full rounded-md border border-slate-300 px-3 text-base font-bold dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-teal-700 text-sm font-black text-white dark:bg-teal-500 dark:text-slate-950">
                  {getHospitalImage(hospital) ? (
                    <img src={getHospitalImage(hospital)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (hospital.hospitalName || "H").slice(0, 2).toUpperCase()
                  )}
                </div>
                <h3 className="min-w-0 truncate text-lg font-bold text-slate-950 dark:text-white">{hospital.hospitalName}</h3>
              </div>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-300">{hospital.hospitalType || "Hospital"}</p>
            <p className="break-all text-sm text-slate-500 dark:text-slate-400">{hospital.email || "No email"}</p>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Actions hospital={hospital} compact />
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
            <IconButton label="Table view" icon="table" tone={viewMode === "table" ? "primary" : "neutral"} onClick={viewMode === "card" ? toggleViewMode : undefined} className="h-8 w-8" />
            <IconButton label="Card view" icon="card" tone={viewMode === "card" ? "primary" : "neutral"} onClick={viewMode === "table" ? toggleViewMode : undefined} className="h-8 w-8" />
          </div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {filteredHospitals.length} of {itemCount} hospitals
          </span>
        </div>

        {!hideSearch && (
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search hospitals"
            className="w-full sm:max-w-xs"
          />
        )}

        {hasSelections && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
            <span className="px-2 text-sm font-bold text-slate-700 dark:text-slate-200">{selectedCount} selected</span>
            <IconButton label="Clear selection" icon="deselect" tone="neutral" onClick={deselectAllItems} />
            <IconButton label="Approve selected" icon="approve" tone="success" onClick={handleBulkApprove} />
            <IconButton label="Reject selected" icon="reject" tone="danger" onClick={handleBulkReject} />
            <IconButton label="Activate selected" icon="power" tone="success" onClick={handleBulkActivate} />
            <IconButton label="Deactivate selected" icon="block" tone="warning" onClick={handleBulkDeactivate} />
            <IconButton label="Delete selected" icon="trash" tone="danger" onClick={deleteSelectedItems} />
          </div>
        )}
      </div>

      {sortedHospitals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No hospitals match your search.
        </div>
      ) : viewMode === "table" ? renderTableView() : renderCardView()}
    </div>
  );
};

export default HospitalTableView;
