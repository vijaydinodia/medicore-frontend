import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";

const hospitalTypes = ["Government", "Private", "Trust"];

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
    logo: "",
    description: "",
  });
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

    try {
      setLoading(true);
      await axiosInstance.post("/hospital/addHospital", {
        ...form,
        totalBeds: Number(form.totalBeds) || 0,
        availableBeds: Number(form.availableBeds) || 0,
        totalDoctors: Number(form.totalDoctors) || 0,
        totalStaff: Number(form.totalStaff) || 0,
        establishedYear: Number(form.establishedYear) || undefined,
        emergencyAvailable: !!form.emergencyAvailable,
        ambulanceAvailable: !!form.ambulanceAvailable,
        ICUAvailable: !!form.ICUAvailable,
        bloodBankAvailable: !!form.bloodBankAvailable,
        pharmacyAvailable: !!form.pharmacyAvailable,
      });
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
        logo: "",
        description: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not submit hospital.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-left dark:bg-slate-900 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 xl:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Add Hospital</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Create a new hospital record</h1>
              <p className="mt-2 text-sm text-slate-500">
                This page is public: anyone can add a hospital without logging in.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              Use the form below to save hospital details and location references.
            </div>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Hospital Name
                  <input
                    value={form.hospitalName}
                    onChange={(e) => handleChange("hospitalName", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                    placeholder="MediCare Hospital"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Hospital Code
                  <input
                    value={form.hospitalCode}
                    onChange={(e) => handleChange("hospitalCode", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                    placeholder="HOSP123"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Hospital Type
                  <select
                    value={form.hospitalType}
                    onChange={(e) => handleChange("hospitalType", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  >
                    {hospitalTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Registration Number
                  <input
                    value={form.registrationNumber}
                    onChange={(e) => handleChange("registrationNumber", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                    placeholder="REG-0001"
                  />
                </label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                      placeholder="admin@hospital.com"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Phone
                    <input
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                      placeholder="9876543210"
                    />
                  </label>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Alternate Phone
                    <input
                      value={form.alternatePhone}
                      onChange={(e) => handleChange("alternatePhone", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Website
                    <input
                      value={form.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  State
                  <select
                    value={form.stateId}
                    onChange={(e) => handleChange("stateId", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
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
                <label className="block text-sm font-semibold text-slate-700">
                  District
                  <select
                    value={form.districtId}
                    onChange={(e) => handleChange("districtId", e.target.value)}
                    disabled={!form.stateId || loadingDistricts}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                <label className="block text-sm font-semibold text-slate-700">
                  City
                  <select
                    value={form.cityId}
                    onChange={(e) => handleChange("cityId", e.target.value)}
                    disabled={!form.districtId || loadingCities}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                <label className="block text-sm font-semibold text-slate-700">
                  Address
                  <textarea
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                    rows={4}
                    placeholder="Hospital street address"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Pincode
                  <input
                    value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                    placeholder="123456"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Hospital capacity</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Total beds
                    <input
                      value={form.totalBeds}
                      onChange={(e) => handleChange("totalBeds", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                      placeholder="0"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Available beds
                    <input
                      value={form.availableBeds}
                      onChange={(e) => handleChange("availableBeds", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                      placeholder="0"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Total doctors
                    <input
                      value={form.totalDoctors}
                      onChange={(e) => handleChange("totalDoctors", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                      placeholder="0"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Total staff
                    <input
                      value={form.totalStaff}
                      onChange={(e) => handleChange("totalStaff", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                      placeholder="0"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Facilities</p>
                <div className="mt-4 grid gap-3">
                  {[
                    { label: "Emergency", name: "emergencyAvailable" },
                    { label: "Ambulance", name: "ambulanceAvailable" },
                    { label: "ICU", name: "ICUAvailable" },
                    { label: "Blood bank", name: "bloodBankAvailable" },
                    { label: "Pharmacy", name: "pharmacyAvailable" },
                  ].map((item) => (
                    <label key={item.name} className="flex items-center gap-3 text-sm text-slate-700">
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

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <label className="block text-sm font-semibold text-slate-700">
                Established year
                <input
                  type="number"
                  value={form.establishedYear}
                  onChange={(e) => handleChange("establishedYear", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  placeholder="2000"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Logo URL
                <input
                  value={form.logo}
                  onChange={(e) => handleChange("logo", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
                  rows={4}
                  placeholder="Brief hospital profile"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Saving..." : "Save hospital"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AddHospital;
