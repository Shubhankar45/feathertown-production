/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Official Printable & Downloadable Tax Invoice
   /components/admin/PrintableInvoice.jsx
   
   - Print-optimized CSS (@media print) for pixel-perfect PDF output
   - Real database record integration
   - Avian health certification, Ring #, and DNA sex documentation
   - GST tax calculation breakdown & UPI QR code for balance payment
   - 100% Lucide React icons, zero emojis
═══════════════════════════════════════════════════════════════ */
import { useRef } from "react";
import { Printer, Download, Share2, X, CheckCircle2, AlertCircle, Feather } from "lucide-react";
import { toast } from "../ui/Toast";

export default function PrintableInvoice({ invoice, settings, onClose }) {
  const printRef = useRef(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const phone = (invoice.customer?.phone || "").replace(/\D/g, "");
    if (!phone) {
      toast.warn("Customer phone number not available for WhatsApp sharing.");
      return;
    }
    const message = encodeURIComponent(
      `Hello ${invoice.customer?.name || "Customer"},\n\nYour official FeatherTown Tax Invoice (#${invoice.invoiceNumber}) has been generated.\n\nTotal Amount: ₹${invoice.totalAmount?.toLocaleString("en-IN")}\nAmount Paid: ₹${invoice.paidAmount?.toLocaleString("en-IN")}\nBalance Due: ₹${invoice.balanceDue?.toLocaleString("en-IN")}\n\nThank you for choosing FeatherTown Aviary!`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const statusColor = {
    paid: { bg: "#DCFCE7", text: "#15803D", label: "PAID IN FULL" },
    partial: { bg: "#FEF3C7", text: "#D97706", label: "PARTIAL DEPOSIT" },
    unpaid: { bg: "#FEE2E2", text: "#DC2626", label: "PAYMENT DUE" },
    cancelled: { bg: "#F1F5F9", text: "#64748B", label: "VOID / CANCELLED" },
  }[invoice.paymentStatus || "paid"] || { bg: "#DCFCE7", text: "#15803D", label: "PAID" };

  const upiId = settings?.upiId || "featherstown@upi";
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=FeatherTown&am=${invoice.balanceDue || 0}&cu=INR&tn=Invoice_${invoice.invoiceNumber}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px, 2.5vw, 24px)",
        overflowY: "auto",
      }}
    >
      {/* Container */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          maxWidth: 900,
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Modal Action Bar (Hidden in Print) */}
        <div
          className="no-print"
          style={{
            padding: "16px 24px",
            background: "#FAF8F5",
            borderBottom: "1px solid #E2DDD3",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "Outfit, system-ui, sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: "#1B3B22",
              }}
            >
              Tax Invoice #{invoice.invoiceNumber}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: 99,
                background: statusColor.bg,
                color: statusColor.text,
                letterSpacing: "0.05em",
              }}
            >
              {statusColor.label}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handlePrint}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                background: "#1B3B22",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                background: "#25D366",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Share2 size={15} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                color: "#475569",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div
          ref={printRef}
          id="printable-invoice-content"
          style={{
            padding: "clamp(24px, 4vw, 48px)",
            overflowY: "auto",
            fontFamily: "Outfit, system-ui, sans-serif",
            color: "#0F172A",
            lineHeight: 1.5,
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid #1B3B22",
              paddingBottom: 24,
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: "#1B3B22", letterSpacing: "-0.03em" }}>
                  Feather
                </span>
                <span style={{ fontSize: 28, fontWeight: 900, color: "#D9381E", letterSpacing: "-0.03em" }}>
                  Town
                </span>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D9381E", marginLeft: 4 }} />
              </div>
              <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 2px 0" }}>
                Certified Ethical Aviary &amp; Companion Bird Marketplace
              </p>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                {settings?.address || "Sundargarh, Odisha 770001, India"}
              </p>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                GSTIN: <strong>{settings?.gstin || "21AABCF1234F1Z5"}</strong> | Email: {settings?.email || "care@feathertown.online"}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#1B3B22", textTransform: "uppercase", letterSpacing: 1 }}>
                TAX INVOICE
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginTop: 4 }}>
                #{invoice.invoiceNumber}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                Payment Method: <strong style={{ textTransform: "uppercase" }}>{invoice.paymentMethod || "CASH"}</strong>
              </div>
            </div>
          </div>

          {/* Bill To & Ship To Details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
              background: "#FAF8F5",
              border: "1px solid #E2DDD3",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#1B3B22", letterSpacing: 1, marginBottom: 4 }}>
                Billed To
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>
                {invoice.customer?.name}
              </div>
              <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
                Phone: {invoice.customer?.phone || "N/A"}
              </div>
              {invoice.customer?.email && (
                <div style={{ fontSize: 13, color: "#475569" }}>
                  Email: {invoice.customer.email}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#1B3B22", letterSpacing: 1, marginBottom: 4 }}>
                Delivery Address
              </div>
              <div style={{ fontSize: 13, color: "#334155" }}>
                {invoice.customer?.address || "Direct Store Handover / Avian Transport"}
              </div>
              <div style={{ fontSize: 13, color: "#334155" }}>
                {[invoice.customer?.city, invoice.customer?.state, invoice.customer?.pincode].filter(Boolean).join(", ")}
              </div>
              {invoice.customer?.gstin && (
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                  Buyer GSTIN: <strong>{invoice.customer.gstin}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ overflowX: "auto", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#E7EFE8", borderBottom: "2px solid #B8D4BA" }}>
                  <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 800, color: "#1B3B22", textTransform: "uppercase" }}>#</th>
                  <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 800, color: "#1B3B22", textTransform: "uppercase" }}>Item Description</th>
                  <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 800, color: "#1B3B22", textTransform: "uppercase", textAlign: "center" }}>Type</th>
                  <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 800, color: "#1B3B22", textTransform: "uppercase", textAlign: "right" }}>Rate (₹)</th>
                  <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 800, color: "#1B3B22", textTransform: "uppercase", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 800, color: "#1B3B22", textTransform: "uppercase", textAlign: "right" }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: "12px", fontSize: 13, color: "#64748B" }}>{idx + 1}</td>
                    <td style={{ padding: "12px", fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}>
                      <div>{it.name}</div>
                      {it.sku && <div style={{ fontSize: 11, color: "#94A3B8" }}>SKU: {it.sku}</div>}
                    </td>
                    <td style={{ padding: "12px", fontSize: 12, textAlign: "center", textTransform: "capitalize", color: "#475569" }}>
                      {it.itemType || "Accessory"}
                    </td>
                    <td style={{ padding: "12px", fontSize: 13.5, textAlign: "right", color: "#334155" }}>
                      ₹{Number(it.price || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "12px", fontSize: 13.5, textAlign: "center", color: "#334155" }}>
                      {it.quantity || 1}
                    </td>
                    <td style={{ padding: "12px", fontSize: 13.5, fontWeight: 700, textAlign: "right", color: "#1B3B22" }}>
                      ₹{Number(it.total || (it.price * it.quantity)).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Avian Reservation & Health Certification Details (If applicable) */}
          {invoice.bookingDetails && (
            <div
              style={{
                background: "#F0FDF4",
                border: "1.5px solid #86EFAC",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#15803D", fontWeight: 800, fontSize: 13, textTransform: "uppercase", marginBottom: 8 }}>
                <Feather size={16} />
                <span>Companion Bird Certification &amp; Handover Record</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, fontSize: 13 }}>
                <div>
                  <span style={{ color: "#64748B" }}>Species / Breed:</span>{" "}
                  <strong>{invoice.bookingDetails.birdName || "Companion Bird"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Closed Ring ID:</span>{" "}
                  <strong>{invoice.bookingDetails.ringNumber || "PENDING"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>DNA Sexing:</span>{" "}
                  <strong>{invoice.bookingDetails.dnaSex || "Certified"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Handover Status:</span>{" "}
                  <strong style={{ textTransform: "capitalize", color: "#15803D" }}>{invoice.bookingDetails.status || "Reserved"}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Financial Summary & Bank UPI Box */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              alignItems: "flex-start",
              marginBottom: 24,
            }}
          >
            {/* Payment & Banking Details */}
            <div
              style={{
                background: "#FAF8F5",
                border: "1px solid #E2DDD3",
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#1B3B22", letterSpacing: 0.8, marginBottom: 8 }}>
                Bank &amp; Payment Details
              </div>
              <div style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>
                <div>Bank: <strong>{settings?.bankName || "HDFC Bank"}</strong></div>
                <div>Account: <strong>{settings?.bankAccount || "50200088991122"}</strong></div>
                <div>IFSC: <strong>{settings?.bankIfsc || "HDFC0001234"}</strong></div>
                <div>UPI ID: <strong>{upiId}</strong></div>
              </div>
              {invoice.balanceDue > 0 && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed #CBD5E1" }}>
                  <span style={{ fontSize: 12, color: "#D9381E", fontWeight: 700 }}>
                    Scan UPI QR or pay via ID to clear balance of ₹{invoice.balanceDue.toLocaleString("en-IN")}.
                  </span>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>Subtotal:</span>
                <span>₹{Number(invoice.subtotal || 0).toLocaleString("en-IN")}</span>
              </div>

              {invoice.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#15803D" }}>
                  <span>Discount:</span>
                  <span>- ₹{Number(invoice.discount).toLocaleString("en-IN")}</span>
                </div>
              )}

              {invoice.taxRate > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                  <span>GST ({invoice.taxRate}%):</span>
                  <span>₹{Number(invoice.taxAmount || 0).toLocaleString("en-IN")}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#1B3B22",
                  borderTop: "2px solid #1B3B22",
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <span>Total Amount:</span>
                <span>₹{Number(invoice.totalAmount || 0).toLocaleString("en-IN")}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "#15803D", fontWeight: 700 }}>
                <span>Amount Paid:</span>
                <span>₹{Number(invoice.paidAmount || 0).toLocaleString("en-IN")}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 15,
                  fontWeight: 900,
                  color: invoice.balanceDue > 0 ? "#D9381E" : "#15803D",
                  background: invoice.balanceDue > 0 ? "#FEE2E2" : "#DCFCE7",
                  padding: "8px 12px",
                  borderRadius: 8,
                }}
              >
                <span>Balance Due:</span>
                <span>₹{Number(invoice.balanceDue || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Terms & Signatures */}
          <div
            style={{
              paddingTop: 20,
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <div style={{ maxWidth: 440, fontSize: 11.5, color: "#64748B", lineHeight: 1.5 }}>
              <strong>Terms &amp; Policies:</strong> {invoice.terms || "All companion birds are certified healthy, closed-banded, and provided with lifelong dietary consultation. Accessories carry official warranty against manufacturing defects."}
            </div>

            <div style={{ textAlign: "center", minWidth: 180 }}>
              <div style={{ borderBottom: "1px solid #0F172A", width: 160, margin: "0 auto 8px" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
                Authorized Signatory
              </div>
              <div style={{ fontSize: 10.5, color: "#64748B" }}>
                FeatherTown Aviary
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice-content, #printable-invoice-content * {
            visibility: visible;
          }
          #printable-invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20mm !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

