import React from 'react';
import { Button } from "@/components/ui/button";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  disabled?: boolean;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onSpace,
  disabled = false
}) => {
  // Common Spanish keyboard layout
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  // Spanish accented characters
  const accentedChars = ['á', 'é', 'í', 'ó', 'ú', 'ü'];

  return (
    <div className="virtual-keyboard w-full bg-slate-100 p-2 rounded-lg shadow-inner border border-slate-200">
      <div className="text-xs text-slate-500 mb-1 text-center">Virtual Keyboard</div>
      
      {/* Main keyboard */}
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 mb-1">
          {row.map((key) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-sm sm:text-base"
              onClick={() => onKeyPress(key)}
              disabled={disabled}
            >
              {key}
            </Button>
          ))}
        </div>
      ))}
      
      {/* Accented characters row */}
      <div className="flex justify-center gap-1 mb-1">
        {accentedChars.map((key) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-sm sm:text-base bg-slate-50"
            onClick={() => onKeyPress(key)}
            disabled={disabled}
          >
            {key}
          </Button>
        ))}
      </div>
      
      {/* Bottom row */}
      <div className="flex justify-center gap-1">
        <Button
          variant="outline"
          className="text-xs p-1 h-8 sm:h-10"
          onClick={onBackspace}
          disabled={disabled}
        >
          Backspace
        </Button>
        <Button
          variant="outline"
          className="flex-grow h-8 sm:h-10"
          onClick={onSpace}
          disabled={disabled}
        >
          Space
        </Button>
      </div>
    </div>
  );
};

export default VirtualKeyboard;