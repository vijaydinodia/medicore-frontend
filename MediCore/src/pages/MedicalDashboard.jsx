import { useEffect, useState } from "react";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalPharmacyRoundedIcon from "@mui/icons-material/LocalPharmacyRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import axiosInstance from "../api";

const emptyForm = {
  medicineName: "",
  medicineCode: "",
  category: "",
  manufacturer: "",
  stock: "",
  price: "",
  expiryDate: "",
  description: "",
  status: "active",
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const MedicalDashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [medicalStores, setMedicalStores] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [activeTab, setActiveTab] = useState("medicine");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(loadDashboard, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const medicineResponse = await axiosInstance.get("/medical/getAllMedicals?includeDeleted=true");
      const orderResponse = await axiosInstance.get("/medical/hospitalOrders");
      const storeResponse = await axiosInstance.get("/medical/getAllMedicalStores");

      setMedicines(medicineResponse.data.data || []);
      setOrders(orderResponse.data.data || []);
      setMedicalStores(storeResponse.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load medical dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const saveMedicine = async (event) => {
    event.preventDefault();

    if (!form.medicineName.trim() || !form.medicineCode.trim()) {
      setMessage("Medicine name and medicine code are required.");
      return;
    }

    const payload = {
      ...form,
      medicineName: form.medicineName.trim(),
      medicineCode: form.medicineCode.trim(),
      category: form.category.trim(),
      manufacturer: form.manufacturer.trim(),
      description: form.description.trim(),
      stock: Number(form.stock) || 0,
      price: Number(form.price) || 0,
    };

    try {
      setLoading(true);
      setMessage("");

      const response = editingId
        ? await axiosInstance.patch(`/medical/updateMedical/${editingId}`, payload)
        : await axiosInstance.post("/medical/createMedical", payload);

      setMessage(response.data.message || "Medicine saved successfully.");
      resetForm();
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save medicine.");
    } finally {
      setLoading(false);
    }
  };

  const editMedicine = (medicine) => {
    setEditingId(medicine._id);
    setForm({
      medicineName: medicine.medicineName || "",
      medicineCode: medicine.medicineCode || "",
      category: medicine.category || "",
      manufacturer: medicine.manufacturer || "",
      stock: medicine.stock ?? "",
      price: medicine.price ?? "",
      expiryDate: getDateInput(medicine.expiryDate),
      description: medicine.description || "",
      status: medicine.status || "active",
    });
  };

  const runMedicineAction = async (medicine, action) => {
    const question =
      action === "softDelete"
        ? "Move this medicine to deleted list?"
        : action === "restore"
        ? "Restore this medicine?"
        : "Permanently delete this medicine?";

    if (!window.confirm(question)) return;

    const url =
      action === "softDelete"
        ? `/medical/softDeleteMedical/${medicine._id}`
        : action === "restore"
        ? `/medical/restoreMedical/${medicine._id}`
        : `/medical/hardDeleteMedical/${medicine._id}`;

    try {
      setLoading(true);
      setMessage("");

      const response =
        action === "hardDelete"
          ? await axiosInstance.delete(url)
          : await axiosInstance.patch(url);

      setMessage(response.data.message || "Medicine updated successfully.");
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update medicine.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axiosInstance.patch(`/medical/updateOrderStatus/${orderId}`, {
        status,
      });

      setMessage(response.data.message || "Order updated successfully.");
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update order.");
    } finally {
      setLoading(false);
    }
  };

  const activeMedicines = medicines.filter((medicine) => !medicine.isDeleted);
  const totalCount = activeMedicines.length;
  const inStockCount = activeMedicines.filter((medicine) => Number(medicine.stock) > 0).length;
  const outOfStockCount = activeMedicines.filter((medicine) => Number(medicine.stock) <= 0).length;
  const expiryCount = activeMedicines.filter((medicine) => isExpiringSoon(medicine.expiryDate)).length;
  const orderCount = orders.length;

  const search = searchText.trim().toLowerCase();

  const visibleMedicines = medicines.filter((medicine) => {
    const stock = Number(medicine.stock) || 0;

    if (!search) return true;

    const values = [
      medicine.medicineName,
      medicine.medicineCode,
      medicine.category,
      medicine.manufacturer,
      medicine.medicalStoreId?.medicalName,
      medicine.hospitalId?.hospitalName,
    ];

    return values.some((value) => String(value || "").toLowerCase().includes(search));
  });

  const visibleOrders = orders.filter((order) => {
    if (!search) return true;

    const values = [
      order.medicalId?.medicineName,
      order.medicalId?.medicineCode,
      order.userId?.name,
      order.userId?.email,
      order.userId?.phone,
      order.status,
      order.medicalStoreId?.medicalName,
    ];

    return values.some((value) => String(value || "").toLowerCase().includes(search));
  });

  const medicalName = medicalStores[0]?.medicalName || "Medical counter";

  return (
    <main className="min-h-[calc(100svh-73px)] px-3 py-4 sm:px-6 lg:py-6">
      <div className="mx-auto max-w-7xl">
        <header className="medicore-gradient overflow-hidden p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-100 sm:text-sm">
                Medical dashboard
              </p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl lg:text-4xl">
                Medical Store Workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-teal-50">
                Manage medicines, live stock, expiry alerts, deleted items and user orders from one place.
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Logged medical</p>
              <p className="mt-1 text-lg font-black">{medicalName}</p>
            </div>
          </div>
        </header>

        {message && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            {message}
          </div>
        )}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total medicine" value={totalCount} icon={Inventory2RoundedIcon} />
          <StatCard title="In stock" value={inStockCount} icon={MedicationRoundedIcon} tone="success" />
          <StatCard title="Out of stock" value={outOfStockCount} icon={WarningAmberRoundedIcon} tone="warning" />
          <StatCard title="Expiry watch" value={expiryCount} icon={WarningAmberRoundedIcon} tone="danger" />
          <StatCard title="Orders" value={orderCount} icon={LocalPharmacyRoundedIcon} />
        </section>

        <section className="medicore-panel mt-5 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <TabButton active={activeTab === "medicine"} onClick={() => setActiveTab("medicine")}>
              Add Medicine
            </TabButton>
            <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")}>
              Orders
            </TabButton>
          </div>
        </section>

        {activeTab === "medicine" && (
        <section className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-24 xl:max-h-[calc(100svh-110px)] xl:overflow-y-auto xl:pr-1">
            <div className="space-y-4">
              <form onSubmit={saveMedicine} className="medicore-panel p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
                    <AddCircleRoundedIcon className="!h-5 !w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">
                      {editingId ? "Update medicine" : "Add medicine"}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Stock changes update user ordering.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <Input label="Medicine name" name="medicineName" value={form.medicineName} onChange={handleInputChange} required />
                  <Input label="Medicine code" name="medicineCode" value={form.medicineCode} onChange={handleInputChange} required />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <Input label="Category" name="category" value={form.category} onChange={handleInputChange} />
                    <Input label="Manufacturer" name="manufacturer" value={form.manufacturer} onChange={handleInputChange} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={handleInputChange} />
                    <Input label="Price" name="price" type="number" min="0" value={form.price} onChange={handleInputChange} />
                  </div>

                  <Input label="Expiry date" name="expiryDate" type="date" value={form.expiryDate} onChange={handleInputChange} />

                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Description
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      className="medicore-input mt-2 min-h-24 w-full resize-y rounded-lg px-3 py-2 text-sm"
                      placeholder="Short notes about this medicine"
                    />
                  </label>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button type="submit" disabled={loading} className="medicore-button-primary h-11 rounded-lg px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? "Saving..." : editingId ? "Update medicine" : "Add medicine"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="medicore-panel h-11 rounded-lg px-4 text-sm font-black text-slate-700 transition hover:text-teal-800 dark:text-slate-200 dark:hover:text-teal-200">
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="medicore-panel p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <label className="relative block">
                  <SearchRoundedIcon className="!absolute !left-3 !top-1/2 !h-5 !w-5 !-translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search medicine name, code, category, manufacturer..."
                    className="medicore-input h-11 w-full rounded-lg pl-10 pr-3 text-sm"
                  />
                </label>
                <button type="button" onClick={loadDashboard} className="medicore-panel inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black text-slate-700 transition hover:text-teal-800 dark:text-slate-200 dark:hover:text-teal-200">
                  <AutorenewRoundedIcon className="!h-4 !w-4" aria-hidden="true" />
                  Refresh
                </button>
              </div>

            </div>

              <div className="mt-4 grid gap-3">
                {visibleMedicines.map((medicine) => (
                  <MedicineCard
                    key={medicine._id}
                    medicine={medicine}
                    onEdit={() => editMedicine(medicine)}
                    onSoftDelete={() => runMedicineAction(medicine, "softDelete")}
                    onRestore={() => runMedicineAction(medicine, "restore")}
                    onHardDelete={() => runMedicineAction(medicine, "hardDelete")}
                  />
                ))}

                {!loading && visibleMedicines.length === 0 && (
                  <Empty message={searchText ? "No medicine matches your search." : "No medicine added yet."} />
                )}
              </div>
          </section>
        </section>
        )}

        {activeTab === "orders" && (
          <section className="mt-5 min-w-0">
            <div className="medicore-panel p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <label className="relative block">
                  <SearchRoundedIcon className="!absolute !left-3 !top-1/2 !h-5 !w-5 !-translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search patient, medicine, order status..."
                    className="medicore-input h-11 w-full rounded-lg pl-10 pr-3 text-sm"
                  />
                </label>
                <button type="button" onClick={loadDashboard} className="medicore-panel inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black text-slate-700 transition hover:text-teal-800 dark:text-slate-200 dark:hover:text-teal-200">
                  <AutorenewRoundedIcon className="!h-4 !w-4" aria-hidden="true" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
                {visibleOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onStatusChange={(status) => updateOrderStatus(order._id, status)}
                  />
                ))}

                {!loading && visibleOrders.length === 0 && (
                  <Empty message={searchText ? "No order matches your search." : "No user orders yet."} />
                )}
              </div>
          </section>
        )}
      </div>
    </main>
  );
};

const MedicineCard = ({ medicine, onEdit, onSoftDelete, onRestore, onHardDelete }) => {
  const stock = Number(medicine.stock) || 0;
  const expiryText = getDateInput(medicine.expiryDate) || "No expiry";
  const deleted = medicine.isDeleted;
  const expiringSoon = isExpiringSoon(medicine.expiryDate);

  return (
    <article className="medicore-card p-4 transition hover:border-teal-200 hover:shadow-md dark:hover:border-teal-900 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black text-slate-950 dark:text-white">
              {medicine.medicineName || "Medicine"}
            </h3>
            {deleted ? (
              <Pill tone="danger">Deleted</Pill>
            ) : stock > 0 ? (
              <Pill tone="success">In stock</Pill>
            ) : (
              <Pill tone="warning">Out of stock</Pill>
            )}
            {expiringSoon && <Pill tone="warning">Expiry watch</Pill>}
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {medicine.medicineCode || "No code"} | {medicine.category || "General"} | {medicine.manufacturer || "Manufacturer not listed"}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniInfo label="Stock" value={stock} />
            <MiniInfo label="Price" value={money.format(medicine.price || 0)} />
            <MiniInfo label="Expiry" value={expiryText} />
          </div>

          {medicine.description && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{medicine.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {!deleted && <IconButton icon={EditRoundedIcon} label="Edit medicine" onClick={onEdit} />}
          {!deleted && <IconButton icon={ArchiveRoundedIcon} label="Soft delete medicine" tone="warning" onClick={onSoftDelete} />}
          {deleted && <IconButton icon={AutorenewRoundedIcon} label="Restore medicine" tone="success" onClick={onRestore} />}
          <IconButton icon={DeleteRoundedIcon} label="Delete medicine permanently" tone="danger" onClick={onHardDelete} />
        </div>
      </div>
    </article>
  );
};

const OrderCard = ({ order, onStatusChange }) => (
  <article className="medicore-card p-4 sm:p-5">
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">
            {order.medicalId?.medicineName || "Medicine"}
          </h3>
          <Pill tone={order.status === "completed" ? "success" : order.status === "cancelled" ? "danger" : "warning"}>
            {order.status}
          </Pill>
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {order.userId?.name || "User"} | {order.userId?.email || "No email"}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniInfo label="Quantity" value={order.quantity || 0} />
          <MiniInfo label="Total" value={money.format(order.totalAmount || 0)} />
          <MiniInfo label="Phone" value={order.userId?.phone || "-"} />
        </div>
      </div>

      <select
        value={order.status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="medicore-input h-11 rounded-lg px-3 text-sm font-black"
      >
        <option value="placed">Placed</option>
        <option value="ready">Ready</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <div className="mt-4 grid gap-2 sm:grid-cols-4">
      {["placed", "ready", "completed", "cancelled"].map((step) => (
        <div key={step} className={stepClass(order.status, step)}>
          {step}
        </div>
      ))}
    </div>
  </article>
);

const StatCard = ({ title, value, icon: Icon, tone = "neutral" }) => {
  const colors = {
    neutral: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
  };

  return (
    <div className="medicore-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${colors[tone]}`}>
          <Icon className="!h-5 !w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
    {label}
    <input
      {...props}
      className="medicore-input mt-2 h-11 w-full rounded-lg px-3 text-sm"
    />
  </label>
);

const MiniInfo = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white">{value}</p>
  </div>
);

const Pill = ({ children, tone = "neutral" }) => {
  const tones = {
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    danger: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    neutral: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${tones[tone]}`}>{children}</span>;
};

const IconButton = ({ icon: Icon, label, tone = "neutral", ...props }) => {
  const colors = {
    neutral: "medicore-panel text-slate-700 hover:text-teal-800 dark:text-slate-200 dark:hover:text-teal-200",
    warning: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
    danger: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  };

  return (
    <button type="button" aria-label={label} title={label} className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${colors[tone]}`} {...props}>
      <Icon className="!h-4 !w-4" aria-hidden="true" />
    </button>
  );
};

const TabButton = ({ active, children, ...props }) => (
  <button
    type="button"
    className={`inline-flex h-10 shrink-0 items-center rounded-xl px-4 text-sm font-black transition ${
      active
        ? "medicore-button-primary"
        : "medicore-panel text-slate-700 hover:text-teal-800 dark:text-slate-200 dark:hover:text-teal-200"
    }`}
    {...props}
  >
    {children}
  </button>
);

const Empty = ({ message }) => (
  <div className="medicore-panel border-dashed p-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
    {message}
  </div>
);

const stepClass = (currentStatus, step) => {
  if (currentStatus === step) {
    return "rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-xs font-black uppercase text-teal-800 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-100";
  }

  return "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400";
};

const getDateInput = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const isExpiringSoon = (dateValue) => {
  if (!dateValue) return false;

  const expiryTime = new Date(dateValue).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ninetyDaysFromToday = today.getTime() + 90 * 24 * 60 * 60 * 1000;
  return expiryTime <= ninetyDaysFromToday;
};

export default MedicalDashboard;
