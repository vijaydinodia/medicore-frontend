const getText = (value, fallback = "-") => {
  if (value === undefined || value === null || value === "") return fallback;
  return value;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getLocationName = (value, key) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value[key] || value.name || value._id || "-";
};

const StatusPill = ({ children, tone = "slate" }) => {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
};

const DetailCard = ({ title, children, className = "" }) => (
  <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}>
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">{title}</p>
    <div className="mt-4">{children}</div>
  </section>
);

const Field = ({ label, value }) => (
  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-white">{getText(value)}</p>
  </div>
);

const StatBox = ({ label, value }) => (
  <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-900">
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value || 0}</p>
  </div>
);

const HospitalDetails = ({ hospital, onClose }) => {
  if (!hospital) {
    return null;
  }

  const documents = hospital.files || [];
  const galleryImages = (hospital.images || []).filter((image) => image?.url);
  const primaryImage = hospital.logo || galleryImages[0]?.url || "";
  const activeTone = hospital.isDeleted ? "slate" : hospital.isActive ? "emerald" : "amber";
  const approvalTone = hospital.status === "approved" ? "emerald" : hospital.status === "rejected" ? "rose" : "amber";
  const facilities = [
    { label: "Emergency", active: hospital.emergencyAvailable },
    { label: "Ambulance", active: hospital.ambulanceAvailable },
    { label: "ICU", active: hospital.ICUAvailable },
    { label: "Blood Bank", active: hospital.bloodBankAvailable },
    { label: "Pharmacy", active: hospital.pharmacyAvailable },
  ];

  return (
    <div className="flex max-h-[calc(100vh-2rem)] flex-col bg-white text-left dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Hospital detail view</p>
            <h3 className="mt-2 break-words text-2xl font-black text-slate-950 dark:text-white">{hospital.hospitalName}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill tone={activeTone}>{hospital.isDeleted ? "Deleted" : hospital.isActive ? "Active" : "Inactive"}</StatusPill>
              <StatusPill tone={approvalTone}>{getText(hospital.status, "pending")}</StatusPill>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 shrink-0 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </header>

      <div className="overflow-y-auto px-5 py-5 sm:px-6">
        {primaryImage && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <img src={primaryImage} alt={`${hospital.hospitalName || "Hospital"} ${hospital.logo ? "logo" : "image"}`} className="h-56 w-full object-cover sm:h-72" />
          </div>
        )}

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <DetailCard title="Registration">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Hospital name" value={hospital.hospitalName} />
              <Field label="Hospital code" value={hospital.hospitalCode} />
              <Field label="Hospital type" value={hospital.hospitalType} />
              <Field label="Registration no." value={hospital.registrationNumber} />
              <Field label="Established year" value={hospital.establishedYear} />
              <Field label="Mongo ID" value={hospital._id} />
            </div>
          </DetailCard>

          <DetailCard title="Capacity">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatBox label="Total beds" value={hospital.totalBeds} />
              <StatBox label="Available beds" value={hospital.availableBeds} />
              <StatBox label="Doctors" value={hospital.totalDoctors} />
              <StatBox label="Staff" value={hospital.totalStaff} />
            </div>
          </DetailCard>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <DetailCard title="Contact">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" value={hospital.email} />
              <Field label="Phone" value={hospital.phone} />
              <Field label="Alternate phone" value={hospital.alternatePhone} />
              <Field label="Website" value={hospital.website} />
            </div>
          </DetailCard>

          <DetailCard title="Location">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="State" value={getLocationName(hospital.stateId, "stateName")} />
              <Field label="District" value={getLocationName(hospital.districtId, "districtName")} />
              <Field label="City" value={getLocationName(hospital.cityId, "cityName")} />
              <Field label="Pincode" value={hospital.pincode} />
              <div className="sm:col-span-2">
                <Field label="Address" value={hospital.address} />
              </div>
            </div>
          </DetailCard>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <DetailCard title="Facilities">
            <div className="grid gap-2 sm:grid-cols-2">
              {facilities.map((facility) => (
                <div key={facility.label} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                  <span className="text-sm font-bold text-slate-950 dark:text-white">{facility.label}</span>
                  <StatusPill tone={facility.active ? "emerald" : "slate"}>{facility.active ? "Yes" : "No"}</StatusPill>
                </div>
              ))}
            </div>
          </DetailCard>

          <DetailCard title="Approval details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Approval status" value={hospital.status} />
              <Field label="Active status" value={hospital.isDeleted ? "Deleted" : hospital.isActive ? "Active" : "Inactive"} />
              <Field label="Created at" value={formatDateTime(hospital.createdAt)} />
              <Field label="Updated at" value={formatDateTime(hospital.updatedAt)} />
            </div>
          </DetailCard>
        </div>

        {hospital.description && (
          <DetailCard title="Description" className="mt-5">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{hospital.description}</p>
          </DetailCard>
        )}

        <DetailCard title="Images" className="mt-5">
          {hospital.logo || galleryImages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hospital.logo && (
                <a href={hospital.logo} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <img src={hospital.logo} alt={`${hospital.hospitalName || "Hospital"} logo`} className="h-36 w-full object-cover transition group-hover:scale-105" />
                  <p className="truncate px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300">Logo</p>
                </a>
              )}
              {galleryImages.map((image, index) => (
                <a key={image._id || image.publicId || image.url} href={image.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <img src={image.url} alt={`${hospital.hospitalName || "Hospital"} gallery ${index + 1}`} className="h-36 w-full object-cover transition group-hover:scale-105" />
                  <p className="truncate px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300">{image.name || `Hospital image ${index + 1}`}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="rounded-md bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">No images uploaded.</p>
          )}
        </DetailCard>

        <DetailCard title="Documents" className="mt-5">
          {documents.length ? (
            <div className="grid gap-3">
              {documents.map((document, index) => (
                <div key={document.publicId || document.url || index} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-slate-950 dark:text-white">{document.documentName || document.name || `Document ${index + 1}`}</p>
                    {document.name && document.documentName !== document.name && (
                      <p className="mt-1 break-words text-xs font-semibold text-slate-500 dark:text-slate-400">{document.name}</p>
                    )}
                  </div>
                  {document.url ? (
                    <a href={document.url} target="_blank" rel="noreferrer" className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-black text-white transition hover:bg-teal-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300">
                      View file
                    </a>
                  ) : (
                    <StatusPill>No file</StatusPill>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-md bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">No documents uploaded.</p>
          )}
        </DetailCard>
      </div>
    </div>
  );
};

export default HospitalDetails;
