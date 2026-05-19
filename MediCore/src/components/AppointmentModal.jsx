import { useState } from "react";
import axiosInstance from "../api";

const inputClass =
  "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};

const convertTimeToMinutes = (timeValue) => {
  if (!timeValue) {
    return null;
  }

  const timeParts = timeValue.split(":");

  if (timeParts.length < 2) {
    return null;
  }

  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const convertMinutesToTime = (totalMinutes) => {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const amPm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  const paddedMinutes = String(minutes).padStart(2, "0");

  return `${hours12}:${paddedMinutes} ${amPm}`;
};

const createTimeSlots = (doctor) => {
  const startTime = doctor?.availableTime?.startTime || "";
  const endTime = doctor?.availableTime?.endTime || "";

  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return [];
  }

  const slots = [];

  for (let current = startMinutes; current + 30 <= endMinutes; current += 30) {
    const slotStart = convertMinutesToTime(current);
    const slotEnd = convertMinutesToTime(current + 30);
    slots.push(`${slotStart} - ${slotEnd}`);
  }

  return slots;
};

const AppointmentModal = ({ doctor, user, onClose, onBooked }) => {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const timeSlots = createTimeSlots(doctor);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!date || !timeSlot) {
      setMessage("Please select appointment date and time slot.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axiosInstance.post("/appointment/createAppointment", {
        doctorId: doctor._id,
        hospitalId: doctor.hospitalId?._id || doctor.hospitalId,
        date,
        timeSlot,
      });

      onBooked(response.data.message || "Appointment booked successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              Book appointment
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
              {doctor.doctorName}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {doctor.hospitalId?.hospitalName || "Hospital"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close appointment form"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {message && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              {message}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Patient name
              </span>
              <input
                value={user?.name || ""}
                disabled
                className={`${inputClass} mt-2 opacity-80`}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Patient email
              </span>
              <input
                value={user?.email || ""}
                disabled
                className={`${inputClass} mt-2 opacity-80`}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Appointment date
              </span>
              <input
                type="date"
                min={getTodayDate()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={`${inputClass} mt-2`}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Time slot
              </span>
              <select
                value={timeSlot}
                onChange={(event) => setTimeSlot(event.target.value)}
                className={`${inputClass} mt-2`}
                disabled={timeSlots.length === 0}
              >
                <option value="">
                  {timeSlots.length ? "Select time slot" : "No time slots available"}
                </option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
            <p>
              <span className="font-bold text-slate-900 dark:text-white">Doctor:</span>{" "}
              {doctor.doctorName}
            </p>
            <p className="mt-2">
              <span className="font-bold text-slate-900 dark:text-white">Hospital:</span>{" "}
              {doctor.hospitalId?.hospitalName || "Hospital"}
            </p>
            <p className="mt-2">
              <span className="font-bold text-slate-900 dark:text-white">Status:</span>{" "}
              pending
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || timeSlots.length === 0}
              className="h-11 rounded-md bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
