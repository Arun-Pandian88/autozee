"use client";

import { MessageSquare } from "lucide-react";

export function WhatsAppWidget() {
  const phoneNumber = "917603917369";
  const defaultMessage = "Hi! I would like to know more about Autozee.";
  
  const handleRedirect = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <button
        onClick={handleRedirect}
        className="wa-floating-btn"
        aria-label="Chat with us on WhatsApp"
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 9999,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#25D366",
          boxShadow: "0 4px 14px rgba(37,211,102,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          animation: "bounceIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
            fill="white"
          />
          <path
            d="M12 0C5.374 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.83L.057 23.215a.75.75 0 00.92.908l5.42-1.458A11.945 11.945 0 0012 24c6.626 0 12-5.373 12-12S18.626 0 12 0z"
            fill="white"
            fillOpacity="0.2"
          />
        </svg>
      </button>

      <style>{`
        .wa-floating-btn:hover {
          transform: scale(1.08) !important;
          box-shadow: 0 6px 20px rgba(37,211,102,0.6) !important;
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @media (max-width: 640px) {
          .wa-floating-btn { bottom: 1.5rem !important; right: 1.5rem !important; width: 54px !important; height: 54px !important; }
        }
      `}</style>
    </>
  );
}
