import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";

interface FavoritePatternsProps {
  currentPattern: {
    name: string;
    sequence: number[];
  };
  onPatternSelect: (pattern: { name: string; sequence: number[] }) => void;
}

export function FavoritePatterns({ currentPattern, onPatternSelect }: FavoritePatternsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [patternName, setPatternName] = useState("");
  const { favorites, saveFavorite, deleteFavorite } = useFavorites();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await saveFavorite({
        name: patternName,
        sequence: currentPattern.sequence,
      });
      setIsOpen(false);
      setPatternName("");
      toast({
        title: "Pattern saved",
        description: "Your breathing pattern has been saved to favorites.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFavorite(id);
      toast({
        title: "Pattern deleted",
        description: "The breathing pattern has been removed from favorites.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-[48px] hover:bg-transparent">
            <Star className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Pattern</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Pattern name"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
            />
            <Button onClick={handleSave} disabled={!patternName}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {favorites && favorites.length > 0 && (
        <Select
          onValueChange={(value) => {
            const pattern = favorites.find((f) => f.id === parseInt(value));
            if (pattern) {
              onPatternSelect({
                name: pattern.name,
                sequence: pattern.sequence as number[],
              });
            }
          }}
        >
          <SelectTrigger className="bg-slate-800 border-slate-600 text-white hover:border-primary/50 transition-colors h-[48px]">
            <SelectValue placeholder="Saved Patterns" className="text-white" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {favorites.map((pattern) => (
              <div key={pattern.id} className="flex items-center justify-between">
                <SelectItem
                  value={pattern.id.toString()}
                  className="text-white hover:bg-primary/10 flex-grow"
                >
                  {pattern.name}
                </SelectItem>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(pattern.id);
                  }}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}