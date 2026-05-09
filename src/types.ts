export type AllergenId = 'dairy' | 'gluten' | 'peanuts' | 'soy' | 'shellfish';

export interface Profile {
  id: string;
  name: string;
  allergens: AllergenId[];
  color: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  status: 'Green' | 'Yellow' | 'Red';
  safe: boolean;
  reasoning: string;
  found_allergens: string[];
  additive_breakdown: { code: string; name: string; impact: string }[];
  alternative_suggestion: string;
  image?: string;
}

export const INITIAL_PROFILES: Profile[] = [
  { id: 'personal', name: 'Personal', allergens: [], color: '#22C55E' },
  { id: 'child', name: 'Child', allergens: [], color: '#F59E0B' },
  { id: 'guest', name: 'Guest', allergens: [], color: '#3B82F6' },
];
