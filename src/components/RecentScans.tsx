import { motion } from "motion/react";
import { History, ShieldCheck, AlertTriangle, Clock } from "lucide-react";
import { ScanResult } from "../types";

interface RecentScansProps {
  scans: ScanResult[];
  onSelect: (scan: ScanResult) => void;
}

export function RecentScans({ scans, onSelect }: RecentScansProps) {
  if (scans.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <History size={20} className="text-slate-500" />
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Recent Memory</h2>
      </div>
      
      <div className="grid gap-3">
        {scans.map((scan) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onSelect(scan)}
            className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-black border border-white/10 shrink-0">
                {scan.image ? (
                  <img src={`data:image/jpeg;base64,${scan.image}`} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-800">
                    <Clock size={20} />
                  </div>
                )}
                <div className={`absolute top-0 right-0 h-3 w-3 border-2 border-slate-900 rounded-full ${scan.safe ? "bg-safe" : "bg-danger"}`} />
              </div>

              <div>
                <p className="text-sm font-extrabold text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {scan.reasoning}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                  {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            <div className={`text-[10px] font-black px-3 py-1 rounded-lg border ${
              scan.safe ? "border-safe/30 text-safe bg-safe/10" : "border-danger/30 text-danger bg-danger/10"
            }`}>
              {scan.status}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
