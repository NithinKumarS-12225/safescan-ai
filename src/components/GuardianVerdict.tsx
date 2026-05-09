import { motion } from "motion/react";
import { AlertTriangle, ShieldCheck, Search, Volume2, Info, ArrowRight } from "lucide-react";
import { ScanResult } from "../types";

interface GuardianVerdictProps {
  result: ScanResult | null;
  loading: boolean;
  onSpeak: (text: string) => void;
}

export function GuardianVerdict({ result, loading, onSpeak }: GuardianVerdictProps) {
  if (loading) {
    return (
      <div className="flex w-full flex-col items-center gap-4 py-16 text-alert">
        <div className="relative h-20 w-20">
          <Search size={80} className="animate-pulse" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 border-t-4 border-alert rounded-full"
          />
        </div>
        <p className="text-xl font-black uppercase tracking-[0.3em]">Decoding Ingredients...</p>
      </div>
    );
  }

  if (!result) return null;

  const isAmber = result.status === 'Yellow';
  const isDanger = result.status === 'Red';
  const isSafe = result.status === 'Green';

  const speakText = `${result.safe ? 'Safe.' : 'Danger.'} ${result.reasoning}. ${result.additive_breakdown.length > 0 ? 'Be aware of additives' : ''}`;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative overflow-hidden rounded-[2rem] border-4 p-6 sm:p-8 shadow-2xl transition-all duration-700 ${
        isSafe ? "border-safe bg-safe/5 ring-4 ring-safe/10" : 
        isAmber ? "border-alert bg-alert/5 ring-4 ring-alert/20 animate-pulse" :
        "border-danger bg-danger/5 ring-4 ring-danger/20"
      }`}
    >
      <div className="flex flex-col gap-8">
        {/* Main Verdict Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl p-4 shadow-xl ${
              isSafe ? "bg-safe text-navy" : 
              isAmber ? "bg-alert text-navy" : 
              "bg-danger text-white"
            }`}>
              {isSafe ? <ShieldCheck size={36} /> : <AlertTriangle size={36} />}
            </div>
            <div>
              <h2 className={`text-sm font-black uppercase tracking-widest ${
                isSafe ? "text-safe" : isAmber ? "text-alert" : "text-danger"
              }`}>
                Guardian Verdict: {result.status}
              </h2>
              <p className="text-3xl font-black leading-tight text-white sm:text-4xl">
                {result.reasoning}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSpeak(speakText)}
            aria-label="Speak verdict reasoning"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all border border-white/10"
          >
            <Volume2 size={24} />
          </button>
        </div>

        {/* Plain English Decoder Section */}
        {result.additive_breakdown.length > 0 && (
          <div className="space-y-4 rounded-3xl bg-black/40 p-6 border border-white/5">
            <div className="flex items-center gap-2 text-alert">
              <Info size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Plain English Decoder</h3>
            </div>
            <div className="grid gap-3">
              {result.additive_breakdown.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 border-l-2 border-alert/30 pl-4 py-1">
                  <span className="text-xs font-mono text-alert uppercase">{item.code} - {item.name}</span>
                  <span className="text-sm text-slate-300">{item.impact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Found Allergens Chip Cloud */}
        {result.found_allergens.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {result.found_allergens.map((a, i) => (
              <span key={i} className="px-3 py-1 bg-danger/20 border border-danger/30 text-danger text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full">
                Trigger Found: {a}
              </span>
            ))}
          </div>
        )}

        {/* AI Alternative Suggestion */}
        {result.alternative_suggestion && (
          <div className="flex items-center gap-3 py-3 border-t border-white/5">
            <ArrowRight size={18} className="text-safe" />
            <p className="text-sm font-bold text-slate-400">
              <span className="text-safe uppercase">Guardian Tip:</span> {result.alternative_suggestion}
            </p>
          </div>
        )}
      </div>

      {/* Extreme Visual Pulsing Overlay for Danger */}
      {(isDanger || isAmber) && (
        <div className="absolute inset-0 pointer-events-none border-[16px] border-amber-500/10 blur-xl animate-pulse" />
      )}
    </motion.div>
  );
}
