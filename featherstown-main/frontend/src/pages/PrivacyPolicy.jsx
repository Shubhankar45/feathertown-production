import { Link } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { useSettings } from "../context/SettingsContext";

export default function PrivacyPolicy() {
  const { settings } = useSettings();
  const contactEmail = settings?.email || "support@feathertown.online";
  const contactPhone = settings?.phone || "+91 9556747518";
  const contactAddress = settings?.address || "Sundargarh, Odisha, India - 770001";
  return (
    <div style={{ background: "var(--j0)", color: "var(--cream)", fontFamily: "var(--font-b)", minHeight: "100vh" }}>
      <SEOHead
        title="Privacy Policy | FeatherTown"
        description="FeatherTown's Privacy Policy explains how we collect, protect, and use your personal information and ensure safe, secure transactions."
      />

      <PageBanner
        eyebrow="Legal &amp; Trust"
        title="Privacy"
        accent="Policy"
        desc="How we collect, protect, and treat your personal data with complete transparency."
      />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "var(--rL)",
            padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)",
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            lineHeight: 1.8,
            fontSize: 15,
            color: "var(--fog)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderBottom: "1px solid #F1F5F9", paddingBottom: 16, marginBottom: 28 }}>
            <span style={{ fontSize: 13, color: "var(--ghost)", fontWeight: 600 }}>Last Updated: October 2026</span>
            <span style={{ fontSize: 13, color: "var(--leaf)", fontWeight: 700 }}>Version 2.1 (DPDP &amp; GDPR Compliant)</span>
          </div>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              1. Introduction &amp; Scope
            </h2>
            <p>
              Welcome to <strong>FeatherTown</strong> (accessible at <a href="https://www.feathertown.online" style={{ color: "var(--leaf)" }}>www.feathertown.online</a>). We are dedicated to providing ethical, healthy companion birds and premium pet accessories while fiercely respecting your personal privacy. This Privacy Policy details how we collect, store, utilize, and protect your information when interacting with our website, marketplace, customer care, and WhatsApp support.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              2. Information We Collect
            </h2>
            <p style={{ marginBottom: 10 }}>We only gather information necessary to fulfill orders and provide lifetime bird guidance:</p>
            <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Contact &amp; Delivery Details:</strong> Full name, shipping address, city, state, postal PIN code, mobile phone number, and email address when purchasing bird accessories or booking a bird consultation.</li>
              <li><strong>Order History &amp; Favorites:</strong> Items added to cart, order status, accessories purchased, and tracking details.</li>
              <li><strong>Customer Support Inquiries:</strong> Messages, diet questions, or care inquiries submitted via our contact form or WhatsApp helpline.</li>
              <li><strong>Technical &amp; Analytical Data:</strong> IP address, browser type, device identifiers, and pages visited, aggregated anonymously to optimize loading speeds.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              3. Payment Security &amp; Razorpay Processing
            </h2>
            <p>
              Your payment security is paramount. FeatherTown <strong>never stores, transmits, or has access to your credit card numbers, CVVs, or net banking passwords</strong>. All payments are processed through Razorpay, a PCI-DSS Level 1 certified payment gateway with bank-grade 256-bit SSL encryption.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              4. Cookies &amp; Tracking Technologies
            </h2>
            <p>
              We employ essential cookies to keep your shopping cart intact while browsing and preserve your login status. With your consent, we use privacy-friendly performance cookies to evaluate site speeds and popular bird species. You can modify your choices anytime via our{" "}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("ft_reopen_cookie_preferences"))}
                style={{ background: "none", border: "none", color: "var(--leaf)", textDecoration: "underline", fontWeight: 700, cursor: "pointer", padding: 0 }}
              >
                Cookie Preferences
              </button>.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              5. Third-Party Sharing &amp; Anti-Spam Guarantee
            </h2>
            <p>
              We operate under a strict <strong>Zero-Spam Policy</strong>. We do not sell, rent, or trade your personal email, phone number, or data to third-party advertisers or telemarketers under any circumstance. Information is only shared with verified delivery couriers (e.g. Blue Dart, Delhivery) strictly to deliver your physical parcel.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              6. Your Rights &amp; Data Deletion
            </h2>
            <p>
              Under applicable Indian and international privacy legislation, you have the right to request a copy of your personal data, rectify inaccuracies, or request complete account deletion. To exercise these rights, please email us at <a href={`mailto:${contactEmail}`} style={{ color: "var(--leaf)" }}>{contactEmail}</a> with the subject "Data Privacy Request".
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              7. Grievance Redressal &amp; Contact
            </h2>
            <p>
              For any questions or concerns regarding our privacy standards, please reach our designated Data Protection Officer:
            </p>
            <div style={{ background: "var(--j1)", padding: "16px 20px", borderRadius: 12, marginTop: 12, border: "1px solid rgba(0,0,0,0.06)" }}>
              <div><strong>FeatherTown Care Team</strong></div>
              <div>{contactAddress}</div>
              <div>Email: <a href={`mailto:${contactEmail}`} style={{ color: "var(--leaf)" }}>{contactEmail}</a></div>
              <div>WhatsApp / Helpline: {contactPhone}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
