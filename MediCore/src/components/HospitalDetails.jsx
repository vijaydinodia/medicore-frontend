const HospitalDetails = ({ hospital, onClose }) => {
  if (!hospital) {
    return null;
  }

  const documents = hospital.files || [];
  const galleryImages = (hospital.images || []).filter((image) => image?.url);
  const primaryImage = hospital.logo || galleryImages[0]?.url || "";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Hospital detail view
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {hospital.hospitalName}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              hospital.isDeleted
                ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                : hospital.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            }`}>
              {hospital.isDeleted ? "Deleted" : hospital.isActive ? "Active" : "Inactive"}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              hospital.status === "approved"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                : hospital.status === "rejected"
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            }`}>
              {hospital.status}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            View the full registration details for this hospital.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-600"
        >
          Close
        </button>
      </div>

      {primaryImage && (
        <div className="mt-7 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <img
            src={primaryImage}
            alt={`${hospital.hospitalName} ${hospital.logo ? "logo" : "image"}`}
            className="h-64 w-full object-cover"
          />
        </div>
      )}

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">General</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Code:</span> {hospital.hospitalCode}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Type:</span> {hospital.hospitalType}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Registered:</span> {hospital.registrationNumber}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Contact</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Email:</span> {hospital.email}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Phone:</span> {hospital.phone}
            </p>
            {hospital.alternatePhone && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Alt phone:</span> {hospital.alternatePhone}
              </p>
            )}
            {hospital.website && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Website:</span> {hospital.website}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Location</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Address:</span> {hospital.address}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Pincode:</span> {hospital.pincode}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Hospital stats</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total beds</p>
                <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{hospital.totalBeds || 0}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Available beds</p>
                <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{hospital.availableBeds || 0}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Doctors</p>
                <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{hospital.totalDoctors || 0}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Staff</p>
                <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{hospital.totalStaff || 0}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Facilities</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {hospital.emergencyAvailable && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">Emergency</span>}
              {hospital.ambulanceAvailable && <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900 dark:text-sky-300">Ambulance</span>}
              {hospital.ICUAvailable && <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">ICU</span>}
              {hospital.bloodBankAvailable && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900 dark:text-rose-300">Blood Bank</span>}
              {hospital.pharmacyAvailable && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">Pharmacy</span>}
              {!hospital.emergencyAvailable && !hospital.ambulanceAvailable && !hospital.ICUAvailable && !hospital.bloodBankAvailable && !hospital.pharmacyAvailable && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">No extra facilities</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Approval details</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{hospital.status}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">Created at</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {new Date(hospital.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {(hospital.logo || galleryImages.length > 0) && (
        <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Images</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hospital.logo && (
              <a href={hospital.logo} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                <img src={hospital.logo} alt={`${hospital.hospitalName} logo`} className="h-36 w-full object-cover transition group-hover:scale-105" />
                <p className="truncate px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Logo</p>
              </a>
            )}
            {galleryImages.map((image, index) => (
              <a key={image._id || image.publicId || image.url} href={image.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                <img src={image.url} alt={`${hospital.hospitalName} gallery ${index + 1}`} className="h-36 w-full object-cover transition group-hover:scale-105" />
                <p className="truncate px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300">{image.name || `Hospital image ${index + 1}`}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Documents</p>
        {documents.length ? (
          <div className="mt-4 grid gap-3">
            {documents.map((document, index) => (
              <div key={document.publicId || document.url || index} className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {document.documentName || document.name || `Document ${index + 1}`}
                  </p>
                  {document.name && document.documentName !== document.name && (
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{document.name}</p>
                  )}
                </div>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-blue-400 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400 dark:focus:ring-blue-950"
                >
                  View file
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            No documents uploaded.
          </p>
        )}
      </div>
    </div>
  );
};

export default HospitalDetails;
