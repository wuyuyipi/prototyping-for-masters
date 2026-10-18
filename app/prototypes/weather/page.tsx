"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import styles from "./styles.module.css";
import {
  MET_WEATHER_MASTERWORKS,
  MetArtworkData,
  resolveWeatherArtCategory,
} from "./metArtworks";
import { MannequinDoll } from "./MannequinDoll";

const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "";

type WeatherPayload = {
  city: string;
  country: string;
  coord?: { lat: number; lon: number };
  condition: string;
  emoji: string;
  temp: number;
  feelsLike: number;
  high: number;
  low: number;
  humidity: number;
  pressureInHg: number;
  pressureHpa: number;
  windSpeed: number;
  windDirection: string;
  clouds: number;
  visibilityMiles: number;
  sunrise: string;
  sunset: string;
  airQuality: string;
  units: "imperial" | "metric";
  hourly: {
    time: string;
    day?: string;
    temp: number;
    emoji: string;
    condition: string;
    pop: number;
  }[];
  forecast: {
    day: string;
    condition: string;
    emoji: string;
    high: number;
    low: number;
  }[];
  updatedAt: string;
};

// Weather emoji helper for client-side direct fetch fallback
function getWeatherEmoji(id: number, iconCode: string = "01d"): string {
  if (id >= 200 && id < 300) return "⛈️";
  if (id >= 300 && id < 400) return "🌦️";
  if (id >= 500 && id < 600) return "🌧️";
  if (id >= 600 && id < 700) return "❄️";
  if (id >= 700 && id < 800) return "🌫️";
  if (id === 800) return iconCode.endsWith("n") ? "🌙" : "☀️";
  if (id === 801) return iconCode.endsWith("n") ? "☁️" : "⛅";
  if (id > 801) return "☁️";
  return "🌤️";
}

function degToCompass(num: number): string {
  const val = Math.floor(num / 22.5 + 0.5);
  const arr = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
  ];
  return arr[val % 16];
}

const PRESET_CITIES = [
  "New York",
  "London",
  "Tokyo",
  "Paris",
  "San Francisco"
];

// Helper to format OpenWeather query parameter for coordinates, zip code, or city
function formatOpenWeatherLocationQuery(query: string): string {
  const trimmed = query.trim();

  // 1. Direct coordinates format: "40.7128, -74.0060"
  const coordsMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lon = parseFloat(coordsMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return `lat=${lat}&lon=${lon}`;
    }
  }

  // 2. US 5-digit zip or 5+4 zip: "10001" or "10001-1234"
  const usZipMatch = trimmed.match(/^(\d{5})(?:-\d{4})?$/);
  if (usZipMatch) {
    return `zip=${encodeURIComponent(usZipMatch[1])},US`;
  }

  // 3. Zip code with explicit country code: e.g. "10001, US" or "90210, USA" or "75001, FR"
  const zipWithCountryMatch = trimmed.match(/^([\w\s-]+),\s*([a-zA-Z]{2,3})$/);
  if (zipWithCountryMatch && /\d/.test(zipWithCountryMatch[1])) {
    const postal = zipWithCountryMatch[1].trim();
    let country = zipWithCountryMatch[2].trim().toUpperCase();
    if (country === "USA") country = "US";
    return `zip=${encodeURIComponent(postal)},${country}`;
  }

  // 4. Any numeric-only string (3 to 8 digits)
  if (/^\d{3,8}$/.test(trimmed)) {
    return `zip=${trimmed},US`;
  }

  // 5. Default to city query: e.g. "New York", "Brooklyn, NY"
  return `q=${encodeURIComponent(trimmed)}`;
}

// Seamless infinite horizontal hourly ribbon subcomponent
function InfiniteHourlyRibbon({
  hourly,
  tempSymbol,
}: {
  hourly: WeatherPayload["hourly"];
  tempSymbol: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAdjustingRef = useRef(false);

  // Triple the items array for endless continuous wrap: [Set 1, Set 2, Set 3]
  const repeatedItems = [...hourly, ...hourly, ...hourly];

  // Position at the start of Set 2 (middle) once items mount or update
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || hourly.length === 0) return;
    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth > 0) {
      el.scrollLeft = singleSetWidth;
    }
  }, [hourly]);

  // Seamless jump to prevent ever hitting a boundary
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || hourly.length === 0 || isAdjustingRef.current) return;

    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth <= 0) return;

    // Scrolling to the right: when reaching Set 3, wrap back into Set 2
    if (el.scrollLeft >= singleSetWidth * 2) {
      isAdjustingRef.current = true;
      el.scrollLeft -= singleSetWidth;
      isAdjustingRef.current = false;
    } else if (el.scrollLeft <= 5) {
      // Scrolling to the left: when reaching start of Set 1, wrap forward into Set 2
      isAdjustingRef.current = true;
      el.scrollLeft += singleSetWidth;
      isAdjustingRef.current = false;
    }
  };

  // Enable standard vertical mouse scroll wheels to pan horizontally
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      onWheel={handleWheel}
      className={styles.hourlyScrollContainer}
      aria-label="Hourly Forecast Continuous Ribbon"
    >
      <div className={styles.hourlyStrip}>
        {repeatedItems.map((slot, i) => (
          <div key={i} className={styles.hourlyCard}>
            {slot.day && <div className={styles.hourlyDay}>{slot.day}</div>}
            <div className={styles.hourlyHour}>{slot.time}</div>
            <div className={styles.hourlyEmoji}>{slot.emoji}</div>
            <div className={styles.hourlyTemp}>
              {slot.temp}
              {tempSymbol}
            </div>
            <div className={styles.hourlyPop}>{slot.pop}% rain</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type OutfitPiece = {
  category: string;
  label: string;
  image: string;
  imageAlt: string;
  styleTip: string;
  details: string;
};

type StylingAdvice = {
  vibe: string;
  summary: string;
  pieces: OutfitPiece[];
  advisory?: string;
};

function getStylingSuggestion(weather: WeatherPayload): StylingAdvice {
  const tempF =
    weather.units === "imperial"
      ? weather.temp
      : Math.round((weather.temp * 9) / 5 + 32);

  const cond = (weather.condition || "").toLowerCase();
  const isRain =
    cond.includes("rain") ||
    cond.includes("drizzle") ||
    cond.includes("shower") ||
    cond.includes("thunder");
  const isSnow =
    cond.includes("snow") ||
    cond.includes("sleet") ||
    cond.includes("flurr");
  const isBreezy = weather.windSpeed >= 14;

  let advice: StylingAdvice;

  if (isSnow) {
    advice = {
      vibe: "Winter Armor",
      summary: "Sub-freezing temperatures and snow expected. Prioritize high-insulation layers and water-sealed shells.",
      pieces: [
        {
          category: "Outerwear",
          label: "Down Parka or Heavy Puffer",
          image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Heavyweight quilted down puffer jacket",
          styleTip: "Quilted down-fill with high storm collar. Retains body core heat while shielding against wind and drifting snow.",
          details: "650+ Fill Goose Down • Water-Repellent Shell • Matte Slate",
        },
        {
          category: "Top & Layer",
          label: "Chunky Cable Knit & Thermal Crew",
          image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Chunky cable knit wool sweater",
          styleTip: "Heavy gauge wool cable sweater layered over a brushed merino base layer for core heat retention.",
          details: "100% Shetland Wool • Ribbed Hem & Cuffs • Ecru / Oatmeal",
        },
        {
          category: "Bottoms",
          label: "Fleece-Lined Trousers or Heavy Wool",
          image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Tailored heavyweight wool flannel trousers",
          styleTip: "Dense wool flannel cut with a generous taper to comfortably accommodate thermal long-johns underneath.",
          details: "Heavyweight Wool Melange • Double Pleated • Charcoal Grey",
        },
        {
          category: "Footwear",
          label: "Insulated Snow Boots with Grip Tread",
          image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Rugged waterproof leather winter boots",
          styleTip: "Vibram Arctic lug soles paired with treated water-sealed leather to handle slush and hidden ice patches.",
          details: "Treated Full-Grain Leather • Lug Grip Sole • Deep Espresso",
        },
        {
          category: "Accessories",
          label: "Ribbed Beanie, Wool Scarf & Gloves",
          image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Ribbed knit wool beanie and scarf",
          styleTip: "Thick gauge merino wool watch cap and brushed muffler to eliminate heat loss at the neck and ears.",
          details: "Merino Wool Blend • Heavy Rib Knit • Forest Green",
        },
      ],
      advisory: "Icy surfaces expected: prioritize high-traction winter tread and wind-resistant outer shell.",
    };
  } else if (isRain) {
    advice = {
      vibe: "Rain-Ready Tailoring",
      summary: "Wet atmospheric conditions. Focus on water-repellent outer layers, dark durable fabrics, and rain essentials.",
      pieces: [
        {
          category: "Outerwear",
          label: "Waterproof Trench Coat or Shell Jacket",
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Classic double-breasted beige trench coat",
          styleTip: "Double-breasted gabardine trench or technical 3-layer GORE-TEX shell with storm flap to repel rain.",
          details: "Water-Repellent Cotton Gabardine • Storm Collar • Classic Khaki",
        },
        {
          category: "Top & Layer",
          label: "Dense Cotton Hoodie or Fine Merino Knit",
          image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Heavyweight loopback cotton hoodie",
          styleTip: "Clean, tightly knit cotton fleece that holds its shape under an outer coat in damp, humid air.",
          details: "450gsm Loopback Cotton • Minimalist Silhouette • Heather Grey",
        },
        {
          category: "Bottoms",
          label: "Water-Resistant Chinos or Dark Denim",
          image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Dark raw selvedge denim jeans",
          styleTip: "Dark, heavyweight Japanese selvedge or treated twill that resists street splash and holds up to dampness.",
          details: "14oz Raw Selvedge Denim • Straight Fit • Deep Indigo",
        },
        {
          category: "Footwear",
          label: "Waterproof Chelsea Boots or Lug Soles",
          image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Black leather Chelsea boots with rubber soles",
          styleTip: "Elastic gusset leather Chelsea boots with commando lug soles to keep socks dry on wet pavement.",
          details: "Waxed Calfskin Leather • Storm Welt • Jet Black",
        },
        {
          category: "Accessories",
          label: "Windproof Umbrella & Weatherproof Tote",
          image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Matte black umbrella in rainy city",
          styleTip: "Reinforced fiberglass rib umbrella and TPU-coated waterproof carryall to safeguard your belongings.",
          details: "Fiberglass Frame • Matte Wooden Handle • Waterproof Cordura",
        },
      ],
      advisory: "Precipitation active: keep an umbrella handy and avoid untreated suede or canvas footwear.",
    };
  } else if (tempF < 42) {
    advice = {
      vibe: "Heavyweight Cold Layers",
      summary: "Chilly winter air. Build multi-layer thermal warmth with wool, shearling, or down insulation.",
      pieces: [
        {
          category: "Outerwear",
          label: "Tailored Wool Overcoat or Padded Puffer",
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Tailored wool overcoat in camel",
          styleTip: "Long-line wool-cashmere blend overcoat. Adds sharp structure and blocks cold drafts on exposed streets.",
          details: "80% Virgin Wool / 20% Cashmere • Horn Buttons • Camel / Tobacco",
        },
        {
          category: "Top & Layer",
          label: "Merino Wool Roll-Neck or Cable Knit",
          image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Merino wool knitwear roll-neck sweater",
          styleTip: "Fine-gauge turtleneck or mock neck that creates clean lines while trapping warm air against the neck.",
          details: "100% Extrafine Merino • Thermal Gauge • Off-White / Cream",
        },
        {
          category: "Bottoms",
          label: "Heavyweight Corduroy or Wool Slacks",
          image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Heavyweight corduroy trousers",
          styleTip: "Wide-wale corduroy or flannel trousers with natural drape. Warm, tactile, and effortlessly relaxed.",
          details: "8-Wale Cotton Corduroy • Relaxed Straight Leg • Dark Olive",
        },
        {
          category: "Footwear",
          label: "Sturdy Leather Boots & Thick Ribbed Socks",
          image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Goodyear-welted cap-toe leather boots",
          styleTip: "Goodyear-welted cap-toe boots paired with marled wool socks for warmth and timeless architectural utility.",
          details: "Full-Grain Oiled Leather • Dainite Rubber Sole • Dark Mahogany",
        },
        {
          category: "Accessories",
          label: "Cashmere Scarf & Knit Watch Cap",
          image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Warm cashmere scarf and knit hat",
          styleTip: "Plush brushed cashmere scarf in a neutral tone with a low-profile ribbed knit fisherman beanie.",
          details: "100% Grade-A Cashmere • 180cm x 35cm • Charcoal Heather",
        },
      ],
    };
  } else if (tempF < 58) {
    advice = {
      vibe: "Structured Autumn Layers",
      summary: "Crisp and brisk atmosphere. The ultimate temperature range for effortless multi-piece layering.",
      pieces: [
        {
          category: "Outerwear",
          label: "Chore Jacket, Trench or Leather Bomber",
          image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Workwear chore jacket in canvas",
          styleTip: "Boxy French workwear jacket in washed canvas or butter-soft leather bomber. The cornerstone of transitional layering.",
          details: "12oz Cotton Duck Canvas • Triple-Stitched Seams • French Blue / Tobacco",
        },
        {
          category: "Top & Layer",
          label: "Relaxed Knitwear or Button-Down Oxford",
          image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Classic oxford cloth button-down shirt",
          styleTip: "Substantial Oxford cloth button-down or fine lambswool crewneck. Looks sharp solo or peaking beneath a collar.",
          details: "100% Combed Oxford Cotton • Mother-of-Pearl Buttons • Classic Blue",
        },
        {
          category: "Bottoms",
          label: "Straight-Leg Selvedge Denim or Chinos",
          image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Straight leg selvedge denim jeans",
          styleTip: "Mid-rise, straight cut denim cuffed just above the footwear collar for an intentional proportion.",
          details: "13.5oz Kurabo Selvedge • Rinse Wash • Deep Indigo",
        },
        {
          category: "Footwear",
          label: "Classic Leather Derbies or Retro Sneakers",
          image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Minimalist leather sneaker",
          styleTip: "Polished plain-toe derbies or clean low-profile 70s-style gum-sole court trainers.",
          details: "Box Calf Leather or Suede • Leather Lining • Chalk White",
        },
        {
          category: "Accessories",
          label: "Light Wool Scarf & Canvas Tote Bag",
          image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Heavyweight canvas tote bag",
          styleTip: "Heavy 24oz duck canvas tote bag with reinforced handles for daily essentials and a folded light layer.",
          details: "Heavyweight Cotton Canvas • Brass Rivets • Natural Ecru",
        },
      ],
    };
  } else if (tempF < 72) {
    advice = {
      vibe: "Breezy Transitional Casual",
      summary: "Pleasant moderate climate. Clean single-layer styling with an optional light drape for cooler evenings.",
      pieces: [
        {
          category: "Outerwear",
          label: "Denim Overshirt, Cardigan or Field Jacket",
          image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Cardigan overshirt lightweight jacket",
          styleTip: "Unlined cotton overshirt or textured mohair cardigan. Easy to shed when temperatures climb mid-afternoon.",
          details: "Garment-Dyed Cotton Twill • Chest Patch Pockets • Washed Olive",
        },
        {
          category: "Top & Layer",
          label: "Heavyweight Cotton Tee or Polo",
          image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Heavyweight boxy cotton t-shirt",
          styleTip: "Boxy, dropped-shoulder heavyweight tee with a reinforced collar that won't curl or sag.",
          details: "280gsm Ring-Spun Cotton • Boxy Oversized Fit • Crisp White",
        },
        {
          category: "Bottoms",
          label: "Relaxed Linen Blend or Pleated Trousers",
          image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Relaxed pleated linen trousers",
          styleTip: "Single or double forward pleats offering effortless drape, airflow, and a relaxed architectural silhouette.",
          details: "Linen-Cotton Blend • High Rise • Taupe / Sand",
        },
        {
          category: "Footwear",
          label: "Minimalist Leather Sneakers or Loafers",
          image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Minimalist black and white sneakers",
          styleTip: "Penny loafers with no-show socks or monochrome leather tennis shoes for clean, versatile daily walking.",
          details: "Smooth Calf Leather • Rubber Cupsole • Black / White",
        },
        {
          category: "Accessories",
          label: "Acetate Sunglasses & Minimal Watch",
          image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Tortoiseshell acetate sunglasses",
          styleTip: "Custom milled acetate frames in Havana tortoiseshell with green tinted lenses and subtle steel wrist timepiece.",
          details: "Handmade Italian Acetate • 100% UV400 Protection • Amber Havana",
        },
      ],
    };
  } else if (tempF < 82) {
    advice = {
      vibe: "Warm Studio Ease",
      summary: "Warm and sun-drenched. Stick to breathable natural textiles, relaxed cuts, and sun protection.",
      pieces: [
        {
          category: "Outerwear",
          label: "Optional Open Linen Overshirt",
          image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Lightweight open linen overshirt",
          styleTip: "Unbuttoned linen overshirt worn loose over a tank or tee to provide breathable sun and breeze protection.",
          details: "100% Pure Normandy Linen • Garment Washed • Dusty Sage",
        },
        {
          category: "Top & Layer",
          label: "Airy Linen Button-Up or Boxy Pocket Tee",
          image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Relaxed pocket tee in black",
          styleTip: "Lightweight, pre-washed linen with a relaxed camp collar. Open at the neck for maximum thermal comfort.",
          details: "Slub Linen Weave • Relaxed Fit • Ecru / Terracotta",
        },
        {
          category: "Bottoms",
          label: "Tailored Chino Shorts or Linen Slacks",
          image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Tailored casual summer shorts",
          styleTip: "7-inch inseam tailored shorts in washed twill or loose, flowing wide-leg linen trousers.",
          details: "Washed Cotton Poplin • Elastic Waistband & Drawstring • Khaki",
        },
        {
          category: "Footwear",
          label: "Leather Mules, Slides or Canvas Lows",
          image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Leather summer shoes and loafers",
          styleTip: "Slip-on suede Boston-style clogs or deconstructed unlined loafers for effortless summer strolls.",
          details: "Oiled Nubuck Suede • Cork Footbed • Warm Taupe",
        },
        {
          category: "Accessories",
          label: "UV Polarized Sunglasses & Cotton Cap",
          image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Cotton baseball cap",
          styleTip: "Unstructured 6-panel dad cap in washed cotton twill to block glare without trapping heat.",
          details: "100% Washed Cotton • Antique Brass Clasp • Navy / Clay",
        },
      ],
    };
  } else {
    advice = {
      vibe: "High Heat Minimalist",
      summary: "High heat index. Maximize air permeability with ultralight, moisture-wicking natural fibers.",
      pieces: [
        {
          category: "Outerwear",
          label: "Featherlight Sun Drapes (Optional)",
          image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Airy summer drape wrap",
          styleTip: "Only sheer, ultra-breathable open weaves if direct sun exposure demands skin coverage; otherwise skip entirely.",
          details: "Sheer Voile or Silk-Cotton • Sun Shield • Ivory",
        },
        {
          category: "Top & Layer",
          label: "Featherlight Sleeveless or Camp Collar Shirt",
          image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Camp collar short sleeve summer shirt",
          styleTip: "Cuban camp collar shirt in breathable rayon or lightweight open-weave linen with a relaxed boxy cut.",
          details: "Tencel / Linen Blend • Camp Collar • Botanical / Cream",
        },
        {
          category: "Bottoms",
          label: "Breezy Linen Shorts or Airy Culottes",
          image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Breezy linen casual shorts",
          styleTip: "Ultra-lightweight drawstring shorts with generous leg openings to maximize continuous airflow.",
          details: "100% Delave Linen • Drawstring Waist • Washed Almond",
        },
        {
          category: "Footwear",
          label: "Ergonomic Slide Sandals or Mesh Runners",
          image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Leather slide sandals",
          styleTip: "Contoured leather slides or ultra-breathable engineered mesh trainers for heat dispersion.",
          details: "Full-Grain Leather Straps • Anatomical Footbed • Dark Espresso",
        },
        {
          category: "Accessories",
          label: "Wide-Brim Sun Hat, Shades & SPF",
          image: "https://images.unsplash.com/photo-1529720317453-c8da503f2051?auto=format&fit=crop&w=700&q=80",
          imageAlt: "Straw sun hat and sunglasses",
          styleTip: "Natural straw panama hat and polarized category 3 UV protection sunglasses with high SPF protection.",
          details: "Ecuadorian Toquilla Straw • Black Grosgrain Ribbon • Natural Straw",
        },
      ],
    };
  }

  if (isBreezy && !advice.advisory) {
    advice.advisory = `Brisk winds up to ${weather.windSpeed} ${
      weather.units === "imperial" ? "mph" : "m/s"
    }: opt for structured outer layers and secure headwear.`;
  }

  return advice;
}

/* ==========================================================================
   Climate Dressing Game Types & Logic
   ========================================================================== */

type GameWardrobeItem = {
  id: string;
  name: string;
  warmth: number; // 0 (featherlight) to 5 (arctic fortress)
  waterproof?: boolean;
  windproof?: boolean;
  breathable?: boolean;
  sunSafe?: boolean;
  description: string;
};

const WARDROBE_OPTIONS = {
  outerwear: [
    { id: "none", name: "None (Skip Layer)", warmth: 0, description: "No outer coat" },
    { id: "linen_overshirt", name: "Linen Overshirt", warmth: 1, breathable: true, sunSafe: true, description: "Light sun & breeze drape" },
    { id: "denim_jacket", name: "Denim Trucker Jacket", warmth: 2, windproof: true, description: "Mid-weight casual layer" },
    { id: "chore_coat", name: "Canvas Chore Coat", warmth: 3, windproof: true, description: "Sturdy French workwear" },
    { id: "trench_shell", name: "Waterproof Trench Shell", warmth: 3, waterproof: true, windproof: true, description: "Sealed rain shield" },
    { id: "wool_overcoat", name: "Tailored Wool Overcoat", warmth: 4, windproof: true, description: "Virgin wool long-line insulation" },
    { id: "down_parka", name: "Arctic Down Parka", warmth: 5, waterproof: true, windproof: true, description: "650-fill goose down fortress" },
  ] as GameWardrobeItem[],

  top: [
    { id: "ribbed_tank", name: "Ribbed Sleeveless Tank", warmth: 0, breathable: true, description: "Max airflow" },
    { id: "camp_shirt", name: "Linen Camp-Collar Shirt", warmth: 1, breathable: true, sunSafe: true, description: "Open weave summer shirt" },
    { id: "heavy_tee", name: "Heavyweight Boxy Tee", warmth: 2, breathable: true, description: "280gsm dense cotton" },
    { id: "oxford_shirt", name: "Oxford Button-Down", warmth: 2, description: "Structured woven shirting" },
    { id: "merino_knit", name: "Merino Wool Roll-Neck", warmth: 3, description: "Thermal fine-gauge wool" },
    { id: "cable_knit", name: "Chunky Cable Knit Sweater", warmth: 4, description: "Dense Shetland wool knit" },
  ] as GameWardrobeItem[],

  bottom: [
    { id: "linen_shorts", name: "Breezy Linen Shorts", warmth: 0, breathable: true, description: "Featherweight summer cut" },
    { id: "chino_shorts", name: "Tailored Chino Shorts", warmth: 1, breathable: true, description: "Classic mid-thigh twill" },
    { id: "linen_trousers", name: "Pleated Linen Trousers", warmth: 2, breathable: true, description: "Airy wide-leg drape" },
    { id: "selvedge_denim", name: "14oz Selvedge Denim", warmth: 3, windproof: true, description: "Heavyweight raw Japanese denim" },
    { id: "corduroy_pants", name: "Wide-Wale Corduroy Pants", warmth: 4, description: "Tactile thermal cotton" },
    { id: "thermal_pants", name: "Fleece-Lined Wool Slacks", warmth: 5, windproof: true, description: "Double-faced winter trousers" },
  ] as GameWardrobeItem[],

  shoes: [
    { id: "flip_flops", name: "Slide Sandals", warmth: 0, breathable: true, description: "Open-toe summer slip-ons" },
    { id: "leather_mules", name: "Leather Loafers / Mules", warmth: 1, description: "Smart casual slip-ons" },
    { id: "canvas_sneakers", name: "Canvas Court Sneakers", warmth: 2, description: "Low-profile everyday sneakers" },
    { id: "chelsea_boots", name: "Waterproof Chelsea Boots", warmth: 3, waterproof: true, description: "Rubber lug sole & waxed leather" },
    { id: "goodyear_boots", name: "Cap-Toe Leather Boots", warmth: 4, waterproof: true, windproof: true, description: "Goodyear-welted work boots" },
    { id: "arctic_snow_boots", name: "Insulated Snow Boots", warmth: 5, waterproof: true, windproof: true, description: "Treated leather with Arctic grip" },
  ] as GameWardrobeItem[],

  accessory: [
    { id: "none", name: "None (Hands Free)", warmth: 0, description: "No accessories" },
    { id: "straw_hat", name: "Wide-Brim Straw Hat", warmth: 0, sunSafe: true, description: "UV face and neck shade" },
    { id: "acetate_shades", name: "Polarized Sunglasses", warmth: 0, sunSafe: true, description: "Glare protection" },
    { id: "canvas_tote", name: "Heavy Canvas Tote", warmth: 0, description: "Everyday carryall" },
    { id: "windproof_umbrella", name: "Windproof Umbrella", warmth: 0, waterproof: true, description: "Fiberglass storm canopy" },
    { id: "cashmere_scarf_beanie", name: "Cashmere Scarf & Watch Cap", warmth: 2, windproof: true, description: "Thermal head and neck seal" },
  ] as GameWardrobeItem[],
};

type UserDressingOutfit = {
  outerwear: string;
  top: string;
  bottom: string;
  shoes: string;
  accessory: string;
};

const DEFAULT_USER_OUTFIT: UserDressingOutfit = {
  outerwear: "chore_coat",
  top: "oxford_shirt",
  bottom: "selvedge_denim",
  shoes: "canvas_sneakers",
  accessory: "canvas_tote",
};

type GameCritique = {
  score: number; // 0 to 100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  statusTitle: string;
  statusPill: string;
  pillVariant: "perfect" | "good" | "warning" | "danger";
  narrative: string;
  thermalStatus: string;
  moistureStatus: string;
  windStatus: string;
  totalWarmth: number;
  targetWarmth: number;
};

function evaluateUserOutfit(
  outfit: UserDressingOutfit,
  weather: WeatherPayload
): GameCritique {
  const tempF =
    weather.units === "imperial"
      ? weather.temp
      : Math.round((weather.temp * 9) / 5 + 32);

  const cond = (weather.condition || "").toLowerCase();
  const isRain =
    cond.includes("rain") ||
    cond.includes("drizzle") ||
    cond.includes("shower") ||
    cond.includes("thunder");
  const isSnow =
    cond.includes("snow") ||
    cond.includes("sleet") ||
    cond.includes("flurr");
  const isBreezy = weather.windSpeed >= 14;

  const curOuter =
    WARDROBE_OPTIONS.outerwear.find((item) => item.id === outfit.outerwear) ||
    WARDROBE_OPTIONS.outerwear[0];
  const curTop =
    WARDROBE_OPTIONS.top.find((item) => item.id === outfit.top) ||
    WARDROBE_OPTIONS.top[0];
  const curBottom =
    WARDROBE_OPTIONS.bottom.find((item) => item.id === outfit.bottom) ||
    WARDROBE_OPTIONS.bottom[0];
  const curShoes =
    WARDROBE_OPTIONS.shoes.find((item) => item.id === outfit.shoes) ||
    WARDROBE_OPTIONS.shoes[0];
  const curAccessory =
    WARDROBE_OPTIONS.accessory.find((item) => item.id === outfit.accessory) ||
    WARDROBE_OPTIONS.accessory[0];

  const totalWarmth =
    curOuter.warmth +
    curTop.warmth +
    curBottom.warmth +
    curShoes.warmth +
    curAccessory.warmth;

  // Calculate target warmth midpoint
  let targetWarmth = 8;
  if (tempF < 30) targetWarmth = 17;
  else if (tempF < 42) targetWarmth = 14;
  else if (tempF < 55) targetWarmth = 10;
  else if (tempF < 68) targetWarmth = 7;
  else if (tempF < 80) targetWarmth = 4;
  else targetWarmth = 1;

  let score = 100;
  const critiqueNotes: string[] = [];
  const remedyNotes: string[] = [];

  // Thermal discrepancy
  const thermalDiff = totalWarmth - targetWarmth;
  const thermalPenalty = Math.abs(thermalDiff) * 7;
  score -= thermalPenalty;

  let thermalStatus = "Balanced";
  if (thermalDiff <= -4) {
    thermalStatus = "Severely Underdressed";
    critiqueNotes.push(
      `Your setup has a severe thermal deficit for ${tempF}°${weather.units === "imperial" ? "F" : "C"}. You'll be shivering within minutes.`
    );
    remedyNotes.push(
      "Layer up with heavier knitwear or structured outerwear."
    );
  } else if (thermalDiff <= -2) {
    thermalStatus = "Slightly Chilly";
    critiqueNotes.push(
      `A bit too light for ${tempF}°. You might feel a noticeable chill on exposed limbs.`
    );
    remedyNotes.push(
      "Consider upgrading your top or throwing on a jacket."
    );
  } else if (thermalDiff >= 4) {
    thermalStatus = "Severely Overdressed";
    critiqueNotes.push(
      `Way too heavy for ${tempF}°. You're going to overheat rapidly.`
    );
    remedyNotes.push(
      "Shed the heavy outerwear or swap to breathable cotton/linen."
    );
  } else if (thermalDiff >= 2) {
    thermalStatus = "Warm / Stuffy";
    critiqueNotes.push(
      `A little warmer than necessary for today's temperature.`
    );
  } else {
    thermalStatus = "Immaculate Balance";
    critiqueNotes.push(
      `Thermal calibration is right on the money for ${tempF}°.`
    );
  }

  // Precipitation check
  let moistureStatus = "Dry Weather";
  if (isSnow) {
    if (curShoes.id === "flip_flops") {
      score -= 35;
      critiqueNotes.push(
        "Open sandals in active snowfall is a catastrophic choice!"
      );
      remedyNotes.push("Put on insulated snow boots immediately.");
      moistureStatus = "Extreme Hazard";
    } else if (curShoes.id !== "arctic_snow_boots" && curShoes.id !== "goodyear_boots") {
      score -= 20;
      critiqueNotes.push(
        "Your footwear lacks winter traction and will slip on snow."
      );
      remedyNotes.push("Swap to lugged winter boots.");
      moistureStatus = "Slipping Risk";
    } else {
      moistureStatus = "Snow Guarded";
    }

    if (curBottom.warmth <= 1) {
      score -= 25;
      critiqueNotes.push(
        "Wearing shorts in snow is a fast-track to numbness."
      );
    }
  } else if (isRain) {
    if (curShoes.id === "flip_flops" || curShoes.id === "canvas_sneakers") {
      score -= 22;
      critiqueNotes.push(
        "Your footwear will be thoroughly soaked by street puddles."
      );
      remedyNotes.push("Switch to waterproof Chelsea boots.");
      moistureStatus = "Soaked Footwear";
    } else if (curShoes.waterproof) {
      score += 5;
      moistureStatus = "Sealed Footwear";
    }

    const hasWaterBarrier =
      curOuter.id === "trench_shell" ||
      curOuter.id === "down_parka" ||
      curAccessory.id === "windproof_umbrella";

    if (!hasWaterBarrier) {
      score -= 25;
      critiqueNotes.push(
        "Active rainfall is coming down and you have neither an umbrella nor a water-resistant shell!"
      );
      remedyNotes.push("Grab an umbrella or a waterproof trench shell.");
      moistureStatus = "Unprotected in Rain";
    } else {
      score += 5;
      if (moistureStatus !== "Soaked Footwear") {
        moistureStatus = "Waterproofed";
      }
    }
  }

  // Wind check
  let windStatus = isBreezy ? "Exposed" : "Calm Skies";
  if (isBreezy) {
    if (curAccessory.id === "straw_hat") {
      score -= 10;
      critiqueNotes.push(
        `High winds (${weather.windSpeed} ${weather.units === "imperial" ? "mph" : "m/s"}) will blow that wide-brim straw hat down the block.`
      );
      remedyNotes.push("Skip the wide brim hat in breezy conditions.");
      windStatus = "Hat Blowaway Alert";
    }

    if (curOuter.windproof) {
      score += 5;
      windStatus = "Wind Deflected";
    } else if (totalWarmth < 6 && tempF < 60) {
      score -= 10;
      critiqueNotes.push(
        "Wind chill is going to cut right through your unshielded layers."
      );
      windStatus = "Chilled by Wind";
    }
  }

  // Heat & Sun bonus
  if (tempF >= 78 && !isRain) {
    if (curAccessory.id === "acetate_shades" || curAccessory.id === "straw_hat") {
      score += 5;
    }
    if (curOuter.id === "down_parka" || curOuter.id === "wool_overcoat") {
      score -= 30;
      critiqueNotes.push(
        "Wearing heavy winter wool or down in the heat is a thermal catastrophe."
      );
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine Grade and status
  let grade: GameCritique["grade"] = "A+";
  let statusTitle = "Masterclass Look";
  let statusPill = "Thermally Equilibrated";
  let pillVariant: GameCritique["pillVariant"] = "perfect";

  if (score >= 90) {
    grade = "A+";
    statusTitle = "Masterclass Styling";
    statusPill = "Impeccably Calibrated";
    pillVariant = "perfect";
  } else if (score >= 75) {
    grade = "A";
    statusTitle = "Weather Ready";
    statusPill = "Solid Climate Defense";
    pillVariant = "good";
  } else if (score >= 60) {
    grade = "B";
    statusTitle = "Passable Outfit";
    statusPill = "Minor Vulnerability";
    pillVariant = "warning";
  } else if (score >= 40) {
    grade = "C";
    statusTitle = "Questionable Choices";
    statusPill = "Noticeable Discomfort";
    pillVariant = "warning";
  } else if (score >= 20) {
    grade = "D";
    statusTitle = "High Climate Risk";
    statusPill = "Severe Mismatch";
    pillVariant = "danger";
  } else {
    grade = "F";
    statusTitle = "Atmospheric Disaster";
    statusPill = "Emergency Hazard";
    pillVariant = "danger";
  }

  // Compose narrative
  let narrative = critiqueNotes.slice(0, 2).join(" ");
  if (remedyNotes.length > 0) {
    narrative += ` ${remedyNotes[0]}`;
  } else if (score >= 85) {
    narrative += " Your layers harmonize seamlessly with current atmospheric metrics.";
  }

  return {
    score,
    grade,
    statusTitle,
    statusPill,
    pillVariant,
    narrative,
    thermalStatus,
    moistureStatus,
    windStatus,
    totalWarmth,
    targetWarmth,
  };
}

function getDollReaction(critique: GameCritique, weather: WeatherPayload): string {
  const tempF =
    weather.units === "imperial"
      ? weather.temp
      : Math.round((weather.temp * 9) / 5 + 32);
  const cond = (weather.condition || "").toLowerCase();
  const isRain =
    cond.includes("rain") ||
    cond.includes("drizzle") ||
    cond.includes("shower") ||
    cond.includes("thunder");
  const isSnow =
    cond.includes("snow") ||
    cond.includes("sleet") ||
    cond.includes("blizzard");

  if (critique.score >= 88) {
    if (isRain) return "Shielded & dry! Ready for wet weather. ☔✨";
    if (isSnow) return "Snug & insulated! Winter cold won't bother me. ❄️✨";
    if (tempF > 76) return "Airy and cool! Perfect for warm sunshine. ☀️✨";
    return "Feeling great! This outfit harmonizes with today's weather. ✨";
  }

  if (critique.thermalStatus === "Severely Underdressed") {
    if (isSnow) return `Brrr! Shivering in ${tempF}° snow! I desperately need a heavy coat and boots! 🥶`;
    return `Brrr! Freezing in ${tempF}°! Please put on warmer layers or a jacket! 🥶`;
  }

  if (critique.thermalStatus === "Overheated" || critique.thermalStatus === "Sweltering Excess") {
    return `Whew, it's ${tempF}°! I'm way too hot in all these heavy layers! 🥵`;
  }

  if (isRain && critique.moistureStatus.includes("Damp")) {
    return "Watch out, it's raining! I'll get soaked without an umbrella or rain shell! 🌧️";
  }

  if (weather.windSpeed >= 16 && critique.windStatus.includes("Wind Exposed")) {
    return `Gusty winds (${weather.windSpeed} ${weather.units === "imperial" ? "mph" : "m/s"})! A windbreaker or jacket would help! 💨`;
  }

  if (critique.thermalStatus === "Slightly Chilly") {
    return `A little chilly for ${tempF}°. Adding an extra layer will make it just right. 🧥`;
  }

  return "Almost there! Adjust a piece or two to suit today's atmospheric reading.";
}

export default function WeatherPrototype() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [searchInput, setSearchInput] = useState<string>("");
  const [isLocalArea, setIsLocalArea] = useState<boolean>(false);
  const [activeQuery, setActiveQuery] = useState<{
    type: "coords" | "city";
    lat?: number;
    lon?: number;
    city?: string;
  }>({ type: "city", city: "New York" });
  const [selectedPiece, setSelectedPiece] = useState<OutfitPiece | null>(null);
  const [userOutfit, setUserOutfit] = useState<UserDressingOutfit>(DEFAULT_USER_OUTFIT);
  const [activeStudioTab, setActiveStudioTab] = useState<
    "outerwear" | "top" | "bottom" | "shoes" | "accessory"
  >("top");
  const [artworkIndex, setArtworkIndex] = useState<number>(0);
  const [artworkZoomed, setArtworkZoomed] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPiece(null);
        setArtworkZoomed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset artwork cycle when weather condition changes
  const prevConditionRef = useRef<string>("");
  useEffect(() => {
    if (weather?.condition && weather.condition !== prevConditionRef.current) {
      prevConditionRef.current = weather.condition;
      setArtworkIndex(0);
    }
  }, [weather?.condition]);

  // Keep a ref to activeQuery to prevent stale closures
  const activeQueryRef = useRef(activeQuery);
  activeQueryRef.current = activeQuery;
  const unitRef = useRef(unit);
  unitRef.current = unit;

  // Direct client-side fetch fallback to handle environments where server is sandbox-isolated
  const fetchDirectFromOpenWeather = useCallback(
    async (
      query: { type: "coords" | "city"; lat?: number; lon?: number; city?: string },
      unitSystem: "imperial" | "metric"
    ): Promise<WeatherPayload> => {
      const q =
        query.type === "coords" && query.lat != null && query.lon != null
          ? `lat=${query.lat}&lon=${query.lon}`
          : formatOpenWeatherLocationQuery(query.city || "New York");

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?${q}&units=${unitSystem}&appid=${DEFAULT_API_KEY}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${q}&units=${unitSystem}&appid=${DEFAULT_API_KEY}`;

      const [curRes, fcRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl),
      ]);

      if (!curRes.ok) {
        const errJson = await curRes.json().catch(() => ({}));
        let message = errJson.message || `Weather fetch failed (${curRes.status})`;
        if (errJson.message === "city not found") {
          message = "Location not found. Please verify the city name or zip code.";
        }
        throw new Error(message);
      }

      const cur = await curRes.json();
      let fc = fcRes.ok ? await fcRes.json() : null;

      // Fallback: If forecast query with zip had issues, fetch forecast by coordinates
      if (!fc && cur.coord?.lat && cur.coord?.lon) {
        try {
          const coordFcRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${cur.coord.lat}&lon=${cur.coord.lon}&units=${unitSystem}&appid=${DEFAULT_API_KEY}`
          );
          if (coordFcRes.ok) {
            fc = await coordFcRes.json();
          }
        } catch {
          // ignore fallback error
        }
      }

      const cond = cur.weather?.[0] || { id: 800, main: "Clear", description: "Clear sky", icon: "01d" };
      const emoji = getWeatherEmoji(cond.id, cond.icon);

      // Hourly (all slots across the multi-day forecast timeline)
      const todayDateStr = new Date().toDateString();
      const hourly =
        fc?.list?.map((item: any) => {
          const date = new Date(item.dt * 1000);
          const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
          const dayStr =
            date.toDateString() === todayDateStr
              ? "Today"
              : date.toLocaleDateString("en-US", { weekday: "short" });
          const c = item.weather?.[0] || {};
          return {
            time: timeStr,
            day: dayStr,
            temp: Math.round(item.main.temp),
            emoji: getWeatherEmoji(c.id, c.icon),
            condition: c.main || "Clear",
            pop: Math.round((item.pop || 0) * 100),
          };
        }) || [];

      // 5-day daily
      const dailyMap = new Map<string, any>();
      if (fc?.list) {
        for (const item of fc.list) {
          const date = new Date(item.dt * 1000);
          const dayKey = date.toISOString().split("T")[0];
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
          const temp = item.main.temp;
          const c = item.weather?.[0] || {};

          if (!dailyMap.has(dayKey)) {
            dailyMap.set(dayKey, {
              day: dayName,
              high: temp,
              low: temp,
              condition: c.description || c.main || "Clear",
              emoji: getWeatherEmoji(c.id, c.icon),
            });
          } else {
            const row = dailyMap.get(dayKey);
            if (temp > row.high) row.high = temp;
            if (temp < row.low) row.low = temp;
          }
        }
      }

      const forecast = Array.from(dailyMap.values())
        .slice(0, 5)
        .map((row, idx) => ({
          day: idx === 0 ? "Today" : row.day,
          condition: row.condition.charAt(0).toUpperCase() + row.condition.slice(1),
          emoji: row.emoji,
          high: Math.round(row.high),
          low: Math.round(row.low),
        }));

      return {
        city: cur.name || "Unknown Area",
        country: cur.sys?.country || "",
        coord: cur.coord,
        condition: cond.description?.charAt(0).toUpperCase() + cond.description?.slice(1),
        emoji,
        temp: Math.round(cur.main.temp),
        feelsLike: Math.round(cur.main.feels_like),
        high: Math.round(cur.main.temp_max),
        low: Math.round(cur.main.temp_min),
        humidity: cur.main.humidity,
        pressureInHg: +(cur.main.pressure * 0.02953).toFixed(2),
        pressureHpa: cur.main.pressure,
        windSpeed: Math.round(cur.wind.speed),
        windDirection: degToCompass(cur.wind.deg || 0),
        clouds: cur.clouds?.all ?? 0,
        visibilityMiles: cur.visibility ? +(cur.visibility * 0.000621371).toFixed(1) : 10,
        sunrise: cur.sys?.sunrise
          ? new Date(cur.sys.sunrise * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "—",
        sunset: cur.sys?.sunset
          ? new Date(cur.sys.sunset * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "—",
        airQuality: "Good (1/5)",
        units: unitSystem,
        hourly,
        forecast,
        updatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }),
      };
    },
    []
  );

  // Master fetch function (server route -> client fallback)
  const loadWeather = useCallback(
    async (
      query: { type: "coords" | "city"; lat?: number; lon?: number; city?: string },
      unitSystem: "imperial" | "metric"
    ) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("units", unitSystem);

      if (query.type === "coords" && query.lat != null && query.lon != null) {
        params.set("lat", query.lat.toString());
        params.set("lon", query.lon.toString());
      } else {
        params.set("city", query.city || "New York");
      }

      try {
        // Attempt 1: Call Next.js server API route
        const res = await fetch(`/api/weather?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setWeather(json.data);
            setLoading(false);
            setStatusMessage(null);
            return;
          }
        }

        // Attempt 2: If server route failed or was sandboxed, call OpenWeatherMap directly
        const clientData = await fetchDirectFromOpenWeather(query, unitSystem);
        setWeather(clientData);
        setLoading(false);
        setStatusMessage(null);
      } catch (err: any) {
        console.error("Failed to fetch weather:", err);
        setError(err.message || "Could not retrieve weather data. Please try again.");
        setLoading(false);
        setStatusMessage(null);
      }
    },
    [fetchDirectFromOpenWeather]
  );

  // Initial load: Fetch New York immediately so page is never blank or stuck
  useEffect(() => {
    loadWeather({ type: "city", city: "New York" }, "imperial");
  }, [loadWeather]);

  // Explicit user action: Detect current location via browser GPS
  const detectLocation = useCallback(() => {
    if (detectingLocation) return;
    setDetectingLocation(true);
    setStatusMessage("Requesting location access from browser...");
    setError(null);

    if (!("geolocation" in navigator)) {
      setDetectingLocation(false);
      setStatusMessage(null);
      setError("Geolocation is not supported by your browser. Please search by city or zip code.");
      return;
    }

    let hasResolved = false;
    // 6-second watchdog timer in case browser hangs waiting for permission
    const watchdog = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        setDetectingLocation(false);
        setStatusMessage(null);
        setError("Location request timed out. Please check browser permission settings or search by city/zip.");
      }
    }, 6000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (hasResolved) return;
        hasResolved = true;
        clearTimeout(watchdog);
        setDetectingLocation(false);
        const lat = +pos.coords.latitude.toFixed(4);
        const lon = +pos.coords.longitude.toFixed(4);
        setIsLocalArea(true);
        const query = { type: "coords" as const, lat, lon };
        setActiveQuery(query);
        setStatusMessage(`Location detected (${lat}° N, ${lon}° W). Loading weather...`);
        loadWeather(query, unitRef.current);
      },
      (geoErr) => {
        if (hasResolved) return;
        hasResolved = true;
        clearTimeout(watchdog);
        setDetectingLocation(false);
        setStatusMessage(null);
        console.warn("Geolocation denied or error:", geoErr.message);
        setError("Location access denied or unavailable. Please use the search bar to enter your city or zip code.");
      },
      { timeout: 5000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  }, [detectingLocation, loadWeather]);

  // Handle City or Zip Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchInput.trim();
    if (!term) {
      setError("Please type a city name or ZIP code to search.");
      return;
    }
    setIsLocalArea(false);
    const newQuery = { type: "city" as const, city: term };
    setActiveQuery(newQuery);
    setStatusMessage(`Looking up weather for "${term}"...`);
    loadWeather(newQuery, unit);
    setSearchInput("");
  };

  // Switch City from preset chips
  const handleSelectPreset = (city: string) => {
    setIsLocalArea(false);
    const newQuery = { type: "city" as const, city };
    setActiveQuery(newQuery);
    setStatusMessage(`Loading weather for ${city}...`);
    loadWeather(newQuery, unit);
  };

  // Toggle Units (°F / °C)
  const toggleUnit = (newUnit: "imperial" | "metric") => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    loadWeather(activeQuery, newUnit);
  };

  const tempSymbol = unit === "imperial" ? "°F" : "°C";
  const speedSymbol = unit === "imperial" ? "mph" : "m/s";

  // Derive atmospheric Met artwork matching live weather conditions
  const artCategory = weather
    ? resolveWeatherArtCategory(weather.condition, unit === "metric" ? (weather.temp * 9) / 5 + 32 : weather.temp)
    : "clouds";
  const artCategoryWorks = MET_WEATHER_MASTERWORKS[artCategory] || MET_WEATHER_MASTERWORKS.clouds;
  const currentArtwork: MetArtworkData = artCategoryWorks[artworkIndex % artCategoryWorks.length];

  const handleCycleArtwork = () => {
    setArtworkIndex((prev) => (prev + 1) % artCategoryWorks.length);
  };

  return (
    <div className={styles.container}>
      {/* Floating Bottom Course & Prototype Tag */}
      <div className={styles.footerContainer}>
        <span className={styles.footerText}>© 2026 Yiping Dong</span>
        <span className={styles.footerTag}>05 / Prototype</span>
      </div>

      {/* Central Framed Paper Sheet */}
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          {/* Top Navigation Bar */}
          <nav className={styles.topNav} aria-label="Breadcrumb Navigation">
            <Link href="/" className={styles.backButton}>
              <span>←</span>
              <span>Prototypes</span>
            </Link>

            <div className={styles.topNavRight}>
              <span className={styles.apiKeyBadge}>
                <span className={styles.apiKeyDot} />
                OpenWeatherMap Live
              </span>
              <span className={styles.categoryBadge}>05 / Prototype</span>
            </div>
          </nav>

          {/* Heading */}
          <h1 className={styles.heading1}>Weather Station</h1>

          {/* Location Controls & Search Bar */}
          <section className={styles.locationControls} aria-label="Location Controls">
            <div className={styles.searchRow}>
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                className={isLocalArea ? `${styles.locateButton} ${styles.locateButtonActive}` : styles.locateButton}
                title="Detect your current area via browser GPS"
              >
                <span>📍</span>
                <span>{detectingLocation ? "Detecting..." : "Detect My Area"}</span>
              </button>

              <form onSubmit={handleSearch} className={styles.searchRow} style={{ flex: 1, margin: 0 }}>
                <input
                  type="text"
                  placeholder="Search city or zip code (e.g. 11218, 10001, London)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={styles.searchInput}
                  aria-label="City or Zip code search"
                />
                <button type="submit" className={styles.searchButton}>
                  Search
                </button>
              </form>
            </div>

            <div className={styles.chipsRow}>
              <div className={styles.cityChips} role="group" aria-label="Quick Cities">
                {PRESET_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelectPreset(city)}
                    className={
                      !isLocalArea && activeQuery.city?.toLowerCase() === city.toLowerCase()
                        ? styles.chipButtonActive
                        : styles.chipButton
                    }
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Unit Toggle */}
              <div className={styles.unitToggle} aria-label="Temperature Unit Switcher">
                <button
                  type="button"
                  onClick={() => toggleUnit("imperial")}
                  className={unit === "imperial" ? styles.unitButtonActive : styles.unitButton}
                >
                  °F
                </button>
                <button
                  type="button"
                  onClick={() => toggleUnit("metric")}
                  className={unit === "metric" ? styles.unitButtonActive : styles.unitButton}
                >
                  °C
                </button>
              </div>
            </div>
          </section>

          {/* Status Message / Notification */}
          {statusMessage && (
            <div className={styles.statusMessage} role="status">
              <span>📡</span>
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className={styles.alertBox} role="alert">
              <span>⚠️ {error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className={styles.alertDismiss}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}



          {/* Live Weather Card */}
          {weather && (
            <section className={styles.currentWeatherCard} aria-label="Current Weather Conditions">
              <div className={styles.cardHeaderRow}>
                <div className={styles.locationTitleGroup}>
                  <h2 className={styles.cityName}>
                    {weather.city}
                    {weather.country && `, ${weather.country}`}
                    {isLocalArea && <span className={styles.localBadge}>Your Area</span>}
                  </h2>
                  <span className={styles.cityRegion}>
                    {weather.coord
                      ? `Coordinates: ${weather.coord.lat.toFixed(2)}° lat, ${weather.coord.lon.toFixed(2)}° lon`
                      : "OpenWeatherMap Observations"}
                  </span>
                </div>

                <div className={styles.headerMetaActions}>
                  <div className={styles.conditionBadge}>
                    <span className={styles.conditionEmoji}>{weather.emoji}</span>
                    <span>{weather.condition}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span className={styles.updatedTime}>{weather.updatedAt}</span>
                    <button
                      type="button"
                      onClick={() => loadWeather(activeQuery, unit)}
                      className={styles.refreshButton}
                      title="Refresh weather data"
                    >
                      ↺
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.tempDisplayRow}>
                <span className={styles.tempValue}>
                  {weather.temp}
                  {tempSymbol}
                </span>
                <div className={styles.tempMeta}>
                  <span className={styles.conditionText}>
                    Feels like {weather.feelsLike}
                    {tempSymbol}
                  </span>
                  <span className={styles.highLowText}>
                    High: {weather.high}
                    {tempSymbol} · Low: {weather.low}
                    {tempSymbol}
                  </span>
                </div>
              </div>

              {/* Atmospheric Metrics Grid */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricBox}>
                  <div className={styles.metricLabel}>Humidity</div>
                  <div className={styles.metricValue}>{weather.humidity}%</div>
                </div>
                <div className={styles.metricBox}>
                  <div className={styles.metricLabel}>Wind</div>
                  <div className={styles.metricValue}>
                    {weather.windSpeed} {speedSymbol} {weather.windDirection}
                  </div>
                </div>
                <div className={styles.metricBox}>
                  <div className={styles.metricLabel}>Visibility</div>
                  <div className={styles.metricValue}>{weather.visibilityMiles} mi</div>
                </div>
                <div className={styles.metricBox}>
                  <div className={styles.metricLabel}>Barometer</div>
                  <div className={styles.metricValue}>{weather.pressureInHg} inHg</div>
                </div>
                <div className={styles.metricBox}>
                  <div className={styles.metricLabel}>Cloud Cover</div>
                  <div className={styles.metricValue}>{weather.clouds}%</div>
                </div>
                <div className={styles.metricBox}>
                  <div className={styles.metricLabel}>Air Quality</div>
                  <div className={styles.metricValue}>{weather.airQuality}</div>
                </div>
                <div className={styles.metricBox}>
                  <div className={styles.metricLabel}>Sunrise</div>
                  <div className={styles.metricValue}>{weather.sunrise}</div>
                </div>
                <div className={styles.metricBox}>
                  <div className={styles.metricLabel}>Sunset</div>
                  <div className={styles.metricValue}>{weather.sunset}</div>
                </div>
              </div>
            </section>
          )}

          {/* Hourly Forecast Ribbon */}
          {weather?.hourly && weather.hourly.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionBadge}>Ribbon</span>
                <h2 className={styles.sectionTitle}>Hourly Forecast</h2>
                <div className={styles.sectionRule} />
              </div>

              <InfiniteHourlyRibbon hourly={weather.hourly} tempSymbol={tempSymbol} />
            </>
          )}

          {/* 5-Day Forecast Outlook */}
          {weather?.forecast && weather.forecast.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionBadge}>Outlook</span>
                <h2 className={styles.sectionTitle}>5-Day Daily Outlook</h2>
                <div className={styles.sectionRule} />
              </div>

              <div className={styles.forecastList} aria-label="5-Day Forecast">
                {weather.forecast.map((dayItem, i) => (
                  <div key={i} className={styles.forecastRow}>
                    <span className={styles.forecastDay}>{dayItem.day}</span>
                    <div className={styles.forecastCondition}>
                      <span className={styles.forecastEmoji}>{dayItem.emoji}</span>
                      <span>{dayItem.condition}</span>
                    </div>
                    <div className={styles.forecastTempRange}>
                      <span className={styles.forecastHigh}>
                        {dayItem.high}
                        {tempSymbol}
                      </span>
                      <span className={styles.forecastLow}>
                        {dayItem.low}
                        {tempSymbol}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ===============================================================
              Two-Column Fashion Suite: Styling Suggestions + Paper-Doll Studio
              =============================================================== */}
          {weather && (
            <section className={styles.fashionDuoRow} aria-label="Weather Wardrobe & Climate Dressing Studio">
              {/* Left Column: Curated Styling Suggestions */}
              <div className={styles.fashionDuoCol}>
                <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
                  <span className={styles.sectionBadge}>Lookbook</span>
                  <h2 className={styles.sectionTitle}>Styling Suggestions</h2>
                  <div className={styles.sectionRule} />
                </div>

                {(() => {
                  const styling = getStylingSuggestion(weather);
                  return (
                    <div className={styles.stylingCard} aria-label="Weather Styling Suggestions">
                      <div className={styles.stylingHeader}>
                        <div className={styles.stylingTitleGroup}>
                          <span className={styles.stylingVibeBadge}>{styling.vibe}</span>
                          <h3 className={styles.stylingTitle}>Curated Weather Wardrobe</h3>
                          <p className={styles.stylingSummary}>{styling.summary}</p>
                        </div>
                      </div>

                      <div className={styles.outfitGrid}>
                        {styling.pieces.map((piece, index) => {
                          const popupPosClass =
                            index % 2 === 0
                              ? styles.outfitPopupLeft
                              : styles.outfitPopupRight;
                          const arrowPosClass =
                            index % 2 === 0
                              ? styles.popupArrowLeft
                              : styles.popupArrowRight;

                          return (
                            <div
                              key={piece.category}
                              className={styles.outfitItem}
                              tabIndex={0}
                              role="button"
                              aria-haspopup="dialog"
                              aria-label={`${piece.category}: ${piece.label}. Click to inspect reference look.`}
                              onClick={() => setSelectedPiece(piece)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedPiece(piece);
                                }
                              }}
                            >
                              <div className={styles.outfitHeaderRow}>
                                <span className={styles.outfitCategory}>{piece.category}</span>
                                <span className={styles.outfitIndex}>{`0${index + 1}`}</span>
                              </div>

                              <div className={styles.outfitLabel}>{piece.label}</div>

                              <div className={styles.outfitActionPrompt}>
                                <span className={styles.outfitActionDot} />
                                <span>Preview Look ↗</span>
                              </div>

                              {/* Hover Popover with Image */}
                              <div
                                className={`${styles.outfitPopup} ${popupPosClass}`}
                                role="tooltip"
                              >
                                <div className={styles.popupImageContainer}>
                                  <img
                                    src={piece.image}
                                    alt={piece.imageAlt}
                                    className={styles.popupImage}
                                    loading="lazy"
                                  />
                                  <span className={styles.popupImageBadge}>Lookbook Ref</span>
                                </div>

                                <div className={styles.popupBody}>
                                  <span className={styles.popupCategory}>{piece.category}</span>
                                  <h4 className={styles.popupTitle}>{piece.label}</h4>
                                  <p className={styles.popupTip}>{piece.styleTip}</p>

                                  <div className={styles.popupSpecs}>
                                    <span className={styles.popupSpecsLabel}>Fabric &amp; Cut</span>
                                    <span className={styles.popupSpecsText}>{piece.details}</span>
                                  </div>

                                  <div className={styles.popupClickHint}>Click box for expanded lookbook</div>
                                </div>

                                <div className={`${styles.popupArrow} ${arrowPosClass}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {styling.advisory && (
                        <div className={styles.advisoryBanner}>
                          <span className={styles.advisoryTag}>Advisory</span>
                          <span className={styles.advisoryText}>{styling.advisory}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Minimalist Paper-Doll Dressing Studio */}
              <div className={styles.fashionDuoCol}>
                <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
                  <span className={styles.sectionBadge}>Interactive</span>
                  <h2 className={styles.sectionTitle}>Dressing Studio</h2>
                  <div className={styles.sectionRule} />
                </div>

                {(() => {
                  const critique = evaluateUserOutfit(userOutfit, weather);
                  const dollReaction = getDollReaction(critique, weather);

                  const statusPillClass =
                    critique.pillVariant === "perfect"
                      ? styles.dollScorePillPerfect
                      : critique.pillVariant === "good"
                      ? styles.dollScorePillGood
                      : critique.pillVariant === "warning"
                      ? styles.dollScorePillWarning
                      : styles.dollScorePillDanger;

                  const handleRandomize = () => {
                    const pickRandom = (arr: GameWardrobeItem[]) =>
                      arr[Math.floor(Math.random() * arr.length)].id;
                    setUserOutfit({
                      outerwear: pickRandom(WARDROBE_OPTIONS.outerwear),
                      top: pickRandom(WARDROBE_OPTIONS.top),
                      bottom: pickRandom(WARDROBE_OPTIONS.bottom),
                      shoes: pickRandom(WARDROBE_OPTIONS.shoes),
                      accessory: pickRandom(WARDROBE_OPTIONS.accessory),
                    });
                  };

                  const handleAutoMatch = () => {
                    const tempF =
                      weather.units === "imperial"
                        ? weather.temp
                        : Math.round((weather.temp * 9) / 5 + 32);
                    const cond = (weather.condition || "").toLowerCase();
                    const isRain =
                      cond.includes("rain") ||
                      cond.includes("drizzle") ||
                      cond.includes("shower") ||
                      cond.includes("thunder");
                    const isSnow =
                      cond.includes("snow") ||
                      cond.includes("sleet") ||
                      cond.includes("flurr");

                    if (isSnow) {
                      setUserOutfit({
                        outerwear: "down_parka",
                        top: "cable_knit",
                        bottom: "thermal_pants",
                        shoes: "arctic_snow_boots",
                        accessory: "cashmere_scarf_beanie",
                      });
                    } else if (isRain) {
                      setUserOutfit({
                        outerwear: "trench_shell",
                        top: "heavy_tee",
                        bottom: "selvedge_denim",
                        shoes: "chelsea_boots",
                        accessory: "windproof_umbrella",
                      });
                    } else if (tempF < 42) {
                      setUserOutfit({
                        outerwear: "wool_overcoat",
                        top: "merino_knit",
                        bottom: "corduroy_pants",
                        shoes: "goodyear_boots",
                        accessory: "cashmere_scarf_beanie",
                      });
                    } else if (tempF < 58) {
                      setUserOutfit({
                        outerwear: "chore_coat",
                        top: "oxford_shirt",
                        bottom: "selvedge_denim",
                        shoes: "canvas_sneakers",
                        accessory: "canvas_tote",
                      });
                    } else if (tempF < 72) {
                      setUserOutfit({
                        outerwear: "denim_jacket",
                        top: "heavy_tee",
                        bottom: "linen_trousers",
                        shoes: "leather_mules",
                        accessory: "acetate_shades",
                      });
                    } else if (tempF < 82) {
                      setUserOutfit({
                        outerwear: "linen_overshirt",
                        top: "camp_shirt",
                        bottom: "chino_shorts",
                        shoes: "leather_mules",
                        accessory: "acetate_shades",
                      });
                    } else {
                      setUserOutfit({
                        outerwear: "none",
                        top: "ribbed_tank",
                        bottom: "linen_shorts",
                        shoes: "flip_flops",
                        accessory: "straw_hat",
                      });
                    }
                  };

                  const handleReset = () => {
                    setUserOutfit(DEFAULT_USER_OUTFIT);
                  };

                  const categories: {
                    id: "outerwear" | "top" | "bottom" | "shoes" | "accessory";
                    label: string;
                    icon: string;
                  }[] = [
                    { id: "outerwear", label: "Outer", icon: "🧥" },
                    { id: "top", label: "Top", icon: "👕" },
                    { id: "bottom", label: "Bottom", icon: "👖" },
                    { id: "shoes", label: "Shoes", icon: "👟" },
                    { id: "accessory", label: "Gear", icon: "🧣" },
                  ];

                  const activeItems = WARDROBE_OPTIONS[activeStudioTab];

                  return (
                    <div className={styles.paperDollCard} aria-label="Paper-Doll Climate Dressing Studio">
                      {/* Mannequin Stage & Live Weather Critique */}
                      <div className={styles.dollStage}>
                        {/* Dynamic Speech Bubble */}
                        <div className={styles.dollSpeechBubble} role="status">
                          <span>{dollReaction}</span>
                          <div className={styles.dollSpeechArrow} />
                        </div>

                        {/* Minimalist Vector Mannequin Figure */}
                        <div className={styles.dollFigureWrapper}>
                          <MannequinDoll
                            outerwear={userOutfit.outerwear}
                            top={userOutfit.top}
                            bottom={userOutfit.bottom}
                            shoes={userOutfit.shoes}
                            accessory={userOutfit.accessory}
                          />
                        </div>

                        {/* Live Score & Warmth Ledger */}
                        <div className={styles.dollReadinessRow}>
                          <span className={`${styles.dollScorePill} ${statusPillClass}`}>
                            {critique.statusPill} · {critique.score}/100
                          </span>
                          <span className={styles.dollWarmthMetric}>
                            Warmth {critique.totalWarmth}/{critique.targetWarmth} ({weather.temp}{tempSymbol})
                          </span>
                        </div>
                      </div>

                      {/* Category Switcher Tabs */}
                      <div className={styles.dollCategoryTabs} role="tablist" aria-label="Wardrobe Categories">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            role="tab"
                            aria-selected={activeStudioTab === cat.id}
                            className={
                              activeStudioTab === cat.id
                                ? `${styles.dollCategoryTab} ${styles.dollCategoryTabActive}`
                                : styles.dollCategoryTab
                            }
                            onClick={() => setActiveStudioTab(cat.id)}
                          >
                            <span>{cat.icon}</span> <span>{cat.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Visual Item Inventory Tray */}
                      <div className={styles.dollItemsGrid} role="tabpanel" aria-label={`${activeStudioTab} selection`}>
                        {activeItems.map((item) => {
                          const isEquipped = userOutfit[activeStudioTab] === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={
                                isEquipped
                                  ? `${styles.dollItemCard} ${styles.dollItemCardActive}`
                                  : styles.dollItemCard
                              }
                              onClick={() =>
                                setUserOutfit((prev) => ({
                                  ...prev,
                                  [activeStudioTab]: item.id,
                                }))
                              }
                              title={item.description}
                            >
                              <span className={styles.dollItemCardName}>{item.name}</span>
                              <div className={styles.dollItemCardFooter}>
                                <span className={styles.dollItemCardWarmth}>
                                  {item.warmth > 0 ? `+${item.warmth}` : "0"} warm
                                </span>
                                {isEquipped && (
                                  <span className={styles.dollItemCardEquipped}>Worn ✓</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Action Toolbar */}
                      <div className={styles.dollActionToolbar}>
                        <button
                          type="button"
                          className={`${styles.dollActionBtn} ${styles.dollActionBtnAccent}`}
                          onClick={handleRandomize}
                        >
                          🎲 Random Look
                        </button>
                        <button
                          type="button"
                          className={styles.dollActionBtn}
                          onClick={handleAutoMatch}
                        >
                          ✨ Auto-Match
                        </button>
                        <button
                          type="button"
                          className={styles.dollActionBtn}
                          onClick={handleReset}
                        >
                          ↺ Reset
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>
          )}

          {/* ===============================================================
              Art of the Weather Section (End of Page)
              =============================================================== */}
          {weather && currentArtwork && (
            <section
              className={styles.metArtSection}
              aria-label="Art of the Weather"
            >
              <div className={styles.metArtCard}>
                <header className={styles.metArtHeader}>
                  <h2 className={styles.metArtHeaderTitle}>
                    Art of the Weather
                  </h2>
                </header>

                <div className={styles.metArtBodyGrid}>
                  {/* Left Column: Visual Artwork Frame with Museum Matting */}
                  <div className={styles.metArtVisualPane}>
                    <div
                      className={styles.metArtFrame}
                      onClick={() => setArtworkZoomed(true)}
                      title="Click to view full painting in high resolution"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setArtworkZoomed(true);
                        }
                      }}
                    >
                      <img
                        key={currentArtwork.objectID}
                        src={currentArtwork.primaryImageSmall || currentArtwork.primaryImage}
                        alt={`${currentArtwork.title} by ${currentArtwork.artistDisplayName}`}
                        className={styles.metArtImage}
                        loading="eager"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (currentArtwork.remoteImage && target.src !== currentArtwork.remoteImage) {
                            target.src = currentArtwork.remoteImage;
                          }
                        }}
                      />
                      <span className={styles.metArtZoomBadge}>
                        🔍 View Large
                      </span>
                    </div>
                    <div className={styles.metArtWeatherTag}>
                      <span>{currentArtwork.weatherMood}</span>
                    </div>
                  </div>

                  {/* Right Column: Museum Label & Curatorial Connection */}
                  <div className={styles.metArtInfoPane}>
                    <div>
                      <div className={styles.metArtMatchPill}>
                        <span>Reflecting: {weather.condition} in {weather.city}</span>
                      </div>

                      <div className={styles.metArtTitleGroup} style={{ marginTop: "0.6rem" }}>
                        <h3 className={styles.metArtTitle}>
                          {currentArtwork.title}
                        </h3>
                        <p className={styles.metArtArtist}>
                          {currentArtwork.artistDisplayName}
                        </p>
                        {currentArtwork.artistDisplayBio && (
                          <p className={styles.metArtArtistBio}>
                            {currentArtwork.artistDisplayBio}
                          </p>
                        )}
                      </div>

                      {/* Archival metadata ledger */}
                      <div className={styles.metArtMetadataList}>
                        <div className={styles.metArtMetaItem}>
                          <span className={styles.metArtMetaLabel}>Date:</span>
                          <span className={styles.metArtMetaValue}>{currentArtwork.objectDate}</span>
                        </div>
                        <div className={styles.metArtMetaItem}>
                          <span className={styles.metArtMetaLabel}>Medium:</span>
                          <span className={styles.metArtMetaValue}>{currentArtwork.medium}</span>
                        </div>
                        {currentArtwork.dimensions && (
                          <div className={styles.metArtMetaItem}>
                            <span className={styles.metArtMetaLabel}>Dimensions:</span>
                            <span className={styles.metArtMetaValue}>{currentArtwork.dimensions}</span>
                          </div>
                        )}
                        <div className={styles.metArtMetaItem}>
                          <span className={styles.metArtMetaLabel}>Department:</span>
                          <span className={styles.metArtMetaValue}>{currentArtwork.department}</span>
                        </div>
                        {currentArtwork.creditLine && (
                          <div className={styles.metArtMetaItem}>
                            <span className={styles.metArtMetaLabel}>Credit:</span>
                            <span className={styles.metArtMetaValue}>{currentArtwork.creditLine}</span>
                          </div>
                        )}
                      </div>

                      {/* Curatorial connection to today's atmosphere */}
                      <div className={styles.metArtCuratorialBox} style={{ marginTop: "0.75rem" }}>
                        <span className={styles.metArtCuratorialLead}>
                          Curatorial Atmospheric Note
                        </span>
                        <p className={styles.metArtCuratorialText}>
                          “{currentArtwork.curatorialNote}”
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.metArtActionsRow}>
                      <button
                        type="button"
                        onClick={handleCycleArtwork}
                        className={styles.metArtCycleBtn}
                        title="Discover another artwork paired with this weather condition"
                      >
                        <span>↺ Another Painting ({artworkIndex % artCategoryWorks.length + 1}/{artCategoryWorks.length})</span>
                      </button>

                      <a
                        href={currentArtwork.objectURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.metArtViewOnMetBtn}
                        title="View this artwork's accession page on metmuseum.org"
                      >
                        <span>The Met Collection ↗</span>
                      </a>

                      <a
                        href="https://metmuseum.github.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.metArtDocsBtn}
                        title="Learn more about The Met Open Access REST API"
                      >
                        <span>The Met API ↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Lightbox Modal for Art Inspection */}
          {artworkZoomed && currentArtwork && (
            <div
              className={styles.metArtLightboxOverlay}
              onClick={() => setArtworkZoomed(false)}
              role="dialog"
              aria-modal="true"
              aria-label={`Expanded view of ${currentArtwork.title}`}
            >
              <div
                className={styles.metArtLightboxCard}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setArtworkZoomed(false)}
                  className={styles.metArtLightboxClose}
                  aria-label="Close artwork view"
                >
                  ✕
                </button>
                <img
                  src={currentArtwork.primaryImage || currentArtwork.primaryImageSmall}
                  alt={`${currentArtwork.title} by ${currentArtwork.artistDisplayName}`}
                  className={styles.metArtLightboxImage}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (currentArtwork.remoteImage && target.src !== currentArtwork.remoteImage) {
                      target.src = currentArtwork.remoteImage;
                    }
                  }}
                />
                <div className={styles.metArtLightboxCaption}>
                  <div>
                    <h3 className={styles.metArtLightboxTitle}>
                      {currentArtwork.title} ({currentArtwork.objectDate})
                    </h3>
                    <p className={styles.metArtLightboxMeta}>
                      {currentArtwork.artistDisplayName} · {currentArtwork.medium} · {currentArtwork.department}
                    </p>
                  </div>
                  <a
                    href={currentArtwork.objectURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.metArtViewOnMetBtn}
                  >
                    View on MetMuseum.org ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Expanded Lookbook Modal on Click */}
          {selectedPiece && (
            <div
              className={styles.modalBackdrop}
              onClick={() => setSelectedPiece(null)}
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedPiece.category} Style Reference`}
            >
              <div
                className={styles.modalCard}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div className={styles.modalHeaderTitles}>
                    <span className={styles.modalCategoryBadge}>{selectedPiece.category}</span>
                    <h3 className={styles.modalTitle}>{selectedPiece.label}</h3>
                  </div>
                  <button
                    type="button"
                    className={styles.modalCloseButton}
                    onClick={() => setSelectedPiece(null)}
                    aria-label="Close style preview"
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.modalImageWrapper}>
                  <img
                    src={selectedPiece.image}
                    alt={selectedPiece.imageAlt}
                    className={styles.modalImage}
                  />
                  <span className={styles.modalImageCaption}>Curated Style Reference</span>
                </div>

                <div className={styles.modalContent}>
                  <div className={styles.modalSection}>
                    <span className={styles.modalSectionLabel}>Styling Guidance</span>
                    <p className={styles.modalTip}>{selectedPiece.styleTip}</p>
                  </div>

                  <div className={styles.modalSection}>
                    <span className={styles.modalSectionLabel}>Textile, Fit &amp; Silhouette</span>
                    <p className={styles.modalSpecs}>{selectedPiece.details}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && !weather && (
            <div className={styles.statusMessage} role="status">
              <span>⏳ Loading weather station...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}