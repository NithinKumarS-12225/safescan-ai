import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, AlertTriangle, RefreshCcw, Info, ArrowRight } from "lucide-react";
import { ScanResult } from "../types";

interface DeepDiveModalProps {
  scan: ScanResult | null;
  onClose: () => void;
  onRescan: (scan: ScanResult) => void;
}

export function DeepDiveModal({ scan, onClose, onRescan }: DeepDiveModalProps) {
  if (!scan) return null;

  const isSafe = scan.safe;
  const isAmber = scan.status === 'Yellow';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-navy/95 backdrop-blur-2xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 sm:p-8 bg-black/20 shrink-0">
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-2xl ${isSafe ? "bg-safe text-navy" : isAmber ? "bg-alert text-navy" : "bg-danger text-white"}`}>
                {isSafe ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Scan Details Case #{scan.id.slice(0, 8)}</h2>
                <p className="text-xl font-black text-white">{scan.status} Verdict</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
              aria-label="Close details"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            {/* Ground Truth Image */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-alert">Ground Truth Evidence</h3>
              <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/5">
                {scan.image ? (
                  <img src={`data:image/jpeg;base64,${scan.image}`} alt="Original scanned label" className="h-full w-full object-contain" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-800 italic">No image evidence available</div>
                )}
              </div>
            </div>

            {/* Verdict Box */}
            <div className={`p-6 rounded-3xl border-2 ${isSafe ? "border-safe/20 bg-safe/5" : "border-danger/20 bg-danger/5"}`}>
              <p className={`text-3xl font-black mb-2 ${isSafe ? "text-safe" : "text-danger"}`}>{scan.reasoning}</p>
              <div className="flex flex-wrap gap-2">
                {scan.found_allergens.map((a, i) => (
                  <span key={i} className="px-3 py-1 bg-danger/20 border border-danger/30 text-danger text-[10px] font-black uppercase rounded-full">
                    Trigger: {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Additive Decoder */}
            {scan.additive_breakdown.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-alert">
                  <Info size={16} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Chemical Analysis</h3>
                </div>
                <div className="grid gap-3">
                  {scan.additive_breakdown.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-sm font-black text-white">{item.code} {item.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative */}
            {scan.alternative_suggestion && (
              <div className="flex items-center gap-4 p-4 bg-safe/5 rounded-2xl border border-safe/10">
                <ArrowRight size={20} className="text-safe shrink-0" />
                <p className="text-sm font-bold text-slate-300">
                  <span className="text-safe uppercase">Guardian Tip:</span> {scan.alternative_suggestion}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 sm:p-8 bg-black/20 flex gap-4 shrink-0">
            <button 
              onClick={() => { onRescan(scan); onClose(); }}
              className="flex-1 h-14 flex items-center justify-center gap-3 bg-safe text-navy font-black rounded-2xl uppercase tracking-widest text-sm hover:brightness-110 transition-all"
            >
              <RefreshCcw size={18} />
              Recall Settings
            </button>
            <button 
              onClick={onClose}
              className="flex-1 h-14 bg-white text-navy font-black rounded-2xl uppercase tracking-widest text-sm hover:bg-slate-100 transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
