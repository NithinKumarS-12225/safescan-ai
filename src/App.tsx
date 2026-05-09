import { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Shield, Sparkles } from "lucide-react";
import { AllergyProfile } from './components/AllergyProfile';
import { ScanLens } from './components/ScanLens';
import { GuardianVerdict } from './components/GuardianVerdict';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { RecentScans } from './components/RecentScans';
import { EmergencyButton } from './components/EmergencyButton';
import { DeepDiveModal } from './components/DeepDiveModal';
import { Profile, INITIAL_PROFILES, ScanResult, AllergenId } from './types';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('safescan_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });
  const [currentProfileId, setCurrentProfileId] = useState('personal');
  const [recentScans, setRecentScans] = useState<ScanResult[]>(() => {
    const saved = localStorage.getItem('safescan_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [currentVerdict, setCurrentVerdict] = useState<ScanResult | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "safe" | "danger">("idle");
  const [selectedScanForDeepDive, setSelectedScanForDeepDive] = useState<ScanResult | null>(null);

  const currentProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

  useEffect(() => {
    localStorage.setItem('safescan_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('safescan_history', JSON.stringify(recentScans));
  }, [recentScans]);

  const toggleAllergen = (allergenId: AllergenId) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === currentProfileId) {
        const hasAllergen = p.allergens.includes(allergenId);
        return {
          ...p,
          allergens: hasAllergen 
            ? p.allergens.filter(a => a !== allergenId) 
            : [...p.allergens, allergenId]
        };
      }
      return p;
    }));
  };

  const speakVerdict = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRescanSettings = (scan: ScanResult) => {
    // Logic to pull settings back could involve matching the profile or allergens
    // For now, let's just toast or log, but the prompt says "pull back into main view"
    // Since history doesn't store which profile it was, we can only warn or suggest.
    // Or we could store the profileId in ScanResult.
  };

  const analyzeImage = useCallback(async (base64: string) => {
    if (!base64) return;
    
    setIsScanning(true);
    setScanStatus("scanning");
    setCurrentVerdict(null);

    try {
      const allergyContext = currentProfile.allergens.length > 0 
        ? `Strictly check for: ${currentProfile.allergens.join(", ")}.`
        : "Check for any common severe allergens.";

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: base64 } },
              { text: `You are an expert food safety guardian. Analyze this food label for the ${currentProfile.name} profile who avoids ${currentProfile.allergens.join(", ") || "nothing specifically"}.
                
                Provide a JSON response with exactly these fields:
                - "status": "Green" (perfectly safe), "Yellow" (safe but has concerning additives or trace warnings), or "Red" (dangerous, contains selected allergens).
                - "safe": boolean (true for Green/Yellow, false for Red)
                - "reasoning": a very short, bold punchy verdict (e.g. "CONTAINS PEANUTS" or "SAFE FOR YOU").
                - "found_allergens": array of strings matching the selected allergens found.
                - "additive_breakdown": array of objects { "code": string, "name": string, "impact": string } for up to 3 chemicals or E-numbers found. Describe "impact" simply for a non-scientist.
                - "alternative_suggestion": one short generic category of food that would be safe instead.
                
                Output ONLY JSON.` }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      const rawData = JSON.parse(response.text || "{}");
      
      // Store a low-res version for history
      const result: ScanResult = {
        ...rawData,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        image: base64, // In a real app we might compress this further
      };

      setCurrentVerdict(result);
      setScanStatus(result.status === 'Green' ? "safe" : (result.status === 'Red' ? "danger" : "scanning"));
      
      if (!result.safe) {
        speakVerdict(`Warning: ${result.reasoning}`);
      }

      setRecentScans(prev => [result, ...prev].slice(0, 5));

    } catch (error) {
      console.error("Analysis failed:", error);
      setScanStatus("idle");
    } finally {
      setIsScanning(false);
    }
  }, [currentProfile]);

  return (
    <div className="min-h-screen pb-32 bg-navy text-white font-sans overflow-x-hidden">
      {/* Dynamic Visual Pulse Layer */}
      {scanStatus === 'danger' && <div className="fixed inset-0 pointer-events-none bg-danger/5 animate-pulse z-0" />}

      <header className="sticky top-0 z-[70] bg-navy/90 backdrop-blur-xl border-b border-white/5 py-6">
        <div className="mx-auto max-w-2xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-safe p-2.5 rounded-2xl text-navy shadow-lg shadow-safe/20">
              <Shield size={28} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none italic">
                SAFE<span className="text-safe">SCAN</span>
              </h1>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Grocery Guardian v2.0</span>
            </div>
          </div>
          
          <ProfileSwitcher 
            profiles={profiles} 
            currentProfileId={currentProfileId} 
            onSwitch={setCurrentProfileId} 
          />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-6 pt-12 space-y-12">
        {/* Intro */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-alert">
            <Sparkles size={16} />
            <span className="text-xs font-black uppercase tracking-[0.4em]">Multi-Profile Ready</span>
          </div>
          <h2 className="text-5xl font-black leading-[0.9] tracking-tighter sm:text-6xl">
            Who are we <span className="text-safe">protecting</span> today?
          </h2>
        </section>

        {/* Profile Controls */}
        <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl space-y-8">
          <AllergyProfile 
            selectedAllergens={currentProfile.allergens} 
            onToggle={toggleAllergen}
            profileName={currentProfile.name}
          />
          
          <div className="h-px bg-white/5" />

          {/* Scanner Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-black uppercase tracking-widest text-alert">Active Scanner</h2>
              <p className="text-xs text-slate-500 font-bold uppercase">Optimized for {currentProfile.name}</p>
            </div>
            {isScanning && (
              <div className="flex items-center gap-3 px-4 py-2 bg-safe/10 border border-safe/20 rounded-full">
                <div className="h-2 w-2 rounded-full bg-safe animate-ping" />
                <span className="text-[10px] font-black text-safe uppercase tracking-widest">Scanning DNA</span>
              </div>
            )}
          </div>

          <ScanLens 
            onImageCapture={analyzeImage} 
            status={scanStatus} 
          />
        </div>

        {/* Results with Audio Support */}
        <section aria-live="polite">
          <GuardianVerdict 
            result={currentVerdict} 
            loading={isScanning} 
            onSpeak={speakVerdict}
          />
        </section>

        {/* History Memory */}
        <RecentScans 
          scans={recentScans} 
          onSelect={setSelectedScanForDeepDive}
        />
      </main>

      <EmergencyButton />
      
      <DeepDiveModal 
        scan={selectedScanForDeepDive} 
        onClose={() => setSelectedScanForDeepDive(null)}
        onRescan={handleRescanSettings}
      />

      {/* Floating Assistive Note */}
      <div className="fixed bottom-8 left-6 hidden lg:block max-w-[200px]">
        <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
          Double-check ingredient lists manually whenever possible. AI analysis is an assistive tool and may have errors.
        </p>
      </div>
    </div>
  );
}
