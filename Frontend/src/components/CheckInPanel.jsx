import { Camera, QrCode, SearchCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { eventApi } from "../services/api";

export default function CheckInPanel({ events, onCheckedIn }) {
  const [eventId, setEventId] = useState(events[0]?.id || "");
  const [ticketCode, setTicketCode] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [scannerSupported, setScannerSupported] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const selectedEvent = events.find((event) => event.id === eventId);

  useEffect(() => {
    if (!events.length) {
      setEventId("");
      return;
    }

    const exists = events.some((event) => event.id === eventId);
    if (!exists) {
      setEventId(events[0].id);
    }
  }, [events, eventId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!events.length) {
      toast.error("No events available for check-in");
      return;
    }

    if (!eventId || !ticketCode.trim()) {
      toast.error("Select an event and enter a ticket code");
      return;
    }

    try {
      const data = await eventApi.checkIn(eventId, { ticketCode });
      toast.success("Attendee checked in");
      setTicketCode("");
      onCheckedIn(data.event);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    setScannerSupported(Boolean(window.BarcodeDetector && navigator.mediaDevices));
  }, []);

  useEffect(() => {
    let timer;

    const start = async () => {
      if (!scannerEnabled || !window.BarcodeDetector || !videoRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      const scan = async () => {
        if (!videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            setTicketCode(String(codes[0].rawValue).trim().toUpperCase());
            setScannerEnabled(false);
            return;
          }
        } catch {
          return;
        }
        timer = window.setTimeout(scan, 500);
      };

      scan();
    };

    start().catch((error) => {
      console.error("Scanner error:", error);
      toast.error("Unable to start camera scanner");
      setScannerEnabled(false);
    });

    return () => {
      if (timer) window.clearTimeout(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [scannerEnabled]);

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-white/10 bg-[#17191c] p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-md bg-[#f4b860] p-2 text-[#101214]">
            <QrCode size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">QR / Ticket Check-in</h2>
            <p className="text-sm text-white/55">Use the printed ticket code or the QR payload from an attendee pass.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="glass-input w-full">
            {!events.length && <option value="">No events available</option>}
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
          <input
            value={ticketCode}
            onChange={(event) => setTicketCode(event.target.value.toUpperCase())}
            placeholder="Scan or type ticket code"
            className="glass-input w-full text-center text-2xl font-black tracking-widest"
          />
          {scannerSupported && (
            <button
              type="button"
              onClick={() => setScannerEnabled((value) => !value)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/8 px-4 py-3 font-semibold text-white"
            >
              <Camera size={18} />
              {scannerEnabled ? "Stop Scanner" : "Open Camera Scanner"}
            </button>
          )}
          {scannerEnabled && (
            <div className="overflow-hidden rounded-md border border-white/10 bg-black">
              <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
            </div>
          )}
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#f4b860] px-4 py-3 font-bold text-[#101214]">
            <SearchCheck size={18} />
            Check In Attendee
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#17191c] p-5">
        <h3 className="mb-4 font-bold text-white">Registered Attendees</h3>
        {!selectedEvent?.attendees?.length ? (
          <div className="text-white/50">No attendees yet.</div>
        ) : (
          <div className="max-h-[420px] space-y-2 overflow-auto">
            {selectedEvent.attendees
              .filter((attendee) => attendee.status !== "cancelled")
              .map((attendee) => (
                <div key={attendee.ticketCode} className="grid gap-2 rounded-md bg-white/6 p-3 text-sm text-white/70 sm:grid-cols-[1fr_auto]">
                  <div>
                    <div className="font-bold text-white">{attendee.user?.username || "Attendee"}</div>
                    <div>{attendee.user?.email || "No email"}</div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-white/45">{attendee.status} · {attendee.paymentStatus}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
