import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
  { date: "Feb 10", Flour: 100, Sugar: 50, Eggs: 500, Butter: 20 },
  { date: "Feb 11", Flour: 120, Sugar: 60, Eggs: 450, Butter: 25 },
  { date: "Feb 12", Flour: 90, Sugar: 55, Eggs: 420, Butter: 22 },
  { date: "Feb 13", Flour: 130, Sugar: 75, Eggs: 500, Butter: 30 },
  { date: "Feb 14", Flour: 110, Sugar: 70, Eggs: 450, Butter: 28 },
];

export default function RawIngredientsChart() {
  return (
    <div style={{ width: "100%", height: 400, padding: "20px", background: "#fff", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginBottom: "10px", fontSize: "18px", fontWeight: "bold" }}>📊 Raw Ingredients Stock Over Time</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Flour" stroke="#f39c12" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Sugar" stroke="#e74c3c" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Eggs" stroke="#3498db" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Butter" stroke="#2ecc71" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
