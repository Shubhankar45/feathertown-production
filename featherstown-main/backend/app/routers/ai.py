import os
import json
import logging
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, Request

from app.auth import get_current_admin

logger = logging.getLogger("featherstown.ai")

router = APIRouter(prefix="/api/admin/ai", tags=["admin-ai"])

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""

async def _call_gemini(prompt: str, system_instruction: str = "") -> Optional[str]:
    """Attempts to call Google Gemini API if key is present."""
    if not GEMINI_API_KEY:
        return None
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        payload: Dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
            
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode("utf-8"))
                candidates = body.get("candidates") or []
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
    except Exception as e:
        logger.warning(f"Gemini API call failed, using built-in avian expert engine: {e}")
    return None

# ─────────────────────────────────────────────────────────────
# 1. BIRD LISTING AI GENERATOR
# ─────────────────────────────────────────────────────────────
@router.post("/bird-listing")
async def generate_bird_listing(
    request: Request,
    body: Dict[str, Any],
    admin: dict = Depends(get_current_admin)
):
    species = str(body.get("species") or "Companion Bird").strip()
    name = str(body.get("name") or species).strip()
    sex = str(body.get("dna_sex") or "Male ♂").strip()
    age = str(body.get("age") or "4-6 Months").strip()
    temperament = str(body.get("temperament") or "Gentle, hand-tamed & curious").strip()
    price = body.get("price") or ""

    prompt = (
        f"Generate a professional, warm, ethical bird listing for FeatherTown Aviary.\n"
        f"Bird: {name} (Species: {species}, Sex: {sex}, Age: {age}, Temperament: {temperament})\n"
        f"Format as JSON with keys: description, care_guide, health_notes, selling_points (list of 4 strings)."
    )
    
    gemini_res = await _call_gemini(prompt, "You are FeatherTown's avian expert and copywriter. Return valid JSON only.")
    if gemini_res:
        try:
            clean_res = gemini_res.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean_res)
            return {"success": True, "source": "gemini", **parsed}
        except Exception:
            pass

    # Built-in High Quality Avian Expert Engine
    species_lower = species.lower()
    if "conure" in species_lower:
        desc = (
            f"Meet {name}, a delightfully cheerful {species} with vibrant plumage and a heartwarming bond with people. "
            f"Hand-fed from early hatch, {name} is fully weaned onto high-grade organic pellets, fresh seasonal greens, "
            f"and sprout salads. Exceptionally affectionate, eager to perch on shoulders, and loves head scratches."
        )
        care = (
            "Requires minimum cage dimensions of 30x20x34 inches with 1/2-inch bar spacing. "
            "Diet consists of 70% cold-pressed pellets, 25% fresh vegetables/sprouts, and 5% seeds/nuts as training treats. "
            "Provide daily foraging toys and at least 2 hours of supervised flight or play outside the cage."
        )
        health = (
            f"DNA sexed as {sex}. Closed-band verified with seamless identification ring. "
            "Negative for PBFD and Avian Polyomavirus. Active feather condition and clear nares/eyes."
        )
        selling_points = [
            "Hand-tamed & step-up trained",
            "Weaned to healthy pellet & fresh food diet",
            "DNA Sexing Certificate included",
            "Free 30-day aviary onboarding & nutrition consultation"
        ]
    elif "grey" in species_lower or "african" in species_lower:
        desc = (
            f"Presenting {name}, an exceptionally gifted African Grey parrot renowned for supreme intelligence, "
            f"attentive listening, and profound companion bonding. Hand-reared with positive reinforcement, {name} "
            f"displays remarkable curiosity, problem-solving prowess, and gentle step-up manners."
        )
        care = (
            "Requires a spacious powder-coated wrought iron flight unit (at least 36x28x60 inches). "
            "Daily cognitive stimulation, puzzle foraging toys, and rich calcium/vitamin D3 dietary support are essential."
        )
        health = (
            f"DNA certified {sex}. Microchipped and closed stainless steel band verified. "
            "Screened for Psittacine Circovirus (PBFD), Chlamydia, and Bornavirus. Flawless flight feather symmetry."
        )
        selling_points = [
            "Supreme linguistic & cognitive potential",
            "DNA Certified & closed band verified",
            "Hand-socialized in peaceful aviary environment",
            "Lifetime dietary & behavioral support from FeatherTown"
        ]
    elif "cockatiel" in species_lower:
        desc = (
            f"{name} is a sweet, musical {species} with iconic rosy cheeks and a loving personality. "
            f"Naturally calm and fond of whistling melodic tunes, {name} steps up on command and loves gentle cheek scritches."
        )
        care = (
            "Requires a cage with horizontal bars for climbing (minimum 24x18x24 inches). "
            "Diet must balance small parrot pellets, millet spray as reward, leafy greens, and cuttlebone for calcium."
        )
        health = (
            f"DNA certified {sex}. Complete wellness check verified. Clean cere, clear respiratory sounds, and alert posture."
        )
        selling_points = [
            "Gentle temperament, ideal for first-time bird owners",
            "Enjoys whistling tunes and stepping up",
            "Acclimated to family home sounds",
            "Includes starter seed/pellet transition kit"
        ]
    else:
        desc = (
            f"Introducing {name}, a beautiful and healthy {species} hand-reared at FeatherTown Aviary. "
            f"Socialized with gentle daily handling, {name} is active, curious, and eager to bring joy into a dedicated companion home."
        )
        care = (
            "Needs an appropriately sized aviary or cage with non-toxic perches of varied branch diameters. "
            "Provide balanced avian nutrition, fresh filtered water daily, and ample social interaction."
        )
        health = (
            f"Certified {sex}. Closed ring identified. In robust physical health with excellent feather sheen and vitality."
        )
        selling_points = [
            "Ethically bred & hand-socialized",
            "Weaned and independent",
            "Comprehensive health check cleared",
            "Includes FeatherTown Aviary Care Certificate"
        ]

    return {
        "success": True,
        "source": "avian_engine",
        "description": desc,
        "care_guide": care,
        "health_notes": health,
        "selling_points": selling_points
    }

# ─────────────────────────────────────────────────────────────
# 2. PRODUCT & CAGE AI DESCRIPTION GENERATOR
# ─────────────────────────────────────────────────────────────
@router.post("/product-description")
async def generate_product_description(
    request: Request,
    body: Dict[str, Any],
    admin: dict = Depends(get_current_admin)
):
    name = str(body.get("name") or "Avian Accessory").strip()
    category = str(body.get("category") or "Accessories").strip()
    price = body.get("price") or ""

    prompt = (
        f"Generate a compelling, high-converting product listing for FeatherTown Shop.\n"
        f"Product: {name} (Category: {category})\n"
        f"Format as JSON with keys: description, features (list of 4 strings), specifications."
    )

    gemini_res = await _call_gemini(prompt, "You are FeatherTown's avian product specialist. Return valid JSON only.")
    if gemini_res:
        try:
            clean_res = gemini_res.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean_res)
            return {"success": True, "source": "gemini", **parsed}
        except Exception:
            pass

    # Expert Engine Fallback
    cat_lower = category.lower()
    if "cage" in cat_lower or "housing" in cat_lower:
        desc = (
            f"Engineered for ultimate safety, comfort, and longevity, the {name} offers your companion bird "
            f"a secure, stimulating living sanctuary. Built with heavy-gauge wrought iron and finished with "
            f"100% bird-safe non-toxic powder coating resistant to rust and beak wear."
        )
        features = [
            "Lead and zinc-free powder-coated wrought iron frame",
            "Slide-out bottom debris tray and safety grille for effortless cleaning",
            "Heavy-duty bird-proof door locks to prevent escape",
            "Rolling casters for smooth mobility around your living space"
        ]
        specs = "Durable welded wire, 1/2\" to 5/8\" bar spacing, stainless steel food bowls included."
    elif "feed" in cat_lower or "food" in cat_lower or "nutrition" in cat_lower:
        desc = (
            f"Give your birds premium, nutritionally balanced nourishment with {name}. "
            f"Carefully formulated by avian nutritionists to provide essential amino acids, Omega-3 fatty acids, "
            f"and vital vitamins for vibrant plumage and robust immune health."
        )
        features = [
            "All-natural ingredients with zero artificial dyes or chemical preservatives",
            "Fortified with prebiotics and enzymes to support healthy digestion",
            "High palatability to encourage easy transition from all-seed diets",
            "Rich in beta-carotene for brilliant, naturally radiant feathers"
        ]
        specs = "Vacuum sealed for peak freshness. Suitable for Conures, Cockatiels, and Medium Parrots."
    else:
        desc = (
            f"The {name} is specifically chosen by FeatherTown's avian care team to enrich your bird's "
            f"daily environment, promote mental agility, and satisfy natural foraging and chewing instincts."
        )
        features = [
            "Constructed from 100% pet-safe, non-toxic natural materials",
            "Promotes physical exercise and prevents boredom-related feather plucking",
            "Easy quick-link attachment compatible with all standard cage grids",
            "Rigorously tested for safe beak and talon interaction"
        ]
        specs = "Certified avian-safe hardware, natural dye, high durability."

    return {
        "success": True,
        "source": "avian_engine",
        "description": desc,
        "features": features,
        "specifications": specs
    }

# ─────────────────────────────────────────────────────────────
# 3. SOCIAL MEDIA & AD COPY AI GENERATOR
# ─────────────────────────────────────────────────────────────
@router.post("/ad-copy")
async def generate_ad_copy(
    request: Request,
    body: Dict[str, Any],
    admin: dict = Depends(get_current_admin)
):
    platform = str(body.get("platform") or "instagram").lower().strip()
    item_name = str(body.get("item_name") or "Hand-Tamed Companion Birds").strip()
    category = str(body.get("category") or "Birds").strip()
    offer = str(body.get("offer") or "").strip()

    prompt = (
        f"Generate high-converting {platform.upper()} marketing ad copy for FeatherTown Aviary.\n"
        f"Item: {item_name} (Category: {category}, Special Offer: {offer or 'Free starter kit & care session'})\n"
        f"Format as JSON with keys: headline, caption, hashtags (single string of hashtags), call_to_action."
    )

    gemini_res = await _call_gemini(prompt, "You are an expert social media growth marketer for boutique pet aviaries. Return valid JSON only.")
    if gemini_res:
        try:
            clean_res = gemini_res.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean_res)
            return {"success": True, "source": "gemini", **parsed}
        except Exception:
            pass

    # Built-in Copywriter Engine
    if platform == "instagram":
        headline = f"✨ Meet Your New Feathered Best Friend: {item_name}! 🦜"
        caption = (
            f"Ready to fill your home with joyful whistles and heartwarming snuggles? 🌿\n\n"
            f"At FeatherTown Aviary, every single one of our birds is ethically raised, hand-socialized, "
            f"and weaned onto wholesome nutrition. Our {item_name} is gentle, curious, and eager to step up right onto your hand!\n\n"
            f"✅ DNA Certified & Closed Band Verified\n"
            f"✅ 100% Weaned & In Peak Health\n"
            f"✅ Free 30-Day Onboarding Support\n\n"
            f"{f'🔥 Special Offer: {offer}' if offer else '📦 Includes starter feed transition kit!'}\n\n"
            f"📍 Visit our aviary or book online at feathertown.online\n"
            f"📲 Send us a DM or WhatsApp to schedule a private viewing today!"
        )
        hashtags = "#FeatherTown #ParrotLovers #PetBirds #ConureLove #BirdShop #HandTamedBirds #ExoticBirds #BirdLoversIndia #CompanionBirds #HappyBirds"
        cta = "Send DM to Reserve or WhatsApp Us"
    elif platform == "facebook":
        headline = f"Looking for a Loving Companion? Hand-Raised {item_name} at FeatherTown 🦜"
        caption = (
            f"Experience the unconditional love of a healthy, hand-tamed companion bird!\n\n"
            f"We are proud to offer our ethically bred {item_name}. Each bird comes with complete DNA documentation, "
            f"health screening, and lifetime dietary guidance from our passionate aviary specialists.\n\n"
            f"Why choose FeatherTown Aviary?\n"
            f"• Ethically raised in clean, spacious enclosures\n"
            f"• Daily hand-socialization with human interaction\n"
            f"• Weaned on premium cold-pressed pellets and fresh greens\n\n"
            f"Click 'Learn More' to see photos, ring IDs, and pricing on our live catalog."
        )
        hashtags = "#FeatherTown #PetLovers #BirdAviary #FamilyPet #HealthyBirds"
        cta = "Visit feathertown.online / Message Page"
    elif platform == "whatsapp":
        headline = f"🦜 FeatherTown Aviary: {item_name} Available Now!"
        caption = (
            f"Hello from *FeatherTown Aviary*! 🌿\n\n"
            f"We currently have hand-tamed *{item_name}* ready for dedicated companion homes.\n\n"
            f"• *Status:* Hand-fed, fully weaned & active\n"
            f"• *Health:* DNA sexed & closed band verified\n"
            f"{f'• *Offer:* {offer}' if offer else '• *Perks:* Free dietary starter kit included'}\n\n"
            f"Reply *'YES'* to receive photos, videos, and reserve your viewing appointment!"
        )
        hashtags = ""
        cta = "Reply YES to Chat with Breeder"
    else: # Google Ad
        headline = f"Buy Hand-Tamed {item_name} | FeatherTown Certified Aviary"
        caption = f"Healthy, DNA-sexed {item_name} raised with love. Hand-fed, weaned & active. Free care guide and nationwide support. View live flock online."
        hashtags = ""
        cta = "View Available Birds at feathertown.online"

    return {
        "success": True,
        "source": "copywriter_engine",
        "headline": headline,
        "caption": caption,
        "hashtags": hashtags,
        "call_to_action": cta
    }

# ─────────────────────────────────────────────────────────────
# 4. FEATHERTOWN AI ADVISOR & CHAT ASSISTANT
# ─────────────────────────────────────────────────────────────
@router.post("/chat-advisor")
async def chat_advisor(
    request: Request,
    body: Dict[str, Any],
    admin: dict = Depends(get_current_admin)
):
    query = str(body.get("query") or body.get("message") or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail={"msg": "Query prompt is required"})

    prompt = (
        f"You are FeatherTown AI, the intelligent aviary management and retail advisor for FeatherTown Aviary & Shop.\n"
        f"Store context: Sells premium hand-tamed companion birds (Conures, Cockatiels, African Greys), flight cages, organic feed, and toys.\n"
        f"Store Website: feathertown.online\n"
        f"Question from Admin: {query}\n"
        f"Provide a clear, practical, highly actionable response in 2-3 concise paragraphs, followed by 3 actionable bullet recommendations."
    )

    gemini_res = await _call_gemini(prompt)
    if gemini_res:
        return {
            "success": True,
            "source": "gemini",
            "reply": gemini_res
        }

    # Built-in Smart Aviary Advisor Fallback
    q_lower = query.lower()
    if "price" in q_lower or "pricing" in q_lower:
        reply = (
            "When pricing hand-tamed companion birds, factor in weaning duration, species rarity, and DNA certification. "
            "For example, Sun Conures in India typically sell between ₹18,000 – ₹24,000 when fully hand-tamed with closed rings, "
            "while Cockatiels range from ₹4,000 – ₹6,000. \n\n"
            "Key Strategy:\n"
            "• Bundle a starter pack (cage + food + toy) with the bird for a 15% margin boost.\n"
            "• Highlight 'Hand-fed & DNA Certified' as premium value drivers on feathertown.online.\n"
            "• Keep prices transparent to build long-term trust with first-time bird parents."
        )
    elif "marketing" in q_lower or "sales" in q_lower or "promo" in q_lower:
        reply = (
            "To accelerate bird and cage sales this week, leverage video content showing gentle interactions. "
            "Reels showing a bird stepping up on fingers or eating fruit from an owner's hand generate 4x higher conversion than static pictures.\n\n"
            "Recommended Action Plan:\n"
            "• Post a 15-second Instagram Reel: 'A day in the life at FeatherTown Aviary'.\n"
            "• Run a weekend bundle promo: 'Buy a Conure & Get 20% off Flight Cage'.\n"
            "• Broadcast new arrivals to your email subscribers and WhatsApp status."
        )
    elif "diet" in q_lower or "feed" in q_lower or "nutrition" in q_lower:
        reply = (
            "A balanced parrot diet should never be 100% seeds. Excess sunflower seeds cause hepatic lipidosis (fatty liver disease). "
            "FeatherTown's recommended baseline is 60-70% high-quality cold-pressed pellets, 25% fresh vegetables/sprouts, "
            "and 5-10% nuts/seeds used exclusively for training and positive reinforcement."
        )
    elif "hand" in q_lower or "tame" in q_lower or "wean" in q_lower:
        reply = (
            "Weaning should always be abundance-led, never forced by starvation. Transition chicks gradually from 3 formula feeds "
            "to warm soaked pellets and millet sprays around 6-8 weeks of age. Daily 15-minute gentle handling sessions "
            "cement lifelong hand-tamed trust."
        )
    else:
        reply = (
            f"Here is your FeatherTown operational recommendation for '{query}':\n\n"
            "Ensure that every bird listed on feathertown.online has clear high-resolution photos, ring number, and DNA sex status. "
            "Pairing bird listings with the recommended flight cage creates immediate cross-sell revenue.\n\n"
            "Next Steps:\n"
            "• Review active inventory in the Birds tab to ensure all 6 birds have updated photos.\n"
            "• Use the AI Ad Copywriter in Marketing to post an Instagram update.\n"
            "• Check pending orders and customer inquiries for fast turnaround."
        )

    return {
        "success": True,
        "source": "avian_advisor",
        "reply": reply
    }
