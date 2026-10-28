import { createContext, useContext, useState, useEffect, useCallback } from "react";

import sun from "../assets/Sun-conure.jfif";
import grey from "../assets/african.png";
import macaw from "../assets/macaw.png";
import green from "../assets/green.jpg";
import pineapple from "../assets/pineapple.jpeg";
import cocketail from "../assets/cocketail.jpg";
import pine from "../assets/pineapple.png";

// Map asset paths from MongoDB seed to bundled assets
const ASSET_MAP = {
  "/assets/Sun-conure.jfif": sun,
  "/assets/african.png": grey,
  "/assets/macaw.png": macaw,
  "/assets/green.jpg": green,
  "/assets/pineapple.jpeg": pineapple,
  "/assets/cocketail.jpg": cocketail,
  "/assets/pineapple.png": pine,
};

export function resolveBirdImage(img) {
  if (!img) return sun;
  if (ASSET_MAP[img]) return ASSET_MAP[img];
  return img;
}

const BirdsContext = createContext({
  birds: [],
  loading: true,
  error: null,
  refreshBirds: () => {},
  getBirdByIdOrSlug: () => null,
});

export function BirdsProvider({ children }) {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBirds = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/birds");
      if (!res.ok) throw new Error("Failed to fetch birds");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Map images to bundled assets where applicable
        const normalized = data.map((b, idx) => ({
          ...b,
          id: b._id || b.id || idx + 1,
          image: resolveBirdImage(b.image),
          rawImage: b.image,
        }));
        setBirds(normalized);
      }
      setError(null);
    } catch (err) {
      console.warn("Could not load dynamic birds from server:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBirds();
  }, [fetchBirds]);

  const getBirdByIdOrSlug = useCallback(
    (idOrSlug) => {
      if (!idOrSlug) return null;
      const target = String(idOrSlug).toLowerCase().trim();
      return (
        birds.find(
          (b) =>
            String(b.id) === target ||
            String(b._id) === target ||
            (b.slug && b.slug.toLowerCase() === target) ||
            b.name.toLowerCase() === target
        ) || null
      );
    },
    [birds]
  );

  return (
    <BirdsContext.Provider
      value={{
        birds,
        loading,
        error,
        refreshBirds: fetchBirds,
        getBirdByIdOrSlug,
      }}
    >
      {children}
    </BirdsContext.Provider>
  );
}

export function useBirds() {
  const ctx = useContext(BirdsContext);
  if (!ctx) {
    throw new Error("useBirds must be used within a BirdsProvider");
  }
  return ctx;
}
