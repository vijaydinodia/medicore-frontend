import { useState } from "react";
import { createPortal } from "react-dom";
import axiosInstance from "../api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  profileImage: "",
};

const getDisplayName = (user) => user?.name || user?.doctorName || "Account";

const mapProfileForStorage = (currentUser, data) => ({
  ...currentUser,
  ...data,
  name: data.name || data.doctorName || currentUser?.name || currentUser?.doctorName,
  doctorName: data.doctorName || currentUser?.doctorName,
  role: currentUser?.role || data.role,
  hospitalId: data.hospitalId || currentUser?.hospitalId,
  departmentId: data.departmentId || currentUser?.departmentId,
});

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
    <div className="mt-2">{children}</div>
  </label>
);

const EditProfile = ({ user, onUpdated, buttonClassName = "", triggerClassName = "", onOpened }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const isDoctor = user?.role === "doctor";

  const nameParts = getDisplayName(user).split(" ").filter(Boolean);
  let initials = "A";

  if (nameParts.length > 0) {
    initials = nameParts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  const openEditor = () => {
    setForm({
      name: getDisplayName(user),
      email: user?.email || "",
      phone: user?.phone || "",
      age: user?.age || "",
      gender: user?.gender || "",
      profileImage: user?.profileImage || "",
    });
    setMessage("");
    setError("");
    setProfileImageFile(null);
    setPreviewUrl(user?.profileImage || "");
    setOpen(true);
    onOpened?.();
  };

  const closeEditor = () => {
    if (!saving) setOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImage = (event) => {
    const file = event.target.files?.[0] || null;
    setProfileImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : user?.profileImage || "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!(form.name.trim() && form.gender)) {
      setError("Please complete all required fields.");
      return;
    }

    if (!isDoctor && !form.age) {
      setError("Please enter age.");
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("gender", form.gender);
      if (!isDoctor) payload.append("age", Number(form.age));
      if (profileImageFile) payload.append("profileImage", profileImageFile);

      const response = await axiosInstance.patch("/user/editProfile", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = mapProfileForStorage(user, response.data.data || payload);

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authChanged"));
      onUpdated?.(updatedUser);
      setMessage(response.data.message || "Profile updated successfully.");
      setTimeout(() => setOpen(false), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className={
          triggerClassName ||
          `inline-flex h-11 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 ${buttonClassName}`
        }
      >
        Edit profile
      </button>

      {open &&
        createPortal(
        <div data-account-dialog="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={closeEditor}>
          <section
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-teal-700 text-base font-black text-white dark:bg-teal-500 dark:text-slate-950">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">Edit profile</h2>
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{user?.email || "Update account details"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-xl leading-none text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Close profile editor"
              >
                x
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</div>}
              {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label={isDoctor ? "Doctor name" : "Name"}>
                  <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Full name" />
                </Field>

                <Field label="Email">
                  <input type="email" name="email" value={form.email} className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400`} placeholder="name@example.com" readOnly />
                </Field>

                <Field label="Phone">
                  <input name="phone" value={form.phone} className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400`} placeholder="9876543210" readOnly />
                </Field>

                {!isDoctor && (
                  <Field label="Age">
                    <input type="number" min="1" name="age" value={form.age} onChange={handleChange} className={inputClass} placeholder="32" />
                  </Field>
                )}

                <Field label="Gender">
                  <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>

                <Field label="Profile photo">
                  <input type="file" accept="image/*" onChange={handleProfileImage} className={inputClass} />
                </Field>
              </div>

              {previewUrl && (
                <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <img src={previewUrl} alt="Profile preview" className="h-14 w-14 rounded-md object-cover" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {profileImageFile?.name || "Current profile photo"}
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-teal-700 bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>,
          document.body,
        )}
    </>
  );
};

export default EditProfile;
