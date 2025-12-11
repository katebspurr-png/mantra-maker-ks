import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckSquare, X, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AffirmationCard } from "@/components/AffirmationCard";
import { AFFIRMATIONS_LIBRARY } from "@/data/affirmations";
import { AFFIRMATION_CATEGORIES, AffirmationCategory } from "@/types";
import { cn } from "@/lib/utils";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";

export default function Library() {
  const navigate = useNavigate();
  const { isPlaying } = useGlobalAudio();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Clear selection when leaving the page
  useEffect(() => {
    return () => {
      setSelectedIds(new Set());
      setSelectionMode(false);
    };
  }, []);

  const filteredAffirmations = AFFIRMATIONS_LIBRARY.filter((a) => {
    const matchesSearch = a.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRecord = (text: string) => {
    navigate("/new-recording", { state: { prefilledText: text } });
  };

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      // Exiting selection mode - clear selections
      setSelectedIds(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const handleBuildScript = () => {
    // Get selected affirmations in their list order (as they appear in filtered results)
    const selectedAffirmations = filteredAffirmations.filter((a) => selectedIds.has(a.id));
    
    // Combine texts with double line breaks for readability
    const combinedScript = selectedAffirmations
      .map((a) => a.text)
      .join("\n\n");

    // Navigate to new recording with combined script
    navigate("/new-recording", { state: { prefilledText: combinedScript } });
    
    // Clear selection state
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-semibold">Affirmation Library</h1>
          <Button
            variant={selectionMode ? "default" : "ghost"}
            size="sm"
            onClick={toggleSelectionMode}
            className="gap-1.5"
          >
            <CheckSquare className="w-4 h-4" />
            {selectionMode ? "Done" : "Select"}
          </Button>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          {selectionMode 
            ? "Tap affirmations to select them for a combined script" 
            : "Browse and record powerful affirmations"}
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search affirmations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            All
          </button>
          {AFFIRMATION_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Affirmations */}
        <div className="space-y-3">
          {filteredAffirmations.map((affirmation) => (
            <AffirmationCard
              key={affirmation.id}
              affirmation={affirmation}
              onRecord={handleRecord}
              showSelection={selectionMode}
              isSelected={selectedIds.has(affirmation.id)}
              onSelectionChange={(selected) => handleSelectionChange(affirmation.id, selected)}
            />
          ))}
          {filteredAffirmations.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No affirmations found
            </p>
          )}
        </div>
      </div>

      {/* Sticky Selection Action Bar */}
      {selectionMode && selectedCount > 0 && (
        <div 
          className={cn(
            "fixed left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3",
            isPlaying ? "bottom-32" : "bottom-16"
          )}
        >
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedCount} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-7 px-2"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Button
              onClick={handleBuildScript}
              className="gap-1.5"
            >
              <FileText className="w-4 h-4" />
              Build Recording Script
            </Button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
