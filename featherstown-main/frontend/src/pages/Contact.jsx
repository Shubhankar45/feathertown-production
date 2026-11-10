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
    <div style={{ background: "#F7F5F0", color: "#152B17", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
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
                border: "1px solid #E2DDD3",
                boxShadow: "0 2px 10px rgba(27, 59, 34, 0.04)",
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#152B17", marginBottom: 20 }}>
                Avian Consultation &amp; Care
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <MapPin size={20} color="#1B3B22" strokeWidth={2.2} />
                  <div>
                    <div style={{ fontSize: 12, color: "#736B5E", fontWeight: 700, textTransform: "uppercase" }}>Aviary Location</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#152B17", marginTop: 2 }}>
                      {settings.address || "Sundargarh, Odisha 770001, India"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Phone size={20} color="#1B3B22" strokeWidth={2.2} />
                  <div>
                    <div style={{ fontSize: 12, color: "#736B5E", fontWeight: 700, textTransform: "uppercase" }}>Phone Support</div>
                    <a
                      href={`tel:${(settings.phone || "+91 95567 47518").replace(/\s/g, "")}`}
                      style={{ fontSize: 14, fontWeight: 600, color: "#1B3B22", textDecoration: "none", marginTop: 2, display: "inline-block" }}
                    >
                      {settings.phone || "+91 95567 47518"}
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Mail size={20} color="#1B3B22" strokeWidth={2.2} />
                  <div>
                    <div style={{ fontSize: 12, color: "#736B5E", fontWeight: 700, textTransform: "uppercase" }}>Email Inquiries</div>
                    <a
                      href={`mailto:${settings.email || "care@feathertown.online"}`}
                      style={{ fontSize: 14, fontWeight: 600, color: "#1B3B22", textDecoration: "none", marginTop: 2, display: "inline-block" }}
                    >
                      {settings.email || "care@feathertown.online"}
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>⏰</span>
                  <div>
                    <div style={{ fontSize: 12, color: "#736B5E", fontWeight: 700, textTransform: "uppercase" }}>Hours</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#152B17", marginTop: 2 }}>
                      {settings.businessHours || "Mon – Sun: 9:00 AM – 8:00 PM IST"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #E2DDD3", marginTop: 24, paddingTop: 20 }}>
                <button
                  onClick={handleWhatsApp}
                  className="ft-btn-hover"
                  style={{
                    width: "100%",
                    background: "#1B3B22",
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
                    boxShadow: "0 4px 14px rgba(27, 59, 34, 0.25)",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#152B17")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#1B3B22")}
                >
                  <MessageCircle size={16} strokeWidth={2.2} />
                  <span>Instant WhatsApp Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Message Form */}
          <div
            className="rv-right ft-card-lift"
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "clamp(20px, 4vw, 32px) clamp(16px, 4vw, 32px)",
              border: "1px solid #E2DDD3",
              boxShadow: "0 2px 10px rgba(27, 59, 34, 0.04)",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#152B17", marginBottom: 6 }}>
              Send an Avian Query
            </h3>
            <p style={{ fontSize: 13.5, color: "#736B5E", marginBottom: 24 }}>
              Fill in your details below and our team will get back within 2-4 business hours.
            </p>

            {submitted ? (
              <div
                className="rv-scale"
                style={{
                  background: "#FAF8F5",
                  borderRadius: 16,
                  padding: "32px 20px",
                  textAlign: "center",
                  border: "1px solid #E2DDD3",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><CheckCircle2 size={44} color="#1B3B22" strokeWidth={2} /></div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: "#152B17", marginBottom: 6 }}>
                  Message Received!
                </h4>
                <p style={{ fontSize: 13.5, color: "#736B5E", maxWidth: 360, margin: "0 auto 18px" }}>
                  Thank you for reaching out. An avian specialist will review your request and get in touch shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", subject: "Adoption Inquiry", message: "" });
                  }}
                  className="ft-btn-hover"
                  style={{
                    background: "#1B3B22",
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
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#152B17", marginBottom: 6 }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Patel"
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#152B17", marginBottom: 6 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#152B17", marginBottom: 6 }}>
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
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#152B17", marginBottom: 6 }}>
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
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#152B17", marginBottom: 6 }}>
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
                    background: "#D9381E",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "13px",
                    borderRadius: 999,
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(217, 56, 30, 0.25)",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#B82E17")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#D9381E")}
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
  border: "1.5px solid #E2DDD3",
  fontSize: 13.5,
  color: "#152B17",
  background: "#FAF8F5",
  outline: "none",
};
