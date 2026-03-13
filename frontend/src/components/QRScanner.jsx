import React, { useEffect, useState, useRef, useCallback } from "react";

function DynamicScanner({ scannerRef, onDecode, onError }) {
  const [ScannerComp, setScannerComp] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;
    // dynamic import so Vite won't fail the entire dev server if the package is missing
    import("@yudiel/react-qr-scanner")
      .then((mod) => {
        if (!mounted) return;
        // module might export default or named Scanner
        const Comp = mod.Scanner || mod.default || null;
        if (!Comp) {
          setLoadError("Scanner module found but no Scanner export available.");
          return;
        }
        setScannerComp(() => Comp);
      })
      .catch((err) => {
        console.warn("Failed to load @yudiel/react-qr-scanner:", err);
        setLoadError(
          "Scanner library is not installed or failed to load. Run `npm install @yudiel/react-qr-scanner` in the frontend folder."
        );
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loadError) {
    return (
      <div className="p-4 text-sm text-yellow-200">
        <p>{loadError}</p>
      </div>
    );
  }

  if (!ScannerComp) {
    return <div className="p-4 text-sm text-slate-300">Loading scanner…</div>;
  }

  return (
    <ScannerComp
      ref={scannerRef}
      onDecode={onDecode}
      onError={onError}
      constraints={{ video: { facingMode: { ideal: "environment" } } }}
    />
  );
}

export default function QRScanner({ onScan, onClose }) {
  const [errorMsg, setErrorMsg] = useState("");
  const [scanned, setScanned] = useState(false);
  const scannerRef = useRef(null);

  const normalizeResult = useCallback((result) => {
    if (!result) return null;
    if (typeof result === "string") return result;
    if (typeof result.text === "string") return result.text;
    if (typeof result.getText === "function") {
      try {
        return result.getText();
      } catch (e) {
        console.warn("normalizeResult: getText() threw", e);
      }
    }
    if (result.codeResult && typeof result.codeResult.code === "string") return result.codeResult.code;
    try {
      return String(result);
    } catch (e) {
      return null;
    }
  }, []);

  const handleDecode = useCallback(
    (rawResult) => {
      if (scanned) return;
      const decoded = normalizeResult(rawResult);
      if (!decoded) {
        console.warn("QRScanner: could not normalize decode result", rawResult);
        return;
      }
      setScanned(true);
      try {
        onScan(decoded);
      } catch (e) {
        console.error("QRScanner: onScan handler threw", e);
      }
      setTimeout(() => {
        try {
          onClose();
        } catch (e) {}
      }, 250);
    },
    [scanned, normalizeResult, onScan, onClose]
  );

  const handleError = useCallback((err) => {
    console.error("QRScanner error:", err);
    if (err && err.name === "NotAllowedError") {
      setErrorMsg("Camera access was denied. Allow camera permissions and try again.");
    } else if (err && err.name === "NotFoundError") {
      setErrorMsg("No camera found on this device.");
    } else {
      setErrorMsg(String(err || "Unknown camera error"));
    }
  }, []);

  const handleRetry = () => {
    setErrorMsg("");
    setScanned(false);
    if (scannerRef.current && typeof scannerRef.current.stop === "function") {
      try {
        scannerRef.current.stop();
      } catch (e) {}
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-4 rounded-xl w-[350px]">

        <h2 className="text-white mb-3 text-center font-semibold">Scan UPI QR</h2>

        {errorMsg ? (
          <div className="text-sm text-red-300">
            <p>{errorMsg}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleRetry}
                className="flex-1 bg-emerald-600/20 text-emerald-300 py-2 rounded-lg"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-black rounded overflow-hidden">
            <DynamicScanner scannerRef={scannerRef} onDecode={handleDecode} onError={handleError} />
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500/20 text-red-400 py-2 rounded-lg"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}