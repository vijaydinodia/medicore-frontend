import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
  Area,
} from "recharts";

const formatCurrency = (val) => `₹${Number(val).toLocaleString("en-IN")}`;

// Renders category or source data inside a circular donut layout
export const DonutChart = ({ data = [], title = "" }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-400">{title || "No data available"}</p>
        <p className="text-xs text-slate-400 mt-1">₹ 0.00 collected</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {title && <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">{title}</h3>}
      
      <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr] items-center">
        <div className="relative flex justify-center items-center h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#0F766E"} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [formatCurrency(value), "Collected"]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered amount summary inside the donut */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Legend listing values and computed percentages */}
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-slate-950 dark:text-white">{formatCurrency(item.value)}</p>
                  <p className="text-[10px] font-bold text-slate-400">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Renders horizontal bars comparing multiple items (e.g. receptionist earnings)
export const BarChart = ({ data = [], title = "" }) => {
  const hasData = data.length > 0 && data.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-400">{title || "No data available"}</p>
        <p className="text-xs text-slate-400 mt-1">₹ 0.00 collected</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {title && <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">{title}</h3>}
      
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={75}
              tick={{
                fontSize: 10,
                fontWeight: "bold",
                fill: "#94A3B8",
              }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff",
              }}
              formatter={(value) => [formatCurrency(value), "Collected"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#0F766E"} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Renders cumulative chronological trends over a 30-day time window
export const AreaChart = ({ data = [], title = "" }) => {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-400">{title || "No data available"}</p>
      </div>
    );
  }

  const formatXAxis = (tickItem) => {
    try {
      return new Date(tickItem).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return tickItem;
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {title && <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">{title}</h3>}
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F766E" stopOpacity="0.4" />
                <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
              className="dark:stroke-slate-800"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fontWeight: "bold", fill: "#94A3B8" }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
              tick={{ fontSize: 10, fontWeight: "bold", fill: "#94A3B8" }}
              width={55}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff",
              }}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              }
              formatter={(value) => [formatCurrency(value), "Total Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0F766E"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
