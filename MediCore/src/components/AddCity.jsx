import { useEffect, useState } from "react";
import axiosInstance from "../api";

const AddCity = () => {
  const [cityName, setCityName] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const stateRes = await axiosInstance.get("/location/state/getAll");
      const districtRes = await axiosInstance.get("/location/district/getAllDistrict");
      const cityRes = await axiosInstance.get("/location/city/getAllCity");
      setStates(stateRes.data.data || []);
      setDistricts(districtRes.data.data || []);
      setCities(cityRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load cities");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!(stateId && districtId && cityName.trim())) {
      return setError("State, district and city name are required");
    }

    try {
      setLoading(true);
      const res = editingId
        ? await axiosInstance.patch(`/location/city/updateCity/${editingId}`, {
            cityName,
          })
        : await axiosInstance.post("/location/city/createCity", {
            cityName,
            districtId,
          });
      setMessage(
        res.data.message ||
          (editingId ? "City updated successfully" : "City added successfully"),
      );
      setCityName("");
      setStateId("");
      setDistrictId("");
      setEditingId("");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "City action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (city) => {
    const cityDistrictId = city.districtId?._id || city.districtId || "";
    const district = districts.find((item) => item._id === cityDistrictId);

    setEditingId(city._id);
    setCityName(city.cityName);
    setStateId(district?.stateId?._id || district?.stateId || "");
    setDistrictId(cityDistrictId);
    setError("");
    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setCityName("");
    setStateId("");
    setDistrictId("");
  };

  const handleAction = async (id, action) => {
    const endpoints = {
      delete: `/location/city/deleteCity/${id}`,
      softDelete: `/location/city/softDeleteCity/${id}`,
      restore: `/location/city/restoreCity/${id}`,
    };

    if (action === "delete" && !window.confirm("Delete this city permanently?")) {
      return;
    }

    try {
      setActionLoading(`${action}-${id}`);
      const res =
        action === "delete"
          ? await axiosInstance.delete(endpoints[action])
          : await axiosInstance.patch(endpoints[action]);
      setMessage(res.data.message || "City action completed");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "City action failed");
    } finally {
      setActionLoading("");
    }
  };

  const filteredDistricts = districts.filter((district) => {
    return stateId && (district.stateId?._id || district.stateId) === stateId;
  });

  const handleStateChange = (value) => {
    setStateId(value);
    setDistrictId("");
    setError("");
    setMessage("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="self-start rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            {editingId ? "Update City" : "Create City"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select state first, then district, then add city.
          </p>
        </div>
        {error && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        )}
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          State
        </label>
        <select
          value={stateId}
          onChange={(e) => handleStateChange(e.target.value)}
          disabled={Boolean(editingId)}
          className="mb-4 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-teal-950 dark:disabled:bg-slate-800"
        >
          <option value="">Select state</option>
          {states.map((state) => (
            <option key={state._id} value={state._id}>
              {state.stateName}
            </option>
          ))}
        </select>

        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          District
        </label>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          disabled={Boolean(editingId) || !stateId}
          className="mb-4 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-teal-950 dark:disabled:bg-slate-800"
        >
          <option value="">{stateId ? "Select district" : "Select state first"}</option>
          {filteredDistricts.map((district) => (
            <option key={district._id} value={district._id}>
              {district.districtName}
            </option>
          ))}
        </select>

        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          City Name
        </label>
        <input
          type="text"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-teal-950"
          placeholder="Enter city name"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:bg-teal-300 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
        >
          {loading ? "Saving..." : editingId ? "Update City" : "Add City"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Cities</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{cities.length} records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">City</th>
                <th className="px-6 py-3 font-semibold">State</th>
                <th className="px-6 py-3 font-semibold">District</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cities.map((city) => (
                <tr key={city._id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                  <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">
                    {city.cityName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {city.districtId?.stateId?.stateName || "No state"}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {city.districtId?.districtName || "No district"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                      {city.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(city)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === `softDelete-${city._id}`}
                        onClick={() => handleAction(city._id, "softDelete")}
                        className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                      >
                        Soft Delete
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === `restore-${city._id}`}
                        onClick={() => handleAction(city._id, "restore")}
                        className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === `delete-${city._id}`}
                        onClick={() => handleAction(city._id, "delete")}
                        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!cities.length && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    No cities added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddCity;
