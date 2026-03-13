import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScannerModal({ onClose, onScan }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Success
        scanner.clear().catch(console.error);
        onScan(decodedText);
      },
      (error) => {
        // Error is common while searching
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.warn("Failed to clear scanner on unmount", error);
      });
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">Scan QR Code</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Point your camera at a UPI QR</p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6">
            <div id="reader" className="w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40" />
        </div>

        <div className="p-6 bg-slate-800/20 border-t border-white/5 flex justify-center">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">PennyWise Secure Scanner</p>
        </div>
      </div>
    </div>
  );
}
