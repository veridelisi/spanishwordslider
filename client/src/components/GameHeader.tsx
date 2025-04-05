import React from "react";

const GameHeader: React.FC = () => {
  return (
    <header className="w-full max-w-4xl text-center mb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 font-[Nunito] mb-2">
        Spanish Word Slider
      </h1>
      <p className="text-slate-600 max-w-xl mx-auto">
        Type the Spanish words before they disappear from the screen!
      </p>
    </header>
  );
};

export default GameHeader;
