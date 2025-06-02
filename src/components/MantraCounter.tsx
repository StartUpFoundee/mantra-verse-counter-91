import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SpeechDetection } from "@/utils/speechDetection";
import { AudioFeedback } from "@/utils/audioFeedback";
import TargetSelector from "@/components/TargetSelector";
import CompletionAlert from "@/components/CompletionAlert";
import Timer from "@/components/Timer";
import { Mic, MicOff, Volume, Volume2, VolumeX } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getLifetimeCount, getTodayCount, updateMantraCounts } from "@/utils/indexedDBUtils";
import { recordDailyActivity } from "@/utils/activityUtils";

const MantraCounter: React.FC = () => {
  const [targetCount, setTargetCount] = useState<number | null>(null);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [sensitivityLevel, setSensitivityLevel] = useState<number>(2);
  const [lifetimeCount, setLifetimeCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState<boolean>(true);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [showTimerComplete, setShowTimerComplete] = useState<boolean>(false);
  const speechDetection = useRef<SpeechDetection | null>(null);
  const audioFeedback = useRef<AudioFeedback | null>(null);
  const lastCountTime = useRef<number>(0);
  const mantraInProgress = useRef<boolean>(false);

  // Initialize audio feedback
  useEffect(() => {
    audioFeedback.current = new AudioFeedback();
    
    return () => {
      if (audioFeedback.current) {
        audioFeedback.current.destroy();
      }
    };
  }, []);

  // Load saved counts from IndexedDB on component mount
  useEffect(() => {
    const loadCounts = async () => {
      try {
        setIsLoading(true);
        const lifetime = await getLifetimeCount();
        const today = await getTodayCount();
        
        setLifetimeCount(lifetime);
        setTodayCount(today);
      } catch (error) {
        console.error("Error loading counts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCounts();
  }, []);

  useEffect(() => {
    if (targetCount !== null && currentCount >= targetCount && targetCount > 0) {
      handleCompletion();
    }
  }, [currentCount, targetCount]);

  const handleCompletion = () => {
    if (isListening) {
      stopListening();
    }
    if (audioFeedback.current) {
      audioFeedback.current.playSuccessSound();
    }
    setShowCompletionAlert(true);
  };

  const handleSelectTarget = (target: number, timer?: number) => {
    setTargetCount(target);
    setTimerMinutes(timer || null);
    setCurrentCount(0);
    setShowCompletionAlert(false);
    setShowTimerComplete(false);
  };

  const handleTimerComplete = () => {
    setShowTimerComplete(true);
    toast.success("🔔 Timer completed! Your meditation session is done.", {
      duration: 5000,
    });
  };

  const resetTimer = () => {
    setTimerMinutes(null);
    setShowTimerComplete(false);
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission(true);
      toast.success("Microphone access granted");
      return true;
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      setMicPermission(false);
      toast.error("Microphone access denied. Please enable microphone access in your browser settings.");
      return false;
    }
  };

  const startListening = async () => {
    if (!micPermission) {
      const granted = await requestMicPermission();
      if (!granted) return;
    }
    
    const minDecibelsSettings = [-60, -70, -80];
    
    // Always create a fresh speech detection instance
    if (speechDetection.current) {
      speechDetection.current.stop();
      speechDetection.current = null;
    }
    
    speechDetection.current = new SpeechDetection({
      onSpeechDetected: () => {
        mantraInProgress.current = true;
        setAudioLevel(prev => Math.min(100, prev + 30));
        console.log("Mantra speech detected - waiting for completion");
      },
      onSpeechEnded: () => {
        if (mantraInProgress.current) {
          const now = Date.now();
          if (now - lastCountTime.current > 500) {
            setCurrentCount(count => {
              const newCount = count + 1;
              
              // Play audio feedback
              if (audioFeedbackEnabled && audioFeedback.current) {
                audioFeedback.current.playCounterFeedback(newCount);
              }
              
              // Update counts in IndexedDB and record daily activity
              updateMantraCounts(1).then(({ lifetimeCount: newLifetime, todayCount: newToday }) => {
                setLifetimeCount(newLifetime);
                setTodayCount(newToday);
                // Record daily activity for the calendar
                recordDailyActivity(1);
              }).catch(console.error);
              
              toast.success(`Mantra counted: ${newCount} 🕉️`, {
                duration: 1500,
                style: { background: '#262626', color: '#fcd34d' },
              });
              
              return newCount;
            });
            console.log("Mantra completed and counted");
          }
          lastCountTime.current = now;
          mantraInProgress.current = false;
        }
        setAudioLevel(0);
      },
      minDecibels: minDecibelsSettings[sensitivityLevel]
    });
    
    const started = await speechDetection.current.start();
    if (started) {
      setIsListening(true);
      lastCountTime.current = Date.now();
      toast.success(`🎙️ Listening for mantras (${getSensitivityLabel()} sensitivity)`, {
        style: { background: '#262626', color: '#fcd34d' }
      });
    } else {
      toast.error("Failed to start listening. Please try again.", {
        style: { background: '#262626', color: '#fcd34d' }
      });
    }
  };

  const getSensitivityLabel = () => {
    const labels = ["Low", "Medium", "High"];
    return labels[sensitivityLevel];
  };

  const toggleSensitivity = () => {
    const wasListening = isListening;
    if (wasListening) {
      stopListening();
    }
    
    setSensitivityLevel((prev) => (prev + 1) % 3);
    
    if (wasListening) {
      setTimeout(() => {
        startListening();
      }, 300);
    }
    
    toast.info(`🔊 Microphone sensitivity: ${getSensitivityLabel()}`, {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const toggleAudioFeedback = () => {
    setAudioFeedbackEnabled(prev => !prev);
    toast.info(`🔔 Audio feedback ${!audioFeedbackEnabled ? 'enabled' : 'disabled'}`, {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const stopListening = () => {
    if (speechDetection.current) {
      speechDetection.current.stop();
      speechDetection.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
    mantraInProgress.current = false;
    toast.info("Stopped listening", {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else if (targetCount !== null) {
      startListening();
    }
  };

  const resetCounter = () => {
    if (isListening) {
      stopListening();
    }
    setCurrentCount(0);
    setShowCompletionAlert(false);
    toast.info("Counter reset", {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const handleReset = () => {
    resetCounter();
    setTargetCount(null);
  };

  const progressPercentage = targetCount ? (currentCount / targetCount) * 100 : 0;

  const getSensitivityIcon = () => {
    if (sensitivityLevel === 0) return <Volume className="w-5 h-5" />;
    if (sensitivityLevel === 1) return <Volume2 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  const getAudioFeedbackIcon = () => {
    return audioFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
        <div className="text-amber-400 text-lg mb-4">Loading your spiritual journey...</div>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (targetCount === null) {
    return <TargetSelector onSelectTarget={handleSelectTarget} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
      {timerMinutes && (
        <div className="mb-6 w-full">
          <Timer 
            initialMinutes={timerMinutes}
            onTimerComplete={handleTimerComplete}
            onReset={resetTimer}
            isActive={!showTimerComplete}
          />
        </div>
      )}

      <div className="mb-4 text-center w-full">
        <div className="text-amber-400 text-lg">{currentCount} / {targetCount}</div>
        <div className="text-sm text-gray-400">{Math.round(progressPercentage)}% complete</div>
      </div>
      
      <div className="stats w-full flex gap-4 mb-6">
        <div className="stat flex-1 bg-zinc-800/80 rounded-lg p-3 text-center">
          <h3 className="text-xs text-gray-400">Lifetime</h3>
          <p className="text-lg font-bold text-amber-400">{lifetimeCount}</p>
        </div>
        
        <div className="stat flex-1 bg-zinc-800/80 rounded-lg p-3 text-center">
          <h3 className="text-xs text-gray-400">Today</h3>
          <p className="text-lg font-bold text-amber-400">{todayCount}</p>
        </div>
      </div>
      
      <div className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6">
        <p className="text-center text-gray-400 text-sm">Advertisement</p>
        <p className="text-center text-gray-500 text-xs">Place your ad here</p>
      </div>
      
      <div className="counter-display relative mb-10">
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-amber-500 flex items-center justify-center">
            <div className="text-white text-5xl font-bold">
              <div className="text-3xl mb-2">ॐ</div>
              <div>{currentCount}</div>
            </div>
          </div>
          
          {isListening && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-200 ${
                    audioLevel > i * 15 ? 'bg-white shadow-lg' : 'bg-amber-700'
                  }`} 
                  style={{ 
                    height: `${Math.min(6 + (i * 2), 16) + (audioLevel > i * 15 ? 6 : 0)}px`,
                    animationDelay: `${i * 50}ms`
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleListening}
          className={`absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-amber-500 hover:bg-amber-600'
          } text-black`}
        >
          {isListening ? (
            <MicOff className="w-7 h-7" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>
      
      <div className="text-center mb-5">
        <p className="text-gray-300 text-sm">
          {isListening 
            ? "🎙️ Listening for mantras - Speak clearly with pauses"
            : "Press the microphone to start detecting mantras"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {isListening
            ? "मंत्रों को सुन रहा है - स्पष्ट रूप से बोलें और रुकें"
            : "मंत्र पहचान शुरू करने के लिए माइक्रोफोन दबाएं"}
        </p>
      </div>
      
      <div className="flex gap-3 mb-5">
        <button
          onClick={toggleSensitivity}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-xs font-medium text-amber-400 transition-colors"
        >
          {getSensitivityIcon()}
          <span>{getSensitivityLabel()}</span>
        </button>
        
        <button
          onClick={toggleAudioFeedback}
          className={`flex items-center justify-center gap-2 px-3 py-2 border border-zinc-700 rounded-full text-xs font-medium transition-colors ${
            audioFeedbackEnabled 
              ? 'bg-amber-600 hover:bg-amber-700 text-white' 
              : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400'
          }`}
        >
          {getAudioFeedbackIcon()}
          <span>Sound</span>
        </button>
      </div>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700"
          onClick={resetCounter}
        >
          Reset Count
        </Button>
        <Button 
          variant="outline" 
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700"
          onClick={handleReset}
        >
          Change Target
        </Button>
      </div>

      <CompletionAlert 
        isOpen={showCompletionAlert} 
        targetCount={targetCount} 
        onClose={() => setShowCompletionAlert(false)} 
      />

      {showTimerComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 text-center max-w-sm">
            <h3 className="text-2xl text-orange-600 mb-4">🔔 Timer Complete!</h3>
            <p className="text-gray-700 mb-4">Your meditation session time is up.</p>
            <Button 
              onClick={() => setShowTimerComplete(false)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MantraCounter;
