import { X, Phone, MessageCircle } from "lucide-react";

interface HotelContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HotelContactModal({ isOpen, onClose }: HotelContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Complete Your Hotel Booking</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Contact our coordinator to confirm &amp; pay
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-gray-700 text-sm leading-relaxed">
            Hotel bookings are handled offline. Reach out to our accommodation coordinator below to
            confirm your room and arrange payment. Your dashboard will show{" "}
            <span className="font-medium text-amber-700">Pending Confirmation</span> until we
            update your booking.
          </p>

          {/* Contact card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Sis. Damilola Olawuni</p>
              <p className="text-sm text-amber-800">+234 708 950 9539</p>
              <p className="text-xs text-amber-700 mt-0.5">Calls &amp; WhatsApp</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <a
              href="tel:+2347089509539"
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
            <a
              href="https://wa.me/2347089509539?text=Hi%20Sis.%20Damilola%2C%20I%20selected%20a%20hotel%20room%20for%20the%20WOTH%20event%20and%20would%20like%20to%20complete%20my%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          <div className="border-t pt-4">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors text-sm"
            >
              Go to My Dashboard
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              You can revisit the coordinator&apos;s contact from your dashboard at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}