import React from "react";

const GameInstructions: React.FC = () => {
  return (
    <div className="bg-indigo-50 px-6 py-4 border-t border-indigo-100">
      <h3 className="font-semibold text-indigo-700 mb-2">How to Play:</h3>
      <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
        <li>Spanish words will slide from right to left</li>
        <li>Type the word correctly in the input field</li>
        <li>Each correct letter will highlight in the sliding word</li>
        <li>Complete words before they disappear to score points</li>
        <li>Game ends if a word slides off the screen</li>
      </ul>
    </div>
  );
};

export default GameInstructions;
