import { useEffect, useState } from "react";
import axiosInstance from "../api";
import LocationIconButton from "./LocationIconButton";

const AddDistrict = () => {
  const [districtName, setDistrictName] = useState("");
  const [stateId, setStateId] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const stateRes = await axiosInstance.get("/location/state/getAll");
      const districtRes = await axiosInstance.get("/location/district/getAllDistrict");
      setStates(stateRes.data.data || []);
      setDistricts(districtRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load districts");
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

    if (!(districtName.trim() && stateId)) {
      return setError("District name and state are required");
    }

    try {
      setLoading(true);
      const res = editingId
        ? await axiosInstance.patch(
            `/location/district/updateDistrict/${editingId}`,
            { districtName },
          )
        : await axiosInstance.post("/location/district/createDistrict", {
            districtName,
            stateId,
          });
      setMessage(
        res.data.message ||
          (editingId
            ? "District updated successfully"
            : "District added successfully"),
      );
      setDistrictName("");
      setStateId("");
      setEditingId("");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "District action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (district) => {
    setEditingId(district._id);
    setDistrictName(district.districtName);
    setStateId(district.stateId?._id || district.stateId || "");
    setError("");
    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setDistrictName("");
    setStateId("");
  };

  const handleAction = async (id, action) => {
    const endpoints = {
      delete: `/location/district/deleteDistrict/${id}`,
      softDelete: `/location/district/softDeleteDistrict/${id}`,
      restore: `/location/district/restoreDistrict/${id}`,
    };

    if (action === "delete" && !window.confirm("Delete this district permanently?")) {
      return;
    }

    try {
      setActionLoading(`${action}-${id}`);
      const res =
        action === "delete"
          ? await axiosInstance.delete(endpoints[action])
          : await axiosInstance.patch(endpoints[action]);
      setMessage(res.data.message || "District action completed");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "District action failed");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="self-start rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            {editingId ? "Update District" : "Create District"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Link each district to its parent state.
          </p>
        </div>
        {error && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </p>
        )}
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">State</label>
        <select
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
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
          District Name
        </label>
        <input
          type="text"
          value={districtName}
          onChange={(e) => setDistrictName(e.target.value)}
          className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-teal-950"
          placeholder="Enter district name"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:bg-teal-300 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
        >
          {loading
            ? "Saving..."
            : editingId
              ? "Update District"
              : "Add District"}
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
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Districts</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{districts.length} records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">District</th>
                <th className="px-6 py-3 font-semibold">State</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {districts.map((district) => {
                const isInactive = district.status === "inactive";

                return (
                <tr key={district._id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                  <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">
                    {district.districtName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {district.stateId?.stateName || "No state"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${isInactive ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"}`}>
                      {district.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <LocationIconButton
                        action="edit"
                        label="Edit district"
                        onClick={() => handleEdit(district)}
                      />
                      {isInactive ? (
                        <LocationIconButton
                          action="restore"
                          label="Restore district"
                          disabled={actionLoading === `restore-${district._id}`}
                          onClick={() => handleAction(district._id, "restore")}
                        />
                      ) : (
                        <LocationIconButton
                          action="softDelete"
                          label="Deactivate district"
                          disabled={actionLoading === `softDelete-${district._id}`}
                          onClick={() => handleAction(district._id, "softDelete")}
                        />
                      )}
                      <LocationIconButton
                        action="delete"
                        label="Delete district permanently"
                        disabled={actionLoading === `delete-${district._id}`}
                        onClick={() => handleAction(district._id, "delete")}
                      />
                    </div>
                  </td>
                </tr>
                );
              })}
              {!districts.length && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    No districts added yet.
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

export default AddDistrict;
