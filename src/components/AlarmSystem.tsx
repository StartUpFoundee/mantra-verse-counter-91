import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as Tone from 'tone';
import { Play, Pause, Bell } from 'lucide-react';

interface AlarmSystemProps {
  isActive: boolean;
  onStop: () => void;
  targetCount: number;
  completedCount: number;
}

interface AlarmSettings {
  selectedSong: string;
  duration: number;
  volume: number;
  vibrationEnabled: boolean;
  audioEnabled: boolean;
}

const ALARM_SONGS = [
  { id: 'temple-bells', name: 'Temple Bells', description: 'Peaceful temple atmosphere' },
  { id: 'om-chanting', name: 'Om Chanting', description: 'Sacred Om vibrations' },
  { id: 'victory-celebration', name: 'Victory Celebration', description: 'Energetic achievement' },
  { id: 'flute-meditation', name: 'Flute Meditation', description: 'Calming flute sounds' },
  { id: 'devotional-bhajan', name: 'Devotional Bhajan', description: 'Spiritual bhajan melody' },
  { id: 'aarti-celebration', name: 'Aarti Celebration', description: 'Ceremonial aarti music' }
];

const AlarmSystem: React.FC<AlarmSystemProps> = ({
  isActive,
  onStop,
  targetCount,
  completedCount
}) => {
  const [settings, setSettings] = useState<AlarmSettings>({
    selectedSong: 'temple-bells',
    duration: 30,
    volume: 0.7,
    vibrationEnabled: true,
    audioEnabled: true
  });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const synthsRef = useRef<any[]>([]);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes auto-stop

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('alarmSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading alarm settings:', error);
      }
    }
  }, []);

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
  }, [isActive, settings]);

  const startAlarm = async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      setIsPlaying(true);

      if (settings.audioEnabled) {
        startSelectedAlarmSound();
      }

      if (settings.vibrationEnabled && 'vibrate' in navigator) {
        startVibration();
      }

      if (settings.duration > 0) {
        durationTimeoutRef.current = setTimeout(() => {
          stopAlarm();
        }, settings.duration * 1000);
      }
    } catch (error) {
      console.error('Error starting alarm:', error);
    }
  };

  const startSelectedAlarmSound = () => {
    synthsRef.current.forEach(synth => synth.dispose());
    synthsRef.current = [];

    switch (settings.selectedSong) {
      case 'temple-bells':
        createTempleBellsSound();
        break;
      case 'om-chanting':
        createOmChantingSound();
        break;
      case 'victory-celebration':
        createVictoryCelebrationSound();
        break;
      case 'flute-meditation':
        createFluteMeditationSound();
        break;
      case 'devotional-bhajan':
        createDevotionalBhajanSound();
        break;
      case 'aarti-celebration':
        createAartiCelebrationSound();
        break;
      default:
        createTempleBellsSound();
    }
  };

  const createTempleBellsSound = () => {
    const bellSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 1.4, release: 0.2 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).toDestination();

    bellSynth.volume.value = Tone.gainToDb(settings.volume) - 6;
    synthsRef.current = [bellSynth];

    const playPattern = () => {
      bellSynth.triggerAttackRelease('C4', '0.5');
      setTimeout(() => bellSynth.triggerAttackRelease('G4', '0.5'), 500);
      setTimeout(() => bellSynth.triggerAttackRelease('C5', '0.5'), 1000);
    };

    playPattern();
    const interval = setInterval(playPattern, 4000);
    synthsRef.current.push({ dispose: () => clearInterval(interval) } as any);
  };

  const createOmChantingSound = () => {
    const dronesynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0, sustain: 1, release: 1 }
    }).toDestination();

    dronesynth.volume.value = Tone.gainToDb(settings.volume) - 8;
    synthsRef.current = [dronesynth];

    const playOm = () => {
      dronesynth.triggerAttack('C2');
      setTimeout(() => dronesynth.triggerRelease(), 3000);
    };

    playOm();
    const interval = setInterval(playOm, 4000);
    synthsRef.current.push({ dispose: () => clearInterval(interval) } as any);
  };

  const createVictoryCelebrationSound = () => {
    const melodySynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.3, release: 1 }
    }).toDestination();

    melodySynth.volume.value = Tone.gainToDb(settings.volume) - 6;
    synthsRef.current = [melodySynth];

    const victoryNotes = ['C5', 'E5', 'G5', 'C6', 'E6'];
    const playVictory = () => {
      victoryNotes.forEach((note, index) => {
        setTimeout(() => {
          melodySynth.triggerAttackRelease(note, '0.25');
        }, index * 200);
      });
    };

    playVictory();
    const interval = setInterval(playVictory, 3000);
    synthsRef.current.push({ dispose: () => clearInterval(interval) } as any);
  };

  const createFluteMeditationSound = () => {
    const fluteSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.2, decay: 0.1, sustain: 0.8, release: 1.5 }
    }).toDestination();

    fluteSynth.volume.value = Tone.gainToDb(settings.volume) - 10;
    synthsRef.current = [fluteSynth];

    const fluteNotes = ['G4', 'A4', 'C5', 'D5'];
    const playFlute = () => {
      fluteNotes.forEach((note, index) => {
        setTimeout(() => {
          fluteSynth.triggerAttackRelease(note, '0.8');
        }, index * 800);
      });
    };

    playFlute();
    const interval = setInterval(playFlute, 5000);
    synthsRef.current.push({ dispose: () => clearInterval(interval) } as any);
  };

  const createDevotionalBhajanSound = () => {
    const bhajanSynth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 }
    }).toDestination();

    bhajanSynth.volume.value = Tone.gainToDb(settings.volume) - 8;
    synthsRef.current = [bhajanSynth];

    const bhajanPattern = ['C4', 'D4', 'E4', 'G4', 'E4', 'D4', 'C4'];
    const playBhajan = () => {
      bhajanPattern.forEach((note, index) => {
        setTimeout(() => {
          bhajanSynth.triggerAttackRelease(note, '0.4');
        }, index * 400);
      });
    };

    playBhajan();
    const interval = setInterval(playBhajan, 4000);
    synthsRef.current.push({ dispose: () => clearInterval(interval) } as any);
  };

  const createAartiCelebrationSound = () => {
    const aartiSynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.8 }
    }).toDestination();

    aartiSynth.volume.value = Tone.gainToDb(settings.volume) - 6;
    synthsRef.current = [aartiSynth];

    const aartiNotes = ['C5', 'G4', 'C5', 'E5', 'G5', 'E5', 'C5'];
    const playAarti = () => {
      aartiNotes.forEach((note, index) => {
        setTimeout(() => {
          aartiSynth.triggerAttackRelease(note, '0.3');
        }, index * 300);
      });
    };

    playAarti();
    const interval = setInterval(playAarti, 3500);
    synthsRef.current.push({ dispose: () => clearInterval(interval) } as any);
  };

  const startVibration = () => {
    const vibratePattern = () => {
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200]);
      }
    };

    vibratePattern();
    vibrationIntervalRef.current = setInterval(vibratePattern, 1400);
  };

  const startAutoStopTimer = () => {
    setTimeLeft(120);
    autoStopTimeoutRef.current = setTimeout(() => {
      onStop();
    }, 120000);

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
    setIsPlaying(false);
    
    synthsRef.current.forEach(synth => {
      if (synth.dispose) synth.dispose();
    });
    synthsRef.current = [];

    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }

    if (durationTimeoutRef.current) {
      clearTimeout(durationTimeoutRef.current);
      durationTimeoutRef.current = null;
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
    }, 60000);
  };

  if (!isActive) return null;

  const currentSong = ALARM_SONGS.find(s => s.id === settings.selectedSong);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-500/90 to-red-600/90 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4">
        {/* Bell Icon */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <Bell className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">TARGET COMPLETED!</h1>
            <p className="text-lg text-white/90">{completedCount} / {targetCount}</p>
            <p className="text-white/80 mt-2">Om Shanti, Shanti, Shanti</p>
          </div>

          {/* Current Status */}
          <div className="text-center mb-6 p-3 bg-black/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isPlaying ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-white/60" />}
              <span className="text-white/90 text-sm">
                {isPlaying ? 'Playing' : 'Paused'} - {currentSong?.name}
              </span>
            </div>
            <p className="text-white/70 text-sm">Auto-stop in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
          </div>

          {/* Main Actions */}
          <div className="space-y-3">
            <Button
              onClick={onStop}
              className="w-full h-14 text-xl font-bold bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl"
            >
              STOP ALARM
            </Button>

            <Button
              onClick={handleSnooze}
              variant="outline"
              className="w-full h-12 bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-xl"
            >
              Snooze (1 minute)
            </Button>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-6">
          <p className="text-white/90 text-sm">🙏 Congratulations on completing your spiritual practice!</p>
          <p className="text-white/70 text-xs mt-1">आपने अपना आध्यात्मिक अभ्यास पूरा किया है!</p>
        </div>
      </div>
    </div>
  );
};

export default AlarmSystem;
