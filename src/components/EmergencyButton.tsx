import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Phone, Hospital, X, Navigation } from "lucide-react";

export function EmergencyButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShowEmergency = () => {
    setLoading(true);
    // Simulate geolocation delay
    setTimeout(() => {
      setLoading(false);
      setShowDialog(true);
    }, 1000);
  };

  const hospitals = [
    { name: "City Central Hospital", distance: "0.8 miles", phone: "911", address: "123 Medical Plaza" },
    { name: "Family Health Center", distance: "1.4 miles", phone: "555-0199", address: "45 Care Way" },
    { name: "24/7 Urgent Care", distance: "2.1 miles", phone: "555-0244", address: "88 First Avenue" },
  ];

  return (
    <>
      <button
        onClick={handleShowEmergency}
        className="fixed bottom-6 right-6 z-[60] flex h-16 w-16 items-center justify-center rounded-2xl bg-danger text-white shadow-2xl shadow-danger/40 ring-4 ring-danger/20 active:scale-95 transition-transform"
        aria-label="Local Emergency Info"
      >
        <Hospital size={32} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {showDialog && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-6 bg-navy/80 backdrop-blur-xl">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/10 shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="bg-danger/20 p-3 rounded-2xl text-danger">
                    <Navigation size={28} />
                  </div>
                  <button 
                    onClick={() => setShowDialog(false)}
                    className="p-3 bg-white/5 rounded-full text-slate-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white leading-tight">Nearby Emergency Help</h2>
                  <p className="text-slate-400 font-medium">Located based on your current region.</p>
                </div>

                <div className="grid gap-3">
                  {hospitals.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="space-y-1">
                        <p className="font-black text-white">{h.name}</p>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {h.distance}</span>
                          <span>{h.address}</span>
                        </div>
                      </div>
                      <a 
                        href={`tel:${h.phone}`}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-safe text-navy"
                      >
                        <Phone size={20} strokeWidth={3} />
                      </a>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowDialog(false)}
                  className="w-full h-14 bg-white text-navy font-black rounded-2xl uppercase tracking-widest text-sm"
                >
                  Close Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
