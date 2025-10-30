import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./App.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function App() {
  const [entry, setEntry] = useState("");
  const [emotion, setEmotion] = useState("");
  const [entries, setEntries] = useState([]);
  const [filterDate, setFilterDate] = useState("");

  const backendURL = "http://127.0.0.1:8000";

  const analyzeEntry = async () => {
    if (!entry.trim()) return alert("Please write something first!");

    const today = new Date().toISOString().split("T")[0];
    const response = await axios.post(`${backendURL}/analyze`, {
      text: entry,
      date: today,
    });

    const detectedEmotion = response.data.emotion;
    setEmotion(detectedEmotion);

    await axios.post(`${backendURL}/save_entry`, {
      text: entry,
      date: today,
      emotion: detectedEmotion,
    });

    setEntry("");
    fetchEntries();
  };

  const fetchEntries = async () => {
    const res = await axios.get(`${backendURL}/get_entries`);
    setEntries(res.data.entries);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const filteredEntries = filterDate
    ? entries.filter((e) => e.date === filterDate)
    : entries;

  const emotionCounts = filteredEntries.reduce((acc, e) => {
    const detected = e.emotion || "Unknown";
    acc[detected] = (acc[detected] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(emotionCounts),
    datasets: [
      {
        label: "Emotion Frequency",
        data: Object.values(emotionCounts),
        backgroundColor: [
          "#FF6B6B",
          "#4ECDC4",
          "#FFD93D",
          "#1A535C",
          "#FF9F1C",
          "#6A4C93",
        ],
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="app-container">
      <div className="journal-card">
        <h1>✨ My AI Emotion Journal</h1>

        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="How are you feeling today?"
          className="journal-input"
        />

        <button onClick={analyzeEntry} className="analyze-btn">
          Analyze & Save 💭
        </button>

        {emotion && (
          <h2 className="emotion-display">
            Detected Emotion: <span>{emotion}</span>
          </h2>
        )}

        <div className="filter-section">
          <label>📅 Filter by Date: </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div className="entries-section">
          <h2>🧾 Your Journal Entries</h2>
          {filteredEntries.length === 0 ? (
            <p>No entries found.</p>
          ) : (
            <ul className="entries-list">
              {filteredEntries.map((e, i) => (
                <li key={i} className="entry-item">
                  <div className="entry-date">{e.date}</div>
                  <div className="entry-text">{e.text}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="chart-section">
          <h2>📊 Mood Overview</h2>
          <Bar data={chartData} />
        </div>
      </div>
    </div>
  );
}

export default App;
