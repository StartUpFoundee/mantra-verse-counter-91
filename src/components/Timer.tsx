
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Pause, Play, Square } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface TimerProps {
  initialMinutes: number;
  onTimerComplete: () => void;
  onReset: () => void;
  isActive?: boolean;
}

const Timer: React.FC<TimerProps> = ({ 
  initialMinutes, 
  onTimerComplete, 
  onReset, 
  isActive = true 
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(isActive);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playAlarm();
    toast.success("🔔 Timer completed! Your meditation session is done.", {
      duration: 5000,
    });
    onTimerComplete();
  };

  const playAlarm = () => {
    // Create and play alarm sound
    try {
      const audio = new Audio("https://cdn.freesound.org/previews/221/221683_1015240-lq.mp3");
      alarmAudioRef.current = audio;
      audio.loop = true;
      audio.play().catch(e => console.error("Error playing alarm:", e));
      
      // Stop alarm after 10 seconds
      setTimeout(() => {
        if (alarmAudioRef.current) {
          alarmAudioRef.current.pause();
          alarmAudioRef.current = null;
        }
      }, 10000);
    } catch (error) {
      console.error("Error creating alarm audio:", error);
    }
  };

  const stopAlarm = () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current = null;
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    stopAlarm(); // Stop alarm if running when user interacts
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialMinutes * 60 - timeLeft) / (initialMinutes * 60)) * 100;

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-400" />
        <span className="text-amber-400 font-medium">Meditation Timer</span>
      </div>
      
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-zinc-700"></div>
        <div 
          className="absolute inset-0 w-24 h-24 rounded-full border-4 border-amber-500 transform -rotate-90 transition-all duration-1000"
          style={{
            clipPath: `polygon(50% 50%, 50% 0%, ${progress > 50 ? '100%' : '50%'} 0%, ${progress > 50 ? '100%' : 50 + (progress / 100) * 50 + '%'} ${progress > 50 ? (progress - 50) / 50 * 100 + '%' : '50%'}, ${progress > 50 ? '50%' : '50%'} ${progress > 50 ? '100%' : '50%'}, 50% 50%)`
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-mono text-sm">{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={toggleTimer}
          size="sm"
          variant="outline"
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border-zinc-700"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        
        <Button
          onClick={onReset}
          size="sm"
          variant="outline"
          className="bg-zinc-800 hover:bg-zinc-700 text-gray-400 border-zinc-700"
        >
          <Square className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Timer;
