import { useState } from "react";
import AddCity from "./AddCity";
import AddDistrict from "./AddDistrict";
import AddState from "./AddState";

const AddLocation = () => {
  const [activeTab, setActiveTab] = useState("state");

  const tabs = [
    { id: "state", label: "State" },
    { id: "district", label: "District" },
    { id: "city", label: "City" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Add Location</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create state, district, and city records from one place.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-11 min-w-24 rounded-md px-4 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-teal-700 text-white shadow-sm dark:bg-teal-500 dark:text-slate-950"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "state" && <AddState />}
      {activeTab === "district" && <AddDistrict />}
      {activeTab === "city" && <AddCity />}
    </div>
  );
};

export default AddLocation;
