
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as Tone from 'tone';
import { Volume2, VolumeX, Smartphone } from 'lucide-react';

interface AlarmSystemProps {
  isActive: boolean;
  onStop: () => void;
  targetCount: number;
  completedCount: number;
}

const AlarmSystem: React.FC<AlarmSystemProps> = ({
  isActive,
  onStop,
  targetCount,
  completedCount
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const synthsRef = useRef<any[]>([]);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes auto-stop

  useEffect(() => {
    if (isActive) {
      startAlarm();
      startAutoStopTimer();
    } else {
      stopAlarm();
      stopAutoStopTimer();
    }

    return () => {
      stopAlarm();
      stopAutoStopTimer();
    };
  }, [isActive]);

  const startAlarm = async () => {
    try {
      // Start Tone.js context
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      if (audioEnabled) {
        startSpiritualAlarmSounds();
      }

      if (vibrationEnabled && 'vibrate' in navigator) {
        startVibration();
      }
    } catch (error) {
      console.error('Error starting alarm:', error);
    }
  };

  const startSpiritualAlarmSounds = () => {
    // Clear any existing synths
    synthsRef.current.forEach(synth => synth.dispose());
    synthsRef.current = [];

    // Temple Bell Layer - Using MetalSynth with correct properties
    const bellSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 1.4,
        release: 0.2
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).toDestination();

    // Victory Melody Layer - Uplifting spiritual tune
    const melodySynth = new Tone.Synth({
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.3,
        release: 1
      }
    }).toDestination();

    // Harmonic Drone Layer - Continuous background tone
    const droneSynth = new Tone.Synth({
      oscillator: {
        type: 'sawtooth'
      },
      envelope: {
        attack: 0.1,
        decay: 0,
        sustain: 1,
        release: 1
      }
    }).toDestination();

    synthsRef.current = [bellSynth, melodySynth, droneSynth];

    // Set volumes to maximum (but safe levels)
    bellSynth.volume.value = -6; // Loud but not ear-damaging
    melodySynth.volume.value = -8;
    droneSynth.volume.value = -12;

    // Start the spiritual alarm sequence
    const playAlarmSequence = () => {
      // Temple bells pattern
      bellSynth.triggerAttackRelease('C4', '0.5');
      setTimeout(() => bellSynth.triggerAttackRelease('G4', '0.5'), 500);
      setTimeout(() => bellSynth.triggerAttackRelease('C5', '0.5'), 1000);

      // Victory melody
      const victoryNotes = ['C5', 'E5', 'G5', 'C6'];
      victoryNotes.forEach((note, index) => {
        setTimeout(() => {
          melodySynth.triggerAttackRelease(note, '0.25');
        }, 1500 + (index * 200));
      });

      // Continuous drone
      droneSynth.triggerAttack('C2');
      setTimeout(() => droneSynth.triggerRelease(), 3000);
    };

    // Play immediately and loop every 4 seconds
    playAlarmSequence();
    const alarmInterval = setInterval(playAlarmSequence, 4000);

    // Store interval for cleanup
    synthsRef.current.push({ dispose: () => clearInterval(alarmInterval) } as any);
  };

  const startVibration = () => {
    const vibratePattern = () => {
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200]); // 500ms ON, 200ms OFF pattern
      }
    };

    vibratePattern();
    vibrationIntervalRef.current = setInterval(vibratePattern, 1400); // Repeat every 1.4 seconds
  };

  const startAutoStopTimer = () => {
    setTimeLeft(120);
    autoStopTimeoutRef.current = setTimeout(() => {
      onStop();
    }, 120000); // 2 minutes

    // Update countdown
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopAlarm = () => {
    // Stop all audio
    synthsRef.current.forEach(synth => {
      if (synth.dispose) synth.dispose();
    });
    synthsRef.current = [];

    // Stop vibration
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0); // Stop any ongoing vibration
    }
  };

  const stopAutoStopTimer = () => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
  };

  const handleSnooze = () => {
    stopAlarm();
    setTimeout(() => {
      if (isActive) startAlarm();
    }, 60000); // 1 minute snooze
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-900/95 to-orange-900/95 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4">
        {/* Main celebration message */}
        <div className="text-center mb-8 animate-pulse">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            TARGET COMPLETED!
          </h1>
          <div className="text-2xl text-amber-200 mb-4">
            {completedCount} / {targetCount}
          </div>
          <p className="text-xl text-amber-300">
            Om Shanti, Shanti, Shanti
          </p>
        </div>

        {/* Controls */}
        <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm border border-amber-400/30">
          {/* Audio and Vibration toggles */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`${
                audioEnabled 
                  ? 'bg-amber-600 text-white border-amber-400' 
                  : 'bg-zinc-800 text-amber-400 border-zinc-600'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Audio
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className={`${
                vibrationEnabled 
                  ? 'bg-amber-600 text-white border-amber-400' 
                  : 'bg-zinc-800 text-amber-400 border-zinc-600'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Vibrate
            </Button>
          </div>

          {/* Auto-stop countdown */}
          <div className="text-center mb-6">
            <p className="text-amber-300 text-sm mb-2">Auto-stop in:</p>
            <p className="text-2xl font-mono text-amber-100">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* Main stop button */}
          <Button
            onClick={onStop}
            className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white mb-4 animate-pulse"
          >
            STOP ALARM
          </Button>

          {/* Snooze button */}
          <Button
            onClick={handleSnooze}
            variant="outline"
            className="w-full bg-amber-800/50 text-amber-200 border-amber-600 hover:bg-amber-700/50"
          >
            Snooze (1 minute)
          </Button>
        </div>

        {/* Achievement message */}
        <div className="text-center mt-6">
          <p className="text-amber-200">
            🙏 Congratulations on completing your spiritual practice!
          </p>
          <p className="text-amber-300 text-sm mt-2">
            आपने अपना आध्यात्मिक अभ्यास पूरा किया है!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlarmSystem;
