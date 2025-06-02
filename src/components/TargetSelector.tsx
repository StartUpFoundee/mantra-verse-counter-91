
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TimerSelector from "./TimerSelector";

interface TargetSelectorProps {
  onSelectTarget: (target: number, timerMinutes?: number) => void;
}

const TargetSelector: React.FC<TargetSelectorProps> = ({ onSelectTarget }) => {
  const [customTarget, setCustomTarget] = useState<string>("");
  const [showTimerSelector, setShowTimerSelector] = useState<boolean>(false);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setCustomTarget(value);
    }
  };

  const handleCustomSubmit = () => {
    const target = parseInt(customTarget, 10);
    if (!isNaN(target) && target > 0) {
      setSelectedTarget(target);
      setShowTimerSelector(true);
    }
  };

  const handlePresetTarget = (target: number) => {
    setSelectedTarget(target);
    setShowTimerSelector(true);
  };

  const handleTimerSelect = (minutes: number) => {
    if (selectedTarget) {
      onSelectTarget(selectedTarget, minutes);
    }
  };

  const handleSkipTimer = () => {
    if (selectedTarget) {
      onSelectTarget(selectedTarget);
    }
  };

  if (showTimerSelector && selectedTarget) {
    return (
      <TimerSelector 
        onSelectTimer={handleTimerSelect}
        onCancel={handleSkipTimer}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6 w-full max-w-md">
      <h2 className="text-2xl font-medium text-amber-400">Select your target count:</h2>
      <div className="grid grid-cols-2 gap-4 w-full">
        <Button 
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 h-12 text-lg font-medium"
          variant="outline" 
          onClick={() => handlePresetTarget(108)}
        >
          108
        </Button>
        <Button 
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 h-12 text-lg font-medium"
          variant="outline" 
          onClick={() => handlePresetTarget(1008)}
        >
          1008
        </Button>
      </div>
      
      <div className="flex items-center gap-2 w-full pt-2">
        <p className="text-lg text-amber-400">Custom:</p>
        <div className="flex flex-1">
          <Input
            className="bg-zinc-800 border-zinc-700 h-12 text-lg font-medium text-white text-center rounded-r-none"
            placeholder="Custom"
            value={customTarget}
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
      
      <div className="mt-6 px-4 py-6 bg-zinc-800/50 border border-zinc-700 rounded-lg w-full">
        <p className="text-center text-gray-300">
          Select a preset target or enter your custom count to begin
        </p>
      </div>
    </div>
  );
};

export default TargetSelector;
