import React, { useState } from "react";

const modes = [
  { label: "Analysis", description: "Learn with AI insights", icon: "🧠" },
  { label: "Quick", description: "Fast gameplay", icon: "⚡" },
];
const boardSizes = [
  { label: "9x9", description: "Beginner" },
  { label: "13x13", description: "Intermediate" },
  { label: "17x17", description: "Advanced" },
];
const colors = [
  { label: "Black", description: "First to play", icon: "⚫" },
  { label: "White", description: "Second to play", icon: "⚪" },
];
const difficulties = [
  { label: "Easy" },
  { label: "Medium" },
  { label: "Hard" },
];

export default function GameConfig() {
  const [mode, setMode] = useState("Analysis");
  const [boardSize, setBoardSize] = useState("9x9");
  const [color, setColor] = useState("Black");
  const [difficulty, setDifficulty] = useState("Easy");

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-center mb-2">Configure Your Game</h2>
      {/* Mode */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Mode</h3>
        <div className="grid grid-cols-2 gap-4">
          {modes.map((m) => (
            <button
              key={m.label}
              onClick={() => setMode(m.label)}
              className={`flex flex-col items-center border rounded-xl p-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                mode === m.label
                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
              aria-pressed={mode === m.label}
            >
              <span className="text-2xl mb-1" aria-hidden>{m.icon}</span>
              <span className="font-medium">{m.label}</span>
              <span className="text-xs text-gray-500 mt-1">{m.description}</span>
            </button>
          ))}
        </div>
      </section>
      {/* Board Size */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Board Size</h3>
        <div className="grid grid-cols-3 gap-4">
          {boardSizes.map((b) => (
            <button
              key={b.label}
              onClick={() => setBoardSize(b.label)}
              className={`flex flex-col items-center border rounded-xl p-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                boardSize === b.label
                  ? "border-yellow-500 bg-yellow-50 text-yellow-700 shadow"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
              aria-pressed={boardSize === b.label}
            >
              <span className="font-medium">{b.label}</span>
              <span className="text-xs text-gray-500 mt-1">{b.description}</span>
            </button>
          ))}
        </div>
      </section>
      {/* Your Color */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Your Color</h3>
        <div className="grid grid-cols-2 gap-4">
          {colors.map((c) => (
            <button
              key={c.label}
              onClick={() => setColor(c.label)}
              className={`flex flex-col items-center border rounded-xl p-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                color === c.label
                  ? "border-black bg-gray-100 text-black shadow"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
              aria-pressed={color === c.label}
            >
              <span className="text-2xl mb-1" aria-hidden>{c.icon}</span>
              <span className="font-medium">{c.label}</span>
              <span className="text-xs text-gray-500 mt-1">{c.description}</span>
            </button>
          ))}
        </div>
      </section>
      {/* AI Difficulty */}
      <section>
        <h3 className="text-lg font-semibold mb-2">AI Difficulty</h3>
        <div className="grid grid-cols-3 gap-4">
          {difficulties.map((d) => (
            <button
              key={d.label}
              onClick={() => setDifficulty(d.label)}
              className={`border rounded-xl p-3 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                difficulty === d.label
                  ? d.label === "Easy"
                    ? "border-green-600 bg-green-50 text-green-700 shadow"
                    : d.label === "Medium"
                    ? "border-yellow-600 bg-yellow-50 text-yellow-700 shadow"
                    : "border-red-600 bg-red-50 text-red-700 shadow"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
              aria-pressed={difficulty === d.label}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>
      <button className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500">
        Start Game
      </button>
    </div>
  );
}
