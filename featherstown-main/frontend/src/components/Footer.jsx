import { Link } from "react-router-dom";
import logoImg from "../assets/logo-optimized.png";
import { useSettings } from "../context/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();
  const openCookiePreferences = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("ft_reopen_cookie_preferences"));
  };

  const waNum = (settings.whatsapp || "919556747518").replace(/\D/g, "");
  const instaUrl = settings.instagramUrl || "https://www.instagram.com/feather_town__?igsh=MWV2ZXdqbzlidmk4aw==";
  const supportEmail = settings.email || "support@feathertown.online";

  return (
    <footer
      style={{
        background: "#FFFFFF",
        color: "#334155",
        fontFamily: "Outfit, system-ui, sans-serif",
        paddingTop: "60px",
        paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0px))",
        borderTop: "1px solid #E2E8F0",
        margin: 0,
        marginBottom: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 64px)",
        }}
      >
        {/* Main 4-Column Grid */}
        <div
          className="rv-stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "clamp(28px, 4vw, 40px)",
            marginBottom: "48px",
          }}
        >
          {/* Col 1: Brand & Social */}
          <div>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              <img
                src={logoImg}
                alt="FeatherTown"
                style={{
                  height: 48,
                  width: "auto",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  padding: "4px 8px",
                  borderRadius: 12,
                }}
              />
              <div>
                <span
                  style={{
                    fontFamily: "Outfit, system-ui, sans-serif",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#16A34A",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  Feather<span style={{ color: "#EA580C" }}>Town</span>
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: "#15803D",
                  }}
                >
                  Small Pets, Big Love
                </span>
              </div>
            </Link>

            <p
              style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: "#475569",
                marginBottom: 20,
                maxWidth: 280,
              }}
            >
              Dedicated to healthy companion birds, wholesome nutrition, hand-tamed bonding, and premium accessories across India.
            </p>

            {/* Social Icons Strip */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <a
                href={instaUrl}
                target="_blank"
                rel="noreferrer"
                className="ft-btn-hover"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0F172A",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                title="Instagram"
              >
                📸
              </a>
              <a
                href={`https://wa.me/${waNum}`}
                target="_blank"
                rel="noreferrer"
                className="ft-btn-hover"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0F172A",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                title="WhatsApp Support"
              >
                💬
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="ft-btn-hover"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0F172A",
                  textDecoration: "none",
                }}
                title="Email Us"
              >
                ✉️
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#059669",
                marginBottom: 18,
              }}
            >
              Shop
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>
                <Link to="/birds" style={footerLink}>
                  All Companion Birds
                </Link>
              </li>
              <li>
                <Link to="/accessories" style={footerLink}>
                  Accessories &amp; Cages
                </Link>
              </li>
              <li>
                <Link to="/accessories?category=Food" style={footerLink}>
                  Nutritious Food &amp; Treats
                </Link>
              </li>
              <li>
                <Link to="/accessories?category=Toys" style={footerLink}>
                  Toys &amp; Enrichment
                </Link>
              </li>
              <li>
                <Link to="/compare" style={footerLink}>
                  Compare Bird Species
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Help & Support */}
          <div>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#059669",
                marginBottom: 18,
              }}
            >
              Help &amp; Support
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>
                <Link to="/contact" style={footerLink}>
                  Contact Us &amp; FAQs
                </Link>
              </li>
              <li>
                <Link to="/#care-guides" style={footerLink}>
                  Bird Care Guides
                </Link>
              </li>
              <li>
                <Link to="/my-orders" style={footerLink}>
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" style={footerLink}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" style={footerLink}>
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <button
                  onClick={openCookiePreferences}
                  style={{
                    ...footerLink,
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust Badges (Matches Reference Image) */}
          <div>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#059669",
                marginBottom: 18,
              }}
            >
              Our Promises
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>Secure Payments</div>
                  <div style={{ fontSize: 11.5, color: "#64748B" }}>256-bit encrypted Razorpay</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>🩺</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>48h Health Guarantee</div>
                  <div style={{ fontSize: 11.5, color: "#64748B" }}>Vet-certified &amp; parasite-free</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>💚</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>Happiness Guarantee</div>
                  <div style={{ fontSize: 11.5, color: "#64748B" }}>Lifetime feeding &amp; care support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid #F1F5F9",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12.5,
            color: "#64748B",
          }}
        >
          <div>
            © 2026 FeatherTown Marketplace. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "clamp(12px, 3vw, 20px)", alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/privacy-policy" style={{ color: "#64748B", textDecoration: "none" }}>
              Privacy
            </Link>
            <Link to="/terms" style={{ color: "#64748B", textDecoration: "none" }}>
              Terms
            </Link>
            <a href="/sitemap.xml" style={{ color: "#64748B", textDecoration: "none" }}>
              Sitemap
            </a>
            <span>Made with 💚 for bird lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerLink = {
  fontSize: "13.5px",
  color: "#475569",
  textDecoration: "none",
  transition: "color 0.2s",
};
