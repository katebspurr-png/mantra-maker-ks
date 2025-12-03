import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AffirmationCard } from "@/components/AffirmationCard";
import { AFFIRMATIONS_LIBRARY } from "@/data/affirmations";
import { AFFIRMATION_CATEGORIES, AffirmationCategory } from "@/types";
import { cn } from "@/lib/utils";

export default function Library() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory | "all">("all");

  const filteredAffirmations = AFFIRMATIONS_LIBRARY.filter((a) => {
    const matchesSearch = a.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRecord = (text: string) => {
    navigate("/new-recording", { state: { prefilledText: text } });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Affirmation Library</h1>
        <p className="text-muted-foreground text-sm mb-4">
          Browse and record powerful affirmations
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
            />
          ))}
          {filteredAffirmations.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No affirmations found
            </p>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
