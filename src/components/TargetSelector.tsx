
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Target } from "lucide-react";

interface TargetSelectorProps {
  onSelectTarget: (target: number, timerMinutes?: number) => void;
}

const TargetSelector: React.FC<TargetSelectorProps> = ({ onSelectTarget }) => {
  const [customTarget, setCustomTarget] = useState<string>("");
  const [customTimer, setCustomTimer] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<"count" | "timer" | null>(null);

  const handleCustomTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomTarget(value);
    }
  };

  const handleCustomTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomTimer(value);
    }
  };

  const handleCustomTargetSubmit = () => {
    const target = parseInt(customTarget, 10);
    if (!isNaN(target) && target > 0) {
      onSelectTarget(target);
    }
  };

  const handleCustomTimerSubmit = () => {
    const minutes = parseInt(customTimer, 10);
    if (!isNaN(minutes) && minutes > 0) {
      // For timer-only mode, we set a high target count that's unlikely to be reached
      onSelectTarget(99999, minutes);
    }
  };

  const handlePresetTarget = (target: number) => {
    onSelectTarget(target);
  };

  const handlePresetTimer = (minutes: number) => {
    // For timer-only mode, we set a high target count that's unlikely to be reached
    onSelectTarget(99999, minutes);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6 w-full max-w-md">
      <h2 className="text-2xl font-medium text-amber-400 text-center">Choose your meditation style:</h2>
      
      {/* Mode Selection */}
      <div className="flex gap-4 w-full">
        <Button
          variant={selectedMode === "count" ? "default" : "outline"}
          className={`flex-1 h-16 flex flex-col items-center gap-1 ${
            selectedMode === "count" 
              ? "bg-amber-500 hover:bg-amber-600 text-black" 
              : "bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700"
          }`}
          onClick={() => setSelectedMode("count")}
        >
          <Target className="w-5 h-5" />
          <span className="text-sm">Count Target</span>
        </Button>
        <Button
          variant={selectedMode === "timer" ? "default" : "outline"}
          className={`flex-1 h-16 flex flex-col items-center gap-1 ${
            selectedMode === "timer" 
              ? "bg-amber-500 hover:bg-amber-600 text-black" 
              : "bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700"
          }`}
          onClick={() => setSelectedMode("timer")}
        >
          <Clock className="w-5 h-5" />
          <span className="text-sm">Time Target</span>
        </Button>
      </div>

      {selectedMode === "count" && (
        <div className="w-full space-y-4">
          <h3 className="text-lg text-amber-400 text-center">Select target count:</h3>
          
          {/* Preset Count Options */}
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
          
          {/* Custom Count Input */}
          <div className="flex items-center gap-2 w-full pt-2">
            <p className="text-lg text-amber-400">Custom:</p>
            <div className="flex flex-1">
              <Input
                className="bg-zinc-800 border-zinc-700 h-12 text-lg font-medium text-white text-center rounded-r-none"
                placeholder="Custom count"
                value={customTarget}
                onChange={handleCustomTargetChange}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomTargetSubmit()}
              />
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-black h-12 rounded-l-none"
                onClick={handleCustomTargetSubmit}
              >
                Set
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedMode === "timer" && (
        <div className="w-full space-y-4">
          <h3 className="text-lg text-amber-400 text-center">Select meditation time:</h3>
          
          {/* Preset Timer Options */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button 
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 h-12 text-lg font-medium"
              variant="outline" 
              onClick={() => handlePresetTimer(11)}
            >
              11 minutes
            </Button>
            <Button 
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 h-12 text-lg font-medium"
              variant="outline" 
              onClick={() => handlePresetTimer(21)}
            >
              21 minutes
            </Button>
          </div>
          
          {/* Custom Timer Input */}
          <div className="flex items-center gap-2 w-full pt-2">
            <p className="text-lg text-amber-400">Custom:</p>
            <div className="flex flex-1">
              <Input
                className="bg-zinc-800 border-zinc-700 h-12 text-lg font-medium text-white text-center rounded-r-none"
                placeholder="Minutes"
                value={customTimer}
                onChange={handleCustomTimerChange}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomTimerSubmit()}
              />
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-black h-12 rounded-l-none"
                onClick={handleCustomTimerSubmit}
              >
                Set
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {!selectedMode && (
        <div className="mt-6 px-4 py-6 bg-zinc-800/50 border border-zinc-700 rounded-lg w-full">
          <p className="text-center text-gray-300">
            Choose between counting mantras to a target number or meditating for a set amount of time
          </p>
        </div>
      )}

      {selectedMode && (
        <div className="mt-4 px-4 py-6 bg-zinc-800/50 border border-zinc-700 rounded-lg w-full">
          <p className="text-center text-gray-300 text-sm">
            {selectedMode === "count" 
              ? "Select a preset target or enter your custom count to begin" 
              : "Set a meditation timer to receive an alarm when your session time is complete"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TargetSelector;
