import { useEffect, useState } from "react";
import axiosInstance from "../api";

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
        className="self-start rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">
            {editingId ? "Update District" : "Create District"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Link each district to its parent state.
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
        <label className="mb-2 block text-sm font-semibold text-slate-700">State</label>
        <select
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
          disabled={Boolean(editingId)}
          className="mb-4 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">Select state</option>
          {states.map((state) => (
            <option key={state._id} value={state._id}>
              {state.stateName}
            </option>
          ))}
        </select>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          District Name
        </label>
        <input
          type="text"
          value={districtName}
          onChange={(e) => setDistrictName(e.target.value)}
          className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder="Enter district name"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-11 w-full rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-300"
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
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Districts</h2>
            <p className="mt-1 text-sm text-slate-500">{districts.length} records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">District</th>
                <th className="px-6 py-3 font-semibold">State</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {districts.map((district) => (
                <tr key={district._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {district.districtName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {district.stateId?.stateName || "No state"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                      {district.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(district)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === `softDelete-${district._id}`}
                        onClick={() => handleAction(district._id, "softDelete")}
                        className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                      >
                        Soft Delete
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === `restore-${district._id}`}
                        onClick={() => handleAction(district._id, "restore")}
                        className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === `delete-${district._id}`}
                        onClick={() => handleAction(district._id, "delete")}
                        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!districts.length && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
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
