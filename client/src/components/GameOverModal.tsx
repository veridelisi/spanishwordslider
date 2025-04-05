import React from "react";
import { Button } from "@/components/ui/button";

interface GameOverModalProps {
  isGameOver: boolean;
  score: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isGameOver, score, onRestart }) => {
  if (!isGameOver) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-500 font-[Nunito] mb-4">Game Over!</h2>
          <p className="text-xl text-slate-700 mb-2">Your score:</p>
          <p className="text-4xl font-bold text-indigo-600 mb-6">{score}</p>
        </div>
        <div className="border-t border-slate-200 pt-6 mt-2">
          <p className="text-slate-600 mb-6 text-center">
            You've learned some Spanish words! Want to practice more?
          </p>
          <Button
            onClick={onRestart}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
          >
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
