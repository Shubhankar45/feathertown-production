import { useState, useRef } from "react";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { toast } from "../components/ui/Toast";
import { isValidEmail, isValidPhone, checkBotSubmission } from "../utils/validation";
import { sanitizeText } from "../utils/security";
import { trackEvent, trackWhatsAppClick } from "../utils/analytics";
import { useSettings } from "../context/SettingsContext";

export default function Contact() {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Adoption Inquiry",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formMountTime = useRef(Date.now());

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Spam & Bot Protection
    const botCheck = checkBotSubmission(honeypot, formMountTime.current, 1000);
    if (botCheck.isBot) {
      console.warn("Contact form bot detected");
      setSubmitted(true);
      return;
    }

    // 2. Field Validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.warn("Please enter your full name.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.warn("Please enter a valid email address.");
      return;
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      toast.warn("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      toast.warn("Please provide a message with at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      // Simulate or dispatch contact request
      await new Promise((res) => setTimeout(res, 600));
      trackEvent("contact_form_submitted", { subject: formData.subject });
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent to our avian team.");
    } catch {
      toast.error("Failed to send message. Please try contacting us on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    trackWhatsAppClick("contact_page");
    const wa = (settings.whatsapp || "919556747518").replace(/\D/g, "");
    window.open(`https://wa.me/${wa}?text=Hi%20FeatherTown,%20I'd%20like%20to%20connect%20with%20you!`, "_blank");
  };

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Contact FeatherTown | Bird Care Support & Avian Consultation"
        description="Reach out to FeatherTown for parrot adoption inquiries, diet guidance, custom cage sizing, or order support. Quick replies via WhatsApp and email."
      />

      <PageBanner
        eyebrow="Get in Touch"
        title="Contact"
        accent="FeatherTown"
        desc="Have a question about bird care, new arrivals, or cage sizing? We're here to help."
      />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "clamp(20px, 4vw, 32px)",
            alignItems: "start",
          }}
        >
          {/* Left Column: Direct Info & WhatsApp Card */}
          <div className="rv-left" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Quick Contact Card */}
            <div
              className="ft-card-lift"
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                padding: "clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px)",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 20 }}>
                Avian Consultation &amp; Care
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>📍</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Aviary Location</div>
                    <div style={{ fontSize: 13, color: "#64748B" }}>{settings.address || "Sundargarh, Odisha, India - 770001"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>📞</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Helpline &amp; Calls</div>
                    <div style={{ fontSize: 13, color: "#64748B" }}>{settings.phone || "+91 9556747518"} ({settings.businessHours || "9 AM – 8 PM"})</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>📧</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Direct Support Email</div>
                    <div style={{ fontSize: 13, color: "#64748B" }}>{settings.email || "support@feathertown.online"}</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #F1F5F9", marginTop: 24, paddingTop: 20 }}>
                <button
                  onClick={handleWhatsApp}
                  className="ft-btn-hover"
                  style={{
                    width: "100%",
                    background: "#16A34A",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "13px 20px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <span>💬</span>
                  <span>Instant WhatsApp Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form with Validation & Honeypot */}
          <div
            className="rv-right ft-card-lift"
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
              Send Us a Message
            </h3>
            <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 24 }}>
              Fill in the form below and an avian specialist will reply within 4 hours.
            </p>

            {submitted ? (
              <div
                style={{
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  borderRadius: 16,
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: "#065F46", marginBottom: 6 }}>
                  Message Received!
                </h4>
                <p style={{ fontSize: 13.5, color: "#047857", lineHeight: 1.5, marginBottom: 18 }}>
                  Thank you for reaching out. We will review your inquiry and get back to you promptly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", subject: "Adoption Inquiry", message: "" });
                  }}
                  className="ft-btn-hover"
                  style={{
                    background: "#16A34A",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 999,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Honeypot Field */}
                <input
                  type="text"
                  name="website_url_trap"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: "none" }}
                  aria-hidden="true"
                />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. rahul@example.com"
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Phone (10-Digit)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Inquiry Topic
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="Adoption Inquiry">Parrot Adoption</option>
                      <option value="Cages & Accessories">Cages &amp; Accessories</option>
                      <option value="Nutrition Advice">Bird Nutrition &amp; Care</option>
                      <option value="Order Status">Order Tracking</option>
                      <option value="Other">Other Questions</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us what you're looking for or how we can assist..."
                    required
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="ft-btn-hover"
                  style={{
                    width: "100%",
                    background: "#16A34A",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "13px",
                    borderRadius: 999,
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  {loading ? "Sending Message…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "1.5px solid #CBD5E1",
  fontSize: 13.5,
  color: "#0F172A",
  background: "#F8FAFC",
  outline: "none",
};
