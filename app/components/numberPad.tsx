"use client";

import React from 'react';

interface NumberPadProps {
  onNumberPress: (num: string) => void;
  onDelete: () => void;
}

export default function NumberPad({ onNumberPress, onDelete }: NumberPadProps) {
  const keys = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    [".", "0", "<"],
  ];

  return (
    <div className="bg-white rounded-3xl p-4 shadow-inner">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-between mb-2 last:mb-0">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => (key === "<" ? onDelete() : onNumberPress(key))}
              className="w-20 h-16 text-2xl font-semibold text-gray-700 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}