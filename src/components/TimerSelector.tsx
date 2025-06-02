
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

interface TimerSelectorProps {
  onSelectTimer: (minutes: number) => void;
  onCancel: () => void;
}

const TimerSelector: React.FC<TimerSelectorProps> = ({ onSelectTimer, onCancel }) => {
  const [customTime, setCustomTime] = useState<string>("");

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setCustomTime(value);
    }
  };

  const handleCustomSubmit = () => {
    const minutes = parseInt(customTime, 10);
    if (!isNaN(minutes) && minutes > 0) {
      onSelectTimer(minutes);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6 w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-6 h-6 text-amber-400" />
        <h2 className="text-xl font-medium text-amber-400">Select your target time:</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full">
        <Button 
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 h-12 text-lg font-medium"
          variant="outline" 
          onClick={() => onSelectTimer(11)}
        >
          11 minutes
        </Button>
        <Button 
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 h-12 text-lg font-medium"
          variant="outline" 
          onClick={() => onSelectTimer(21)}
        >
          21 minutes
        </Button>
      </div>
      
      <div className="flex items-center gap-2 w-full pt-2">
        <p className="text-lg text-amber-400">Custom:</p>
        <div className="flex flex-1">
          <Input
            className="bg-zinc-800 border-zinc-700 h-12 text-lg font-medium text-white text-center rounded-r-none"
            placeholder="Minutes"
            value={customTime}
            onChange={handleCustomChange}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
          />
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-black h-12 rounded-l-none"
            onClick={handleCustomSubmit}
          >
            Set
          </Button>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="bg-zinc-800 hover:bg-zinc-700 text-gray-400 border border-zinc-700 mt-4"
        onClick={onCancel}
      >
        Skip Timer
      </Button>
      
      <div className="mt-4 px-4 py-6 bg-zinc-800/50 border border-zinc-700 rounded-lg w-full">
        <p className="text-center text-gray-300 text-sm">
          Set a meditation timer to receive an alarm when your session time is complete
        </p>
      </div>
    </div>
  );
};

export default TimerSelector;
