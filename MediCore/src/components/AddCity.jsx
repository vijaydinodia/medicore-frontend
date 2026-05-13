import { useEffect, useState } from "react";
import axiosInstance from "../api";

const AddCity = () => {
  const [cityName, setCityName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [districtRes, cityRes] = await Promise.all([
        axiosInstance.get("/location/district/getAllDistrict"),
        axiosInstance.get("/location/city/getAllCity"),
      ]);
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

    if (!(cityName.trim() && districtId)) {
      return setError("City name and district are required");
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
    setEditingId(city._id);
    setCityName(city.cityName);
    setDistrictId(city.districtId?._id || city.districtId || "");
    setError("");
    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setCityName("");
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

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="self-start rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">
            {editingId ? "Update City" : "Create City"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add cities under the correct district.
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
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          District
        </label>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          disabled={Boolean(editingId)}
          className="mb-4 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">Select district</option>
          {districts.map((district) => (
            <option key={district._id} value={district._id}>
              {district.districtName}
            </option>
          ))}
        </select>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          City Name
        </label>
        <input
          type="text"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder="Enter city name"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-11 w-full rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Saving..." : editingId ? "Update City" : "Add City"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Cities</h2>
            <p className="mt-1 text-sm text-slate-500">{cities.length} records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">City</th>
                <th className="px-6 py-3 font-semibold">District</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cities.map((city) => (
                <tr key={city._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {city.cityName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
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
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
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
