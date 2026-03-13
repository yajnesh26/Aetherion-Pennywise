import { Scanner } from "@yudiel/react-qr-scanner";

export default function QRScanner({ onScan, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-4 rounded-xl w-[350px]">

        <h2 className="text-white mb-3 text-center font-semibold">
          Scan UPI QR
        </h2>

        <Scanner
          onDecode={(result) => onScan(result)}
          onError={(error) => console.log(error)}
        />

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