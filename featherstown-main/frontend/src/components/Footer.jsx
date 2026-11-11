/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Modern Editorial E-Commerce Footer
   /components/Footer.jsx

   Directly modeled on the reference design:
   - Full-width Deep Forest Green background (#1B3B22)
   - Left: Typographic logo, mission statement, clean social icons
   - 3 clean columns: Shop, Customer Care, About Us
   - Right: "A Kinder World for Birds ❤️" stylized script graphic
   - Bottom Bar: Copyright 2026, Privacy Policy, Terms of Service, Sitemap
   - Strict 60-30-10 palette, 100% Lucide React icons, zero emojis
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Mail,
  Feather,
  Heart,
  HelpCircle,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

function InstagramIcon({ size = 17, strokeWidth = 2.2 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  const { settings } = useSettings();

  const openCookiePreferences = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("ft_reopen_cookie_preferences"));
  };

  const waNum = (settings?.whatsapp || "919556747518").replace(/\D/g, "");
  const instaUrl =
    settings?.instagramUrl || "https://www.instagram.com/feather_town__?igsh=MWV2ZXdqbzlidmk4aw==";
  const supportEmail = settings?.email || "care@feathertown.online";

  return (
    <footer
      style={{
        background: "#1B3B22",
        color: "#FAF8F5",
        fontFamily: "Outfit, system-ui, sans-serif",
        paddingTop: "clamp(48px, 6vw, 72px)",
        paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "0 clamp(16px, 4.5vw, 64px)",
        }}
      >
        {/* Main Columns Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "clamp(32px, 4vw, 48px)",
            marginBottom: "clamp(40px, 5vw, 60px)",
            alignItems: "flex-start",
          }}
        >
          {/* Column 1: Brand & Bio */}
          <div style={{ maxWidth: 320 }}>
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
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#FAF8F5",
                  letterSpacing: "-0.025em",
                }}
              >
                Feather
              </span>
              <span
                style={{
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

            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "#CCD8CE",
                margin: "0 0 20px 0",
              }}
            >
              Premium aviary &amp; companion bird essentials for happier, healthier flocks. Because birds are family.
            </p>

            {/* Social Icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a
                href={instaUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#FAF8F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                }}
                className="t-hover-lift"
                aria-label="Instagram"
              >
                <InstagramIcon size={17} strokeWidth={2.2} />
              </a>

              <a
                href={`https://wa.me/${waNum}?text=Hi%20FeatherTown!`}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#FAF8F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                }}
                className="t-hover-lift"
                aria-label="WhatsApp"
              >
                <MessageCircle size={17} strokeWidth={2.2} />
              </a>

              <a
                href={`mailto:${supportEmail}`}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#FAF8F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                }}
                className="t-hover-lift"
                aria-label="Email"
              >
                <Mail size={17} strokeWidth={2.2} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#FAF8F5",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                margin: "0 0 16px 0",
              }}
            >
              Shop
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>
                <Link to="/accessories?category=food" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Bird Food &amp; Seeds
                </Link>
              </li>
              <li>
                <Link to="/birds" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Companion Birds
                </Link>
              </li>
              <li>
                <Link to="/accessories?category=toys" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Foraging &amp; Toys
                </Link>
              </li>
              <li>
                <Link to="/accessories?category=cages" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Cages &amp; Aviaries
                </Link>
              </li>
              <li>
                <Link to="/accessories?category=grooming" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Grooming &amp; Hygiene
                </Link>
              </li>
              <li>
                <Link to="/accessories?category=health" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Health &amp; Wellness
                </Link>
              </li>
              <li>
                <Link to="/accessories?badge=Sale" style={{ color: "#F5A396", fontSize: 13.5, textDecoration: "none", fontWeight: 700 }} className="hover:text-white transition-colors">
                  Special Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#FAF8F5",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                margin: "0 0 16px 0",
              }}
            >
              Customer Care
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>
                <Link to="/my-orders" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Help &amp; FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About Us */}
          <div>
            <h4
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#FAF8F5",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                margin: "0 0 16px 0",
              }}
            >
              About Us
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>
                <Link to="/about" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Our Aviary Story
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Health &amp; Breeding Standards
                </Link>
              </li>
              <li>
                <Link to="/compare" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Compare Parrot Breeds
                </Link>
              </li>
              <li>
                <Link to="/quiz" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Which Bird Suits You? Quiz
                </Link>
              </li>
              <li>
                <Link to="/reviews" style={{ color: "#CCD8CE", fontSize: 13.5, textDecoration: "none" }} className="hover:text-white transition-colors">
                  Customer Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Right Aesthetic Callout ("A Kinder World for Birds ❤️") */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingLeft: "clamp(0px, 2vw, 24px)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FAF8F5",
                marginBottom: 14,
              }}
            >
              <Feather size={22} strokeWidth={2.2} />
            </div>

            <div
              style={{
                fontFamily: "Outfit, system-ui, sans-serif",
                fontSize: "clamp(22px, 2.2vw, 28px)",
                fontWeight: 800,
                lineHeight: 1.25,
                color: "#FAF8F5",
                letterSpacing: "-0.015em",
              }}
            >
              A Kinder <br />
              World for <br />
              <span style={{ color: "#D9381E", display: "inline-flex", alignItems: "center", gap: 6 }}>
                Birds <Heart size={20} fill="#D9381E" strokeWidth={0} />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div
          style={{
            paddingTop: 24,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 12.5,
            color: "#A2B4A5",
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} FeatherTown. All rights reserved.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <Link to="/privacy-policy" style={{ color: "#A2B4A5", textDecoration: "none" }} className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms-conditions" style={{ color: "#A2B4A5", textDecoration: "none" }} className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <a href="/sitemap.xml" style={{ color: "#A2B4A5", textDecoration: "none" }} className="hover:text-white transition-colors">
              Sitemap
            </a>
            <span>•</span>
            <button
              onClick={openCookiePreferences}
              style={{
                background: "none",
                border: "none",
                color: "#A2B4A5",
                fontSize: 12.5,
                cursor: "pointer",
                padding: 0,
              }}
              className="hover:text-white transition-colors"
            >
              Cookie Preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
