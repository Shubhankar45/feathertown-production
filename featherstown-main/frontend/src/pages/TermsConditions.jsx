import { Link } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { useSettings } from "../context/SettingsContext";

export default function TermsConditions() {
  const { settings } = useSettings();
  const contactPhone = settings?.phone || "+91 9556747518";
  return (
    <div style={{ background: "var(--j0)", color: "var(--cream)", fontFamily: "var(--font-b)", minHeight: "100vh" }}>
      <SEOHead
        title="Terms &amp; Conditions | FeatherTown"
        description="Review the terms and conditions governing the purchase of healthy birds, bird care accessories, shipping, and guarantees at FeatherTown."
      />

      <PageBanner
        eyebrow="Customer Agreement"
        title="Terms &amp;"
        accent="Conditions"
        desc="Our mutual commitments for ethical bird companionship, accessory orders, and service standards."
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
            <span style={{ fontSize: 13, color: "var(--ghost)", fontWeight: 600 }}>Effective Date: October 2026</span>
            <span style={{ fontSize: 13, color: "var(--leaf)", fontWeight: 700 }}>FeatherTown General Terms</span>
          </div>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or purchasing through FeatherTown (www.feathertown.online), you agree to be bound by these Terms and Conditions. If you disagree with any portion of these terms, please refrain from using our marketplace.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              2. Ethical Bird Companionship &amp; Live Pet Policy
            </h2>
            <p style={{ marginBottom: 10 }}>FeatherTown operates with the highest standards of animal welfare:</p>
            <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Legal Compliance:</strong> We only breed and rehome non-native captive-bred companion bird species (e.g. South American Conures, African Grey, Australian Cockatiels) in strict accordance with the Wildlife Protection Act (India) and PARIVESH portal registration norms. We do not sell native wild Indian birds.</li>
              <li><strong>48-Hour Health Observation Guarantee:</strong> Every companion bird is vet-inspected prior to handover. In the extremely rare event that an avian veterinarian diagnoses an underlying congenital illness within 48 hours of adoption, FeatherTown provides full medical assistance or replacement.</li>
              <li><strong>Age Requirement:</strong> Prospective bird adopters must be at least 18 years of age and commit to providing a clean, cage-adequate, and nutritious living environment.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              3. Accessories, Cages &amp; Seed Orders
            </h2>
            <p style={{ marginBottom: 10 }}>For all online accessory and food store orders:</p>
            <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Pricing &amp; Availability:</strong> All prices are in Indian Rupees (INR) inclusive of applicable taxes. In case of unintentional pricing discrepancies, we reserve the right to contact you prior to shipment.</li>
              <li><strong>Shipping &amp; Delivery:</strong> Physical accessories are dispatched within 24-48 business hours via insured surface or air courier. Delivery timelines typically span 3-6 business days depending on location.</li>
              <li><strong>Damaged Shipments:</strong> Please inspect accessory parcels upon arrival. For transit damage, notify us with an unboxing photo/video within 48 hours for an instant replacement.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              4. Return &amp; Refund Policy
            </h2>
            <p>
              Accessories (cages, toys, perches, feeders) may be returned within 7 days of delivery provided they remain unused, in original packaging, and in hygienic condition. Food items and seed blends cannot be returned once opened due to biological safety protocols.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              5. Intellectual Property
            </h2>
            <p>
              All trademarks, photography, FeatherTown branding, bird care guides, and site designs are the exclusive property of FeatherTown and protected by intellectual property laws. Unauthorized reproduction is prohibited.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              6. Limitation of Liability &amp; Governing Law
            </h2>
            <p>
              FeatherTown provides dietary and training suggestions in good faith for general education; they do not replace emergency veterinary diagnosis. These Terms are governed by the laws of India, and any disputes shall fall within the jurisdiction of the competent courts of Sundargarh / Bhubaneswar, Odisha.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--cream)", marginBottom: 12 }}>
              7. Questions &amp; Support
            </h2>
            <p>
              For questions regarding our terms, reach out anytime via our{" "}
              <Link to="/contact" style={{ color: "var(--leaf)", fontWeight: 600 }}>Contact Page</Link> or WhatsApp helpline at {contactPhone}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
