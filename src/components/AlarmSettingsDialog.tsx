
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Bell, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface AlarmSettingsDialogProps {
  children: React.ReactNode;
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

const AlarmSettingsDialog: React.FC<AlarmSettingsDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  
  // Alarm settings state
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Alarm Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Alarm Sound */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Alarm Sound</Label>
            <Select
              value={alarmSettings.selectedSong}
              onValueChange={(value) => updateAlarmSettings({ selectedSong: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alarm sound" />
              </SelectTrigger>
              <SelectContent>
                {ALARM_SONGS.map(song => (
                  <SelectItem key={song.id} value={song.id}>
                    {song.name} - {song.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Duration</Label>
            <Select
              value={alarmSettings.duration.toString()}
              onValueChange={(value) => updateAlarmSettings({ duration: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
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
            <Label className="text-sm font-medium mb-2 block">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {alarmSettings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <Label className="text-sm font-medium">Audio</Label>
              </div>
              <Switch
                checked={alarmSettings.audioEnabled}
                onCheckedChange={(checked) => updateAlarmSettings({ audioEnabled: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <Label className="text-sm font-medium">Vibration</Label>
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
