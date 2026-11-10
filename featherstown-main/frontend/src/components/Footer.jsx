import { Link } from "react-router-dom";
import { Camera, MessageCircle, Mail, ShieldCheck, Stethoscope, Heart } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();
  const openCookiePreferences = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("ft_reopen_cookie_preferences"));
  };

  const waNum = (settings?.whatsapp || "919556747518").replace(/\D/g, "");
  const instaUrl = settings?.instagramUrl || "https://www.instagram.com/feather_town__?igsh=MWV2ZXdqbzlidmk4aw==";
  const supportEmail = settings?.email || "care@feathertown.online";

  return (
    <footer
      style={{
        background: "#FAF8F5",
        color: "#736B5E",
        fontFamily: "Outfit, system-ui, sans-serif",
        paddingTop: "60px",
        paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0px))",
        borderTop: "1px solid #E2DDD3",
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
                display: "inline-flex",
                alignItems: "baseline",
                textDecoration: "none",
                marginBottom: 16,
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#1B3B22",
                  letterSpacing: "-0.025em",
                }}
              >
                Feather
              </span>
              <span
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#D9381E",
                  letterSpacing: "-0.025em",
                }}
              >
                Town
              </span>
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#D9381E",
                  marginLeft: 3,
                }}
              />
            </Link>

            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: "#1B3B22",
                marginBottom: 14,
              }}
            >
              Small Pets, Big Love • Ethical Aviary
            </div>

            <p
              style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: "#736B5E",
                marginBottom: 20,
                maxWidth: 290,
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
                className="ft-btn-hover t-btn-press"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1B3B22",
                  textDecoration: "none",
                }}
                title="Instagram"
              >
                <Camera size={18} strokeWidth={2} />
              </a>
              <a
                href={`https://wa.me/${waNum}`}
                target="_blank"
                rel="noreferrer"
                className="ft-btn-hover t-btn-press"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1B3B22",
                  textDecoration: "none",
                }}
                title="WhatsApp Support"
              >
                <MessageCircle size={18} strokeWidth={2} />
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="ft-btn-hover t-btn-press"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1B3B22",
                  textDecoration: "none",
                }}
                title="Email Us"
              >
                <Mail size={18} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h4
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#1B3B22",
                marginBottom: 18,
              }}
            >
              Shop
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
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
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#1B3B22",
                marginBottom: 18,
              }}
            >
              Help &amp; Support
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
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

          {/* Col 4: Trust Badges */}
          <div>
            <h4
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#1B3B22",
                marginBottom: 18,
              }}
            >
              Our Promises
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#E7EFE8", color: "#1B3B22" }}>
                  <ShieldCheck size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#152B17" }}>Secure Payments</div>
                  <div style={{ fontSize: 11.5, color: "#736B5E" }}>256-bit encrypted Razorpay</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#E7EFE8", color: "#1B3B22" }}>
                  <Stethoscope size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#152B17" }}>48h Health Guarantee</div>
                  <div style={{ fontSize: 11.5, color: "#736B5E" }}>Vet-certified &amp; parasite-free</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#E7EFE8", color: "#1B3B22" }}>
                  <Heart size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#152B17" }}>Happiness Guarantee</div>
                  <div style={{ fontSize: 11.5, color: "#736B5E" }}>Lifetime feeding &amp; care support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid #E2DDD3",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12.5,
            color: "#736B5E",
          }}
        >
          <div>
            © 2026 FeatherTown Marketplace. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "clamp(12px, 3vw, 20px)", alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/privacy-policy" style={{ color: "#736B5E", textDecoration: "none" }}>
              Privacy
            </Link>
            <Link to="/terms" style={{ color: "#736B5E", textDecoration: "none" }}>
              Terms
            </Link>
            <a href="/sitemap.xml" style={{ color: "#736B5E", textDecoration: "none" }}>
              Sitemap
            </a>
            <span>Carefully raised companion birds across India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerLink = {
  fontSize: "13.5px",
  color: "#736B5E",
  textDecoration: "none",
  transition: "color 0.2s",
};
