import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import SpotlightCard from "./react-bits/SpotlightCard";

export default function BreedCard({ parrot }) {
  const { settings } = useSettings();
  const wa = (settings?.whatsapp || "919556747518").replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${wa}?text=${encodeURIComponent(
    `Hi FeatherTown! I'm interested in learning more about the ${parrot.name}. Can you share current availability and care details?`
  )}`;

  const isAvailable = parrot.status === "available" || parrot.status === "Available";

  return (
    <SpotlightCard
      className="t-hover-lift flex flex-col h-full group"
      spotlightColor="rgba(22, 163, 74, 0.14)"
      borderColor="#E2E8F0"
      style={{
        borderRadius: 24,
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)",
      }}
    >
      {/* IMAGE CONTAINER WITH ZOOM */}
      <div className="relative h-[230px] overflow-hidden bg-slate-50 t-img-zoom">
        <img
          src={parrot.image}
          alt={parrot.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Soft bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
          {/* Category Pill */}
          <span className="bg-white/95 backdrop-blur-md text-emerald-700 border border-emerald-200 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {parrot.category || "Parrot"}
          </span>

          {/* Availability Pill */}
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm backdrop-blur-md ${
              isAvailable
                ? "bg-emerald-50/95 text-emerald-700 border border-emerald-300"
                : "bg-rose-50/95 text-rose-700 border border-rose-300"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? "bg-emerald-600 ft-animate-badge-pulse" : "bg-rose-600"
              }`}
            />
            {isAvailable ? "Available" : "Waitlist"}
          </span>
        </div>

        {/* Price tag on photo */}
        <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-emerald-200 text-emerald-700 font-extrabold text-sm px-3.5 py-1 rounded-full shadow-md">
          {parrot.price}
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="p-5 flex flex-col flex-1 z-20">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors duration-200">
            {parrot.name}
          </h3>
          {parrot.species && (
            <span className="text-[11px] text-slate-400 italic truncate max-w-[120px]">
              {parrot.species}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4 flex-1 line-clamp-2">
          {parrot.description}
        </p>

        {/* Quick Trait Badges */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 mb-4 border border-slate-100 text-center">
          <div>
            <div className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Size</div>
            <div className="text-xs text-slate-800 font-bold mt-0.5">{parrot.size || "Medium"}</div>
          </div>
          <div className="border-x border-slate-200">
            <div className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Lifespan</div>
            <div className="text-xs text-slate-800 font-bold mt-0.5">{parrot.lifespan || "20-30y"}</div>
          </div>
          <div>
            <div className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Speech</div>
            <div className="text-xs text-slate-800 font-bold mt-0.5 truncate">{parrot.talkingAbility || "Good"}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <Link
            to={`/breed/${parrot.id}`}
            className="t-btn-press text-center py-2.5 px-3 rounded-xl border border-slate-300 text-slate-800 font-bold text-xs bg-white hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
          >
            Care Profile →
          </Link>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="t-btn-press flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
          >
            <span>💬</span> Inquire
          </a>
        </div>
      </div>
    </SpotlightCard>
  );
}
