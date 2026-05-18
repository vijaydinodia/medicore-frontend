import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";

const hospitalTypes = ["Government", "Private", "Trust"];
let documentRowId = 0;
const createDocumentRow = () => ({
  id: `document-${documentRowId++}`,
  name: "",
  file: null,
});

const getApiErrorMessage = (error) => {
  const data = error.response?.data;
  if (typeof data === "string") return data;
  return data?.error || data?.message || error.message || "Could not submit hospital.";
};

const AddHospital = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hospitalName: "",
    hospitalCode: "",
    hospitalType: "Government",
    email: "",
    phone: "",
    alternatePhone: "",
    website: "",
    registrationNumber: "",
    establishedYear: "",
    stateId: "",
    districtId: "",
    cityId: "",
    address: "",
    pincode: "",
    totalBeds: "",
    availableBeds: "",
    totalDoctors: "",
    totalStaff: "",
    emergencyAvailable: false,
    ambulanceAvailable: false,
    ICUAvailable: false,
    bloodBankAvailable: false,
    pharmacyAvailable: false,
    description: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [hospitalImages, setHospitalImages] = useState([]);
  const [hospitalDocuments, setHospitalDocuments] = useState([createDocumentRow()]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const response = await axiosInstance.get("/location/state/getAll");
        setStates(response.data.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    if (!form.stateId) {
      setDistricts([]);
      setCities([]);
      setForm((prev) => ({ ...prev, districtId: "", cityId: "" }));
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const response = await axiosInstance.get(
          `/location/district/getDistrictByState/${form.stateId}`,
        );
        setDistricts(response.data.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [form.stateId]);

  useEffect(() => {
    if (!form.districtId) {
      setCities([]);
      setForm((prev) => ({ ...prev, cityId: "" }));
      return;
    }

    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await axiosInstance.get(
          `/location/city/getCityByDistrict/${form.districtId}`,
        );
        setCities(response.data.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [form.districtId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFiles = (setter) => (event) => {
    setter(Array.from(event.target.files || []));
  };

  const updateHospitalDocument = (id, field, value) => {
    setHospitalDocuments((prev) =>
      prev.map((document) => (document.id === id ? { ...document, [field]: value } : document)),
    );
  };

  const addHospitalDocument = () => {
    setHospitalDocuments((prev) => [...prev, createDocumentRow()]);
  };

  const removeHospitalDocument = (id) => {
    setHospitalDocuments((prev) => (prev.length > 1 ? prev.filter((document) => document.id !== id) : [createDocumentRow()]));
  };

  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-200";
  const inputClass =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400";
  const selectClass =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400";
  const disabledSelectClass =
    `${selectClass} disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500`;
  const fileInputClass =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:file:bg-slate-800 dark:file:text-blue-200 dark:focus:border-blue-400";
  const panelClass = "rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const requiredFields = [
      "hospitalName",
      "hospitalCode",
      "hospitalType",
      "email",
      "phone",
      "registrationNumber",
      "stateId",
      "districtId",
      "cityId",
      "address",
      "pincode",
    ];

    const missing = requiredFields.filter((key) => !form[key]);
    if (missing.length) {
      setMessage("Please complete all required fields before submitting.");
      return;
    }

    const completedDocuments = hospitalDocuments.filter((document) => document.name.trim() || document.file);
    const hasIncompleteDocument = completedDocuments.some((document) => !document.name.trim() || !document.file);

    if (hasIncompleteDocument) {
      setMessage("Each document row needs both a document name and a file.");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      Object.entries({
        ...form,
        totalBeds: Number(form.totalBeds) || 0,
        availableBeds: Number(form.availableBeds) || 0,
        totalDoctors: Number(form.totalDoctors) || 0,
        totalStaff: Number(form.totalStaff) || 0,
        establishedYear: Number(form.establishedYear) || "",
        emergencyAvailable: !!form.emergencyAvailable,
        ambulanceAvailable: !!form.ambulanceAvailable,
        ICUAvailable: !!form.ICUAvailable,
        bloodBankAvailable: !!form.bloodBankAvailable,
        pharmacyAvailable: !!form.pharmacyAvailable,
      }).forEach(([key, value]) => payload.append(key, value));
      if (logoFile) payload.append("logo", logoFile);
      hospitalImages.forEach((file) => payload.append("hospitalImages", file));
      payload.append("documentNames", JSON.stringify(completedDocuments.map((document) => document.name.trim())));
      completedDocuments.forEach((document) => payload.append("hospitalFiles", document.file));

      await axiosInstance.post("/hospital/addHospital", payload);

      setMessage("Hospital added successfully.");
      setForm({
        hospitalName: "",
        hospitalCode: "",
        hospitalType: "Government",
        email: "",
        phone: "",
        alternatePhone: "",
        website: "",
        registrationNumber: "",
        establishedYear: "",
        stateId: "",
        districtId: "",
        cityId: "",
        address: "",
        pincode: "",
        totalBeds: "",
        availableBeds: "",
        totalDoctors: "",
        totalStaff: "",
        emergencyAvailable: false,
        ambulanceAvailable: false,
        ICUAvailable: false,
        bloodBankAvailable: false,
        pharmacyAvailable: false,
        description: "",
      });
      setLogoFile(null);
      setHospitalImages([]);
      setHospitalDocuments([createDocumentRow()]);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-left dark:bg-slate-900 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 xl:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Add Hospital</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Create a new hospital record</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                This page is public: anyone can add a hospital without logging in.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Use the form below to save hospital details and location references.
            </div>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {message}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <label className={labelClass}>
                  Hospital Name
                  <input
                    value={form.hospitalName}
                    onChange={(e) => handleChange("hospitalName", e.target.value)}
                    className={inputClass}
                    placeholder="MediCare Hospital"
                  />
                </label>
                <label className={labelClass}>
                  Hospital Code
                  <input
                    value={form.hospitalCode}
                    onChange={(e) => handleChange("hospitalCode", e.target.value)}
                    className={inputClass}
                    placeholder="HOSP123"
                  />
                </label>
                <label className={labelClass}>
                  Hospital Type
                  <select
                    value={form.hospitalType}
                    onChange={(e) => handleChange("hospitalType", e.target.value)}
                    className={selectClass}
                  >
                    {hospitalTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Registration Number
                  <input
                    value={form.registrationNumber}
                    onChange={(e) => handleChange("registrationNumber", e.target.value)}
                    className={inputClass}
                    placeholder="REG-0001"
                  />
                </label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={labelClass}>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={inputClass}
                      placeholder="admin@hospital.com"
                    />
                  </label>
                  <label className={labelClass}>
                    Phone
                    <input
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={inputClass}
                      placeholder="9876543210"
                    />
                  </label>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={labelClass}>
                    Alternate Phone
                    <input
                      value={form.alternatePhone}
                      onChange={(e) => handleChange("alternatePhone", e.target.value)}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </label>
                  <label className={labelClass}>
                    Website
                    <input
                      value={form.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      className={inputClass}
                      placeholder="https://example.com"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <label className={labelClass}>
                  State
                  <select
                    value={form.stateId}
                    onChange={(e) => handleChange("stateId", e.target.value)}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      {loadingStates ? "Loading states..." : states.length ? "Select state" : "No states available"}
                    </option>
                    {states.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.stateName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  District
                  <select
                    value={form.districtId}
                    onChange={(e) => handleChange("districtId", e.target.value)}
                    disabled={!form.stateId || loadingDistricts}
                    className={disabledSelectClass}
                  >
                    <option value="" disabled>
                      {loadingDistricts
                        ? "Loading districts..."
                        : !form.stateId
                        ? "Select a state first"
                        : districts.length
                        ? "Select district"
                        : "No districts available"}
                    </option>
                    {districts.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.districtName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  City
                  <select
                    value={form.cityId}
                    onChange={(e) => handleChange("cityId", e.target.value)}
                    disabled={!form.districtId || loadingCities}
                    className={disabledSelectClass}
                  >
                    <option value="" disabled>
                      {loadingCities
                        ? "Loading cities..."
                        : !form.districtId
                        ? "Select a district first"
                        : cities.length
                        ? "Select city"
                        : "No cities available"}
                    </option>
                    {cities.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.cityName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Address
                  <textarea
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className={inputClass}
                    rows={4}
                    placeholder="Hospital street address"
                  />
                </label>
                <label className={labelClass}>
                  Pincode
                  <input
                    value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    className={inputClass}
                    placeholder="123456"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className={panelClass}>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Hospital capacity</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Total beds
                    <input
                      value={form.totalBeds}
                      onChange={(e) => handleChange("totalBeds", e.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </label>
                  <label className={labelClass}>
                    Available beds
                    <input
                      value={form.availableBeds}
                      onChange={(e) => handleChange("availableBeds", e.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </label>
                  <label className={labelClass}>
                    Total doctors
                    <input
                      value={form.totalDoctors}
                      onChange={(e) => handleChange("totalDoctors", e.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </label>
                  <label className={labelClass}>
                    Total staff
                    <input
                      value={form.totalStaff}
                      onChange={(e) => handleChange("totalStaff", e.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </label>
                </div>
              </div>

              <div className={panelClass}>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Facilities</p>
                <div className="mt-4 grid gap-3">
                  {[
                    { label: "Emergency", name: "emergencyAvailable" },
                    { label: "Ambulance", name: "ambulanceAvailable" },
                    { label: "ICU", name: "ICUAvailable" },
                    { label: "Blood bank", name: "bloodBankAvailable" },
                    { label: "Pharmacy", name: "pharmacyAvailable" },
                  ].map((item) => (
                    <label key={item.name} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={form[item.name]}
                        onChange={(e) => handleChange(item.name, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={`space-y-4 ${panelClass}`}>
              <label className={labelClass}>
                Established year
                <input
                  type="number"
                  value={form.establishedYear}
                  onChange={(e) => handleChange("establishedYear", e.target.value)}
                  className={inputClass}
                  placeholder="2000"
                />
              </label>
              <div className="grid gap-4 lg:grid-cols-3">
                <label className={labelClass}>
                  Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className={fileInputClass}
                  />
                  {logoFile && <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">{logoFile.name}</span>}
                </label>
                <label className={labelClass}>
                  Hospital images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles(setHospitalImages)}
                    className={fileInputClass}
                  />
                  {hospitalImages.length > 0 && <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">{hospitalImages.length} image(s) selected</span>}
                </label>
                <div className="lg:col-span-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Documents</p>
                  <div className="mt-2 space-y-3">
                    {hospitalDocuments.map((document, index) => (
                      <div key={document.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950 sm:grid-cols-[1fr_1.5fr_auto_auto] sm:items-center">
                        <input
                          value={document.name}
                          onChange={(e) => updateHospitalDocument(document.id, "name", e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
                          placeholder="Document name"
                        />
                        <input
                          type="file"
                          onChange={(e) => updateHospitalDocument(document.id, "file", e.target.files?.[0] || null)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:file:bg-slate-800 dark:file:text-blue-200 dark:focus:border-blue-400"
                        />
                        <button
                          type="button"
                          onClick={addHospitalDocument}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-600 bg-blue-600 text-xl font-bold leading-none text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-blue-400 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400 dark:focus:ring-blue-950"
                          aria-label="Add document row"
                          title="Add document row"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHospitalDocument(document.id)}
                          disabled={hospitalDocuments.length === 1 && index === 0 && !document.name && !document.file}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500 bg-white text-xl font-bold leading-none text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white dark:border-rose-400 dark:bg-slate-950 dark:text-rose-300 dark:hover:bg-rose-950/40 dark:focus:ring-rose-950 dark:disabled:border-slate-700 dark:disabled:text-slate-600 dark:disabled:hover:bg-slate-950"
                          aria-label="Remove document row"
                          title="Remove document row"
                        >
                          -
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <label className={labelClass}>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={inputClass}
                  rows={4}
                  placeholder="Brief hospital profile"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
              >
                {loading ? "Saving..." : "Save hospital"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
            </div>
            {message && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};

export default AddHospital;
