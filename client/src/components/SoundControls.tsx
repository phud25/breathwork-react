import { useState, useEffect } from "react";
import { Howl } from "howler";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const sounds = {
  "ocean-waves": {
    name: "Ocean Waves",
    url: "/sounds/ocean-waves.mp3"
  },
  "rain": {
    name: "Rain",
    url: "/sounds/rain.mp3"
  },
  "white-noise": {
    name: "White Noise",
    url: "/sounds/white-noise.mp3"
  },
  "meditation": {
    name: "Meditation Music",
    url: "/sounds/meditation.mp3"
  }
};

interface SoundControlsProps {
  isActive?: boolean;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

export function SoundControls({ isActive, isSoundEnabled, onToggleSound }: SoundControlsProps) {
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [sound, setSound] = useState<Howl | null>(null);

  useEffect(() => {
    if (currentSound && isSoundEnabled) {
      const newSound = new Howl({
        src: [sounds[currentSound as keyof typeof sounds].url],
        loop: true,
        volume: volume
      });

      setSound(newSound);
      newSound.play();

      return () => {
        newSound.stop();
        newSound.unload();
      };
    }

    return () => {
      if (sound) {
        sound.stop();
        sound.unload();
      }
    };
  }, [currentSound, isSoundEnabled]);

  useEffect(() => {
    if (sound) {
      sound.volume(volume);
    }
  }, [volume, sound]);

  useEffect(() => {
    if (!isSoundEnabled && sound) {
      sound.stop();
    } else if (isSoundEnabled && sound && currentSound) {
      sound.play();
    }
  }, [isSoundEnabled, sound, currentSound]);

  const handleSoundChange = (value: string) => {
    if (sound) {
      sound.stop();
      sound.unload();
    }
    setCurrentSound(value);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleSound}
        className="h-[48px] hover:bg-transparent"
      >
        {isSoundEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>

      {isSoundEnabled && (
        <>
          <Select
            value={currentSound || ""}
            onValueChange={handleSoundChange}
            disabled={!isActive}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select sound" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sounds).map(([key, sound]) => (
                <SelectItem key={key} value={key}>
                  {sound.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Slider
            className="w-[100px]"
            value={[volume * 100]}
            onValueChange={(value) => setVolume(value[0] / 100)}
            min={0}
            max={100}
            step={1}
            disabled={!currentSound || !isActive}
          />
        </>
      )}
    </div>
  );
}
