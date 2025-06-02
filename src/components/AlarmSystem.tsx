
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import * as Tone from 'tone';
import { Volume2, VolumeX, Smartphone, Settings, Play, Pause, X } from 'lucide-react';

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

const DURATION_OPTIONS = [
  { value: 10, label: '10 seconds' },
  { value: 20, label: '20 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 45, label: '45 seconds' },
  { value: 60, label: '60 seconds' },
  { value: -1, label: 'Until stopped' }
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
  const [showSettings, setShowSettings] = useState(false);
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

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('alarmSettings', JSON.stringify(settings));
  }, [settings]);

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
      // Start Tone.js context
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

      // Set duration timeout if not infinite
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
    // Clear any existing synths
    synthsRef.current.forEach(synth => synth.dispose());
    synthsRef.current = [];

    // Create different sound patterns based on selected song
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
      navigator.vibrate(0);
    }

    // Clear duration timeout
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

  const updateSettings = (newSettings: Partial<AlarmSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
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
          {/* Header with settings button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-amber-200">Alarm Controls</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-amber-800/50 text-amber-200 border-amber-600 hover:bg-amber-700/50"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-6 p-4 bg-black/20 rounded-lg border border-amber-500/20">
              <h4 className="text-amber-200 font-medium mb-4">Alarm Settings</h4>
              
              {/* Song Selection */}
              <div className="mb-4">
                <label className="text-sm text-amber-300 mb-2 block">Alarm Sound</label>
                <select
                  value={settings.selectedSong}
                  onChange={(e) => updateSettings({ selectedSong: e.target.value })}
                  className="w-full p-2 rounded bg-amber-900/30 text-amber-100 border border-amber-600/50 focus:border-amber-400"
                >
                  {ALARM_SONGS.map(song => (
                    <option key={song.id} value={song.id}>
                      {song.name} - {song.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Selection */}
              <div className="mb-4">
                <label className="text-sm text-amber-300 mb-2 block">Duration</label>
                <select
                  value={settings.duration}
                  onChange={(e) => updateSettings({ duration: parseInt(e.target.value) })}
                  className="w-full p-2 rounded bg-amber-900/30 text-amber-100 border border-amber-600/50 focus:border-amber-400"
                >
                  {DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Volume Control */}
              <div className="mb-4">
                <label className="text-sm text-amber-300 mb-2 block">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <Slider
                  value={[settings.volume]}
                  onValueChange={([value]) => updateSettings({ volume: value })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Toggle Controls */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ audioEnabled: !settings.audioEnabled })}
                  className={`${
                    settings.audioEnabled 
                      ? 'bg-amber-600 text-white border-amber-400' 
                      : 'bg-zinc-800 text-amber-400 border-zinc-600'
                  }`}
                >
                  {settings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  Audio
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
                  className={`${
                    settings.vibrationEnabled 
                      ? 'bg-amber-600 text-white border-amber-400' 
                      : 'bg-zinc-800 text-amber-400 border-zinc-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Vibrate
                </Button>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isPlaying ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
              <span className="text-amber-300 text-sm">
                {isPlaying ? 'Playing' : 'Paused'} - {ALARM_SONGS.find(s => s.id === settings.selectedSong)?.name}
              </span>
            </div>
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
