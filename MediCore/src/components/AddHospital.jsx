import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import axiosInstance from "../api";

const hospitalTypes = ["Government", "Private", "Trust"];
const facilities = [
  { label: "Emergency", name: "emergencyAvailable" },
  { label: "Ambulance", name: "ambulanceAvailable" },
  { label: "ICU", name: "ICUAvailable" },
  { label: "Blood bank", name: "bloodBankAvailable" },
  { label: "Pharmacy", name: "pharmacyAvailable" },
];

let documentRowId = 0;
const createDocumentRow = () => ({
  id: `document-${documentRowId++}`,
  name: "",
  file: null,
});

const initialForm = {
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
};

const getApiErrorMessage = (error) => {
  const data = error.response?.data;
  if (typeof data === "string") return data;
  return data?.error || data?.message || error.message || "Could not submit hospital.";
};

const icons = {
  hospital: LocalHospitalOutlinedIcon,
  location: PlaceOutlinedIcon,
  activity: MonitorHeartOutlinedIcon,
  file: DescriptionOutlinedIcon,
  plus: AddRoundedIcon,
  close: CloseRoundedIcon,
  check: CheckRoundedIcon,
  arrow: ArrowBackRoundedIcon,
};

const Icon = ({ name, className = "h-5 w-5" }) => (
  icons[name] ? (() => {
    const Component = icons[name];
    return <Component className={className} aria-hidden="true" />;
  })() : null
);

const Field = ({ label, children, className = "" }) => (
  <label className={`block text-sm font-bold text-slate-700 dark:text-slate-200 ${className}`}>
    {label}
    {children}
  </label>
);

const Section = ({ icon, title, subtitle, children }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-900">
    <div className="flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700 ring-1 ring-teal-100 dark:bg-teal-950 dark:text-teal-200 dark:ring-teal-900">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const AddHospital = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
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
        const response = await axiosInstance.get(`/location/district/getDistrictByState/${form.stateId}`);
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
        const response = await axiosInstance.get(`/location/city/getCityByDistrict/${form.districtId}`);
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
    setHospitalDocuments((prev) =>
      prev.length > 1 ? prev.filter((document) => document.id !== id) : [createDocumentRow()],
    );
  };

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

  const completedRequiredCount = useMemo(
    () => requiredFields.filter((field) => Boolean(form[field])).length,
    [form],
  );
  const completionPercent = Math.round((completedRequiredCount / requiredFields.length) * 100);
  const enabledFacilities = facilities.filter((facility) => form[facility.name]).length;

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";
  const textareaClass =
    "mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";
  const fileInputClass =
    "mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-teal-700 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:file:bg-teal-950 dark:file:text-teal-200 dark:focus:ring-teal-950";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

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
      setForm(initialForm);
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
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 text-left text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-[73px] z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 xl:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Hospital onboarding</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Register a hospital</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Submit hospital identity, location, operating capacity, facilities, and verification files for review.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <Icon name="arrow" className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                form="hospital-registration-form"
                disabled={loading}
                className="h-11 rounded-md bg-teal-700 px-5 text-sm font-black text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
              >
                {loading ? "Submitting..." : "Submit hospital"}
              </button>
            </div>
          </div>
          {message && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              {message}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[1fr_320px] xl:px-8">
        <form id="hospital-registration-form" onSubmit={handleSubmit} className="space-y-6">
          <Section icon="hospital" title="Hospital identity" subtitle="Core details used for approval, login creation, and public listing.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Hospital name">
                <input value={form.hospitalName} onChange={(e) => handleChange("hospitalName", e.target.value)} className={inputClass} placeholder="MediCare Hospital" />
              </Field>
              <Field label="Hospital code">
                <input value={form.hospitalCode} onChange={(e) => handleChange("hospitalCode", e.target.value)} className={inputClass} placeholder="HOSP123" />
              </Field>
              <Field label="Hospital type">
                <select value={form.hospitalType} onChange={(e) => handleChange("hospitalType", e.target.value)} className={inputClass}>
                  {hospitalTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </Field>
              <Field label="Registration number">
                <input value={form.registrationNumber} onChange={(e) => handleChange("registrationNumber", e.target.value)} className={inputClass} placeholder="REG-0001" />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className={inputClass} placeholder="admin@hospital.com" />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className={inputClass} placeholder="9876543210" />
              </Field>
              <Field label="Alternate phone">
                <input value={form.alternatePhone} onChange={(e) => handleChange("alternatePhone", e.target.value)} className={inputClass} placeholder="Optional" />
              </Field>
              <Field label="Website">
                <input value={form.website} onChange={(e) => handleChange("website", e.target.value)} className={inputClass} placeholder="https://example.com" />
              </Field>
            </div>
          </Section>

          <Section icon="location" title="Location" subtitle="Address hierarchy is used by patients when searching and booking appointments.">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="State">
                <select value={form.stateId} onChange={(e) => handleChange("stateId", e.target.value)} className={inputClass}>
                  <option value="" disabled>{loadingStates ? "Loading states..." : states.length ? "Select state" : "No states available"}</option>
                  {states.map((item) => (
                    <option key={item._id} value={item._id} disabled={item.status !== "active"}>
                      {item.stateName} {item.status !== "active" ? "(inactive)" : "(active)"}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="District">
                <select value={form.districtId} onChange={(e) => handleChange("districtId", e.target.value)} disabled={!form.stateId || loadingDistricts} className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500`}>
                  <option value="" disabled>
                    {loadingDistricts ? "Loading districts..." : !form.stateId ? "Select state first" : districts.length ? "Select district" : "No districts available"}
                  </option>
                  {districts.map((item) => (
                    <option key={item._id} value={item._id}>{item.districtName}</option>
                  ))}
                </select>
              </Field>
              <Field label="City">
                <select value={form.cityId} onChange={(e) => handleChange("cityId", e.target.value)} disabled={!form.districtId || loadingCities} className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500`}>
                  <option value="" disabled>
                    {loadingCities ? "Loading cities..." : !form.districtId ? "Select district first" : cities.length ? "Select city" : "No cities available"}
                  </option>
                  {cities.map((item) => (
                    <option key={item._id} value={item._id}>{item.cityName}</option>
                  ))}
                </select>
              </Field>
              <Field label="Address" className="md:col-span-2">
                <textarea value={form.address} onChange={(e) => handleChange("address", e.target.value)} className={textareaClass} rows={4} placeholder="Hospital street address" />
              </Field>
              <Field label="Pincode">
                <input value={form.pincode} onChange={(e) => handleChange("pincode", e.target.value)} className={inputClass} placeholder="123456" />
              </Field>
            </div>
          </Section>

          <Section icon="activity" title="Capacity and facilities" subtitle="Operational information helps admins validate readiness and users understand available services.">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Total beds">
                  <input value={form.totalBeds} onChange={(e) => handleChange("totalBeds", e.target.value)} className={inputClass} placeholder="0" />
                </Field>
                <Field label="Available beds">
                  <input value={form.availableBeds} onChange={(e) => handleChange("availableBeds", e.target.value)} className={inputClass} placeholder="0" />
                </Field>
                <Field label="Total doctors">
                  <input value={form.totalDoctors} onChange={(e) => handleChange("totalDoctors", e.target.value)} className={inputClass} placeholder="0" />
                </Field>
                <Field label="Total staff">
                  <input value={form.totalStaff} onChange={(e) => handleChange("totalStaff", e.target.value)} className={inputClass} placeholder="0" />
                </Field>
              </div>

              <div className="grid gap-3">
                {facilities.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleChange(item.name, !form[item.name])}
                    className={`flex h-11 items-center justify-between rounded-md border px-3 text-sm font-bold transition ${
                      form[item.name]
                        ? "border-teal-700 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-950 dark:text-teal-100"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                    }`}
                  >
                    {item.label}
                    {form[item.name] && <Icon name="check" className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section icon="file" title="Media and verification" subtitle="Add profile images and supporting documents for admin review.">
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Established year">
                <input type="number" value={form.establishedYear} onChange={(e) => handleChange("establishedYear", e.target.value)} className={inputClass} placeholder="2000" />
              </Field>
              <Field label="Logo">
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className={fileInputClass} />
                {logoFile && <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">{logoFile.name}</span>}
              </Field>
              <Field label="Hospital images">
                <input type="file" accept="image/*" multiple onChange={handleFiles(setHospitalImages)} className={fileInputClass} />
                {hospitalImages.length > 0 && <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">{hospitalImages.length} image(s) selected</span>}
              </Field>
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-900 dark:text-white">Documents</p>
                  <button type="button" onClick={addHospitalDocument} className="inline-flex h-9 items-center gap-2 rounded-md bg-teal-700 px-3 text-sm font-bold text-white hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950">
                    <Icon name="plus" className="h-4 w-4" />
                    Add document
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {hospitalDocuments.map((document, index) => (
                    <div key={document.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_1.4fr_auto] sm:items-center">
                      <input value={document.name} onChange={(e) => updateHospitalDocument(document.id, "name", e.target.value)} className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Document name" />
                      <input type="file" onChange={(e) => updateHospitalDocument(document.id, "file", e.target.files?.[0] || null)} className={fileInputClass} />
                      <button
                        type="button"
                        onClick={() => removeHospitalDocument(document.id)}
                        disabled={hospitalDocuments.length === 1 && index === 0 && !document.name && !document.file}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-rose-900 dark:bg-slate-950 dark:text-rose-300 dark:hover:bg-rose-950/40"
                        aria-label="Remove document row"
                        title="Remove document row"
                      >
                        <Icon name="close" className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <Field label="Description" className="lg:col-span-3">
                <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} className={textareaClass} rows={4} placeholder="Brief hospital profile" />
              </Field>
            </div>
          </Section>
        </form>

        <aside className="space-y-4 xl:sticky xl:top-48 xl:self-start">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Readiness</p>
            <div className="mt-4">
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-slate-950 dark:text-white">{completionPercent}%</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{completedRequiredCount}/{requiredFields.length} required</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${completionPercent}%` }} />
              </div>
            </div>
            <div className="mt-5 grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <p>{enabledFacilities} facility option(s) enabled</p>
              <p>{hospitalImages.length} gallery image(s) selected</p>
              <p>{hospitalDocuments.filter((document) => document.name || document.file).length} document row(s) started</p>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            <h2 className="font-black text-slate-950 dark:text-white">Submission checklist</h2>
            <ul className="mt-3 space-y-2">
              <li>Use a unique hospital code and active email.</li>
              <li>Select state, district, and city before submitting.</li>
              <li>Upload matching document names with files.</li>
              <li>Review capacity numbers before approval.</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
};

export default AddHospital;
