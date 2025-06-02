
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Volume2, VolumeX, Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

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

interface AlarmSettingsDialogProps {
  children: React.ReactNode;
}

const AlarmSettingsDialog: React.FC<AlarmSettingsDialogProps> = ({ children }) => {
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings>(() => {
    const saved = localStorage.getItem('alarmSettings');
    return saved ? JSON.parse(saved) : {
      selectedSong: 'temple-bells',
      duration: 30,
      volume: 0.7,
      vibrationEnabled: true,
      audioEnabled: true
    };
  });

  const updateAlarmSettings = (newSettings: Partial<AlarmSettings>) => {
    const updated = { ...alarmSettings, ...newSettings };
    setAlarmSettings(updated);
    localStorage.setItem('alarmSettings', JSON.stringify(updated));
    toast.success('Alarm settings updated');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
            Alarm Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 px-1">
          {/* Alarm Sound */}
          <div>
            <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">Alarm Sound</Label>
            <Select
              value={alarmSettings.selectedSong}
              onValueChange={(value) => updateAlarmSettings({ selectedSong: value })}
            >
              <SelectTrigger className="bg-white dark:bg-zinc-700 border-gray-200 dark:border-zinc-600">
                <SelectValue placeholder="Select alarm sound" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-800">
                {ALARM_SONGS.map(song => (
                  <SelectItem key={song.id} value={song.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{song.name}</span>
                      <span className="text-xs text-gray-500">{song.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div>
            <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">Duration</Label>
            <Select
              value={alarmSettings.duration.toString()}
              onValueChange={(value) => updateAlarmSettings({ duration: parseInt(value) })}
            >
              <SelectTrigger className="bg-white dark:bg-zinc-700 border-gray-200 dark:border-zinc-600">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-800">
                {DURATION_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volume */}
          <div>
            <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">
              Volume: {Math.round(alarmSettings.volume * 100)}%
            </Label>
            <Slider
              value={[alarmSettings.volume]}
              onValueChange={([value]) => updateAlarmSettings({ volume: value })}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Toggle Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {alarmSettings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Audio</Label>
              </div>
              <Switch
                checked={alarmSettings.audioEnabled}
                onCheckedChange={(checked) => updateAlarmSettings({ audioEnabled: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Vibration</Label>
              </div>
              <Switch
                checked={alarmSettings.vibrationEnabled}
                onCheckedChange={(checked) => updateAlarmSettings({ vibrationEnabled: checked })}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlarmSettingsDialog;
