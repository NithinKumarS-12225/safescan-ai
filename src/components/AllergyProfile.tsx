import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { AllergenId } from "../types";

interface Allergen {
  id: AllergenId;
  label: string;
}

const ALLERGENS: Allergen[] = [
  { id: "dairy", label: "Dairy" },
  { id: "gluten", label: "Gluten" },
  { id: "peanuts", label: "Peanuts" },
  { id: "soy", label: "Soy" },
  { id: "shellfish", label: "Shellfish" },
];

interface AllergyProfileProps {
  selectedAllergens: AllergenId[];
  onToggle: (id: AllergenId) => void;
  profileName: string;
}

export function AllergyProfile({ selectedAllergens, onToggle, profileName }: AllergyProfileProps) {
  return (
    <section className="space-y-4" aria-labelledby="allergy-heading">
      <div className="flex items-center justify-between">
        <h2 id="allergy-heading" className="text-sm font-black uppercase tracking-[0.2em] text-alert">
          {profileName} Profile Adjustments
        </h2>
        <span className="text-xs font-mono text-slate-500">
          {selectedAllergens.length} ACTIVE
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ALLERGENS.map((allergen) => {
          const isActive = selectedAllergens.includes(allergen.id);
          return (
            <button
              key={allergen.id}
              onClick={() => onToggle(allergen.id)}
              aria-pressed={isActive}
              className={`
                chip-transition flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-extrabold
                ${isActive 
                  ? "bg-safe text-navy ring-4 ring-safe/10 border-transparent" 
                  : "bg-navy border-2 border-slate-800 text-slate-400 hover:border-slate-600"
                }
              `}
            >
              <div className={`
                h-2 w-2 rounded-full transition-colors
                ${isActive ? "bg-navy" : "bg-slate-700"}
              `} />
              {allergen.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
