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
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Add Location</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create state, district, and city records from one place.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-24 rounded-md px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
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
