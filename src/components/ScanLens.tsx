import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Camera, Upload, RefreshCcw, SwitchCamera, AlertCircle, Zap, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ScanLensProps {
  onImageCapture: (base64: string) => void;
  status: "idle" | "scanning" | "safe" | "danger";
}

export function ScanLens({ onImageCapture, status }: ScanLensProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isFlashing, setIsFlashing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (err) {
      setCameraError("Camera access denied. Please use manual upload.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const processAndCapture = (source: HTMLVideoElement | HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Optimization pipeline
    const maxDim = 800;
    let width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    let height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;

    const scale = Math.min(maxDim / width, maxDim / height, 1);
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (source instanceof HTMLVideoElement) {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 150);
      }
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.7);
      setPreview(base64);
      onImageCapture(base64.split(",")[1]);
      stopCamera();
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const img = new Image();
        img.onload = () => processAndCapture(img);
        img.src = re.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* BLOCK A: THE VIEW-ZONE */}
      <div 
        className="relative w-full overflow-hidden rounded-[2.5rem] bg-black/60 aspect-square sm:aspect-video border-4 transition-colors duration-500 neon-border shadow-2xl flex items-center justify-center"
        style={{ borderColor: status === 'idle' ? '#1e293b' : (status === 'safe' ? '#22C55E' : (status === 'danger' ? '#EF4444' : '#F59E0B')) }}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              <img src={preview} alt="Scanned label" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent flex items-end justify-center p-6">
                 <button onClick={() => { setPreview(null); startCamera(); }} className="h-16 px-8 rounded-2xl bg-alert text-navy font-black flex items-center gap-3 shadow-xl">
                    <RefreshCcw size={24} /> RESET ANALYSIS
                 </button>
              </div>
            </motion.div>
          ) : isCameraActive ? (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
              <AnimatePresence>{isFlashing && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} className="absolute inset-0 bg-white z-50" />}</AnimatePresence>
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-4/5 h-3/5 border-2 border-dashed border-safe/40 rounded-3xl" />
              </div>
              <button 
                onClick={() => setFacingMode(f => f === "user" ? "environment" : "user")}
                className="absolute top-6 right-6 h-12 w-12 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/10 flex items-center justify-center"
              >
                <SwitchCamera size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 p-10 text-center">
              <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                {cameraError ? <AlertCircle size={40} className="text-danger" /> : <Camera size={40} />}
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black">{cameraError ? "Camera Connection Lost" : "Ready for Lab Analysis"}</h3>
                 <p className="text-sm text-slate-400 font-bold max-w-[240px] leading-relaxed">
                   {cameraError || "Point camera at the ingredient list or select a file below."}
                 </p>
              </div>
              {!cameraError && (
                <button onClick={startCamera} className="px-8 h-12 rounded-xl bg-safe/10 border border-safe/20 text-safe text-sm font-black uppercase tracking-widest hover:bg-safe/20 transition-all">
                  Enable Live Feed
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BLOCK B: PERSISTENT CONTROLS */}
      <div className="space-y-4">
        {/* Logical Divider */}
        <div className="flex items-center gap-4 px-2">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Guardian Input Mode</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action 1: Shutter */}
          <button
            disabled={!isCameraActive || !!preview}
            onClick={() => videoRef.current && processAndCapture(videoRef.current)}
            className={`
              flex h-16 items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all
              ${isCameraActive && !preview
                ? "bg-safe text-navy shadow-xl shadow-safe/20 scale-100 hover:brightness-110 active:scale-95" 
                : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
              }
            `}
          >
            <Camera size={22} strokeWidth={2.5} />
            Capture Frame
          </button>

          {/* Action 2: Always Available Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-navy border-2 border-slate-700 text-white font-black uppercase tracking-widest text-sm hover:border-slate-500 active:bg-white/5 transition-all"
          >
            <Upload size={22} />
            Upload Label
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} aria-hidden="true" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

