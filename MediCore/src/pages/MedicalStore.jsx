import { useEffect, useState } from "react";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import LocalPharmacyRoundedIcon from "@mui/icons-material/LocalPharmacyRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import axiosInstance from "../api";
import Pagination from "../components/Pagination";
import { UsePagination } from "../custom_hook/UsePagination";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const MedicalStore = () => {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchText, setSearchText] = useState("");
  const [activeView, setActiveView] = useState("medicines");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(loadMedicalStore, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadMedicalStore = async () => {
    try {
      setLoading(true);
      setMessage("");

      const medicineResponse = await axiosInstance.get("/medical/getAllMedicals");
      const orderResponse = await axiosInstance.get("/medical/myOrders");

      setMedicines(medicineResponse.data.data || []);
      setOrders(orderResponse.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load medicines.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (medicineId, value) => {
    setQuantities({ ...quantities, [medicineId]: value });
  };

  const buyMedicine = async (medicine) => {
    const quantity = Number(quantities[medicine._id] || 1);

    if (!quantity || quantity < 1) {
      setMessage("Quantity must be at least 1.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axiosInstance.post(`/medical/buyMedical/${medicine._id}`, {
        quantity,
      });

      setMessage(`${response.data.message}. Confirmation email has been sent.`);
      setActiveView("orders");
      await loadMedicalStore();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to place medicine order.");
    } finally {
      setLoading(false);
    }
  };

  const search = searchText.trim().toLowerCase();

  const visibleMedicines = medicines.filter((medicine) => {
    if (!search) return true;

    const values = [
      medicine.medicineName,
      medicine.medicineCode,
      medicine.category,
      medicine.manufacturer,
      medicine.hospitalId?.hospitalName,
      medicine.medicalStoreId?.medicalName,
    ];

    return values.some((value) => String(value || "").toLowerCase().includes(search));
  });

  const visibleOrders = orders.filter((order) => {
    if (!search) return true;

    const values = [
      order.medicalId?.medicineName,
      order.hospitalId?.hospitalName,
      order.medicalStoreId?.medicalName,
      order.status,
    ];

    return values.some((value) => String(value || "").toLowerCase().includes(search));
  });

  const medicinePagination = UsePagination(visibleMedicines, {
    pageSize: 9,
    resetKeys: [searchText, activeView],
  });
  const orderPagination = UsePagination(visibleOrders, {
    pageSize: 8,
    resetKeys: [searchText, activeView],
  });

  return (
    <main className="min-h-[calc(100svh-73px)] px-3 py-4 sm:px-6 lg:py-6">
      <div className="mx-auto max-w-7xl">
        <header className="medicore-gradient overflow-hidden p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-100 sm:text-sm">
                Medical store
              </p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl lg:text-4xl">
                Order Medicine
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-teal-50">
                Search medicines, check stock, place orders and follow the order status.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TopStat icon={Inventory2RoundedIcon} label="Available" value={medicines.length} />
              <TopStat icon={LocalPharmacyRoundedIcon} label="Orders" value={orders.length} />
            </div>
          </div>
        </header>

        {message && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            {message}
          </div>
        )}

        <section className="mt-5 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-24 xl:max-h-[calc(100svh-110px)] xl:overflow-y-auto xl:pr-1">
            <div className="medicore-panel p-4">
              <p className="text-sm font-black text-slate-950 dark:text-white">Medical menu</p>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Search and follow your medicine orders.
              </p>

              <label className="relative mt-4 block">
                <SearchRoundedIcon className="!absolute !left-3 !top-1/2 !h-5 !w-5 !-translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search medicine..."
                  className="medicore-input h-11 w-full rounded-lg pl-10 pr-3 text-sm"
                />
              </label>

              <div className="mt-4 grid gap-2">
                <MenuButton active={activeView === "medicines"} onClick={() => setActiveView("medicines")}>
                  Medicines
                </MenuButton>
                <MenuButton active={activeView === "orders"} onClick={() => setActiveView("orders")}>
                  Follow up orders
                </MenuButton>
              </div>

              <button type="button" onClick={loadMedicalStore} className="medicore-panel mt-4 h-11 w-full rounded-lg px-4 text-sm font-black text-slate-700 transition hover:text-teal-800 dark:text-slate-200 dark:hover:text-teal-200">
                Refresh
              </button>
            </div>
          </aside>

          <section className="min-w-0">
            {activeView === "medicines" && (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {medicinePagination.paginatedItems.map((medicine) => (
                  <MedicineCard
                    key={medicine._id}
                    medicine={medicine}
                    quantity={quantities[medicine._id] || 1}
                    onQuantityChange={(value) => updateQuantity(medicine._id, value)}
                    onBuy={() => buyMedicine(medicine)}
                  />
                ))}

                {!loading && visibleMedicines.length === 0 && (
                  <Empty message={searchText ? "No medicines match your search." : "No medicines available right now."} />
                )}
                <Pagination
                  className="sm:col-span-2 2xl:col-span-3"
                  currentPage={medicinePagination.currentPage}
                  endItem={medicinePagination.endItem}
                  onPageChange={medicinePagination.setCurrentPage}
                  startItem={medicinePagination.startItem}
                  totalItems={medicinePagination.totalItems}
                  totalPages={medicinePagination.totalPages}
                />
              </div>
            )}

            {activeView === "orders" && (
              <div className="grid gap-4">
                {orderPagination.paginatedItems.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}

                {!loading && visibleOrders.length === 0 && (
                  <Empty message={searchText ? "No orders match your search." : "No medicine orders yet."} />
                )}
                <Pagination
                  currentPage={orderPagination.currentPage}
                  endItem={orderPagination.endItem}
                  onPageChange={orderPagination.setCurrentPage}
                  startItem={orderPagination.startItem}
                  totalItems={orderPagination.totalItems}
                  totalPages={orderPagination.totalPages}
                />
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
};

const MedicineCard = ({ medicine, quantity, onQuantityChange, onBuy }) => {
  const stock = Number(medicine.stock) || 0;

  return (
    <article className="medicore-card overflow-hidden transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md dark:hover:border-teal-800">
      <div className="medicore-gradient border-0 p-5 text-white">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <MedicationRoundedIcon className="!h-5 !w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-teal-100">
              {medicine.category || "General medicine"}
            </p>
            <h2 className="mt-1 line-clamp-2 text-xl font-black">{medicine.medicineName || "Medicine"}</h2>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <Info icon={LocalHospitalRoundedIcon} label="Hospital" value={medicine.hospitalId?.hospitalName || "Hospital pharmacy"} />
          <Info icon={LocalPharmacyRoundedIcon} label="Medical" value={medicine.medicalStoreId?.medicalName || "Medical counter"} />
          <p><span className="font-bold text-slate-900 dark:text-white">Manufacturer:</span> {medicine.manufacturer || "Not listed"}</p>
          <p><span className="font-bold text-slate-900 dark:text-white">Price:</span> {money.format(medicine.price || 0)}</p>
          <p><span className="font-bold text-slate-900 dark:text-white">Available:</span> {stock}</p>
        </div>

        <div className="mt-5 grid grid-cols-[88px_1fr] gap-2">
          <input
            type="number"
            min="1"
            max={stock}
            value={quantity}
            onChange={(event) => onQuantityChange(event.target.value)}
            className="medicore-input h-11 rounded-lg px-3 text-sm"
            aria-label={`Quantity for ${medicine.medicineName}`}
          />
          <button type="button" disabled={!stock} onClick={onBuy} className="medicore-button-primary h-11 rounded-lg px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50">
            {stock ? "Place order" : "Out of stock"}
          </button>
        </div>
      </div>
    </article>
  );
};

const OrderCard = ({ order }) => (
  <article className="medicore-card p-5">
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
          {order.medicalStoreId?.medicalName || "Medical counter"}
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
          {order.medicalId?.medicineName || "Medicine"}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {order.hospitalId?.hospitalName || "Hospital"} | Qty: {order.quantity} | {money.format(order.totalAmount || 0)}
        </p>
      </div>
      <OrderStatus status={order.status} />
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

const TopStat = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
    <div className="flex items-center gap-3">
      <Icon className="!h-5 !w-5 text-teal-100" aria-hidden="true" />
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-teal-100">{label}</p>
        <p className="text-lg font-black text-white">{value}</p>
      </div>
    </div>
  </div>
);

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2">
    <Icon className="!h-4 !w-4 text-teal-700 dark:text-teal-300" aria-hidden="true" />
    <p><span className="font-bold text-slate-900 dark:text-white">{label}:</span> {value}</p>
  </div>
);

const MenuButton = ({ active, children, ...props }) => (
  <button type="button" className={`h-11 rounded-lg px-4 text-left text-sm font-black transition ${active ? "medicore-button-primary" : "medicore-panel text-slate-700 hover:text-teal-800 dark:text-slate-200 dark:hover:text-teal-200"}`} {...props}>
    {children}
  </button>
);

const OrderStatus = ({ status }) => {
  const color =
    status === "completed"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      : status === "cancelled"
      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";

  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${color}`}>{status}</span>;
};

const stepClass = (currentStatus, step) => {
  const active = currentStatus === step;
  return active
    ? "rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-xs font-black uppercase text-teal-800 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-100"
    : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400";
};

const Empty = ({ message }) => (
  <div className="medicore-panel border-dashed p-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 sm:col-span-2 2xl:col-span-3">
    {message}
  </div>
);

export default MedicalStore;
