"use client";

import React from "react";

type MannequinDollProps = {
  outerwear: string;
  top: string;
  bottom: string;
  shoes: string;
  accessory: string;
  className?: string;
};

export function MannequinDoll({
  outerwear,
  top,
  bottom,
  shoes,
  accessory,
  className,
}: MannequinDollProps) {
  return (
    <svg
      viewBox="0 0 200 360"
      className={className}
      style={{ width: "100%", height: "100%", maxHeight: "360px", display: "block" }}
      aria-label="Interactive Fashion Mannequin Paper Doll"
    >
      <defs>
        {/* Subtle ground shadow gradient */}
        <radialGradient id="dollShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A2628" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1A2628" stopOpacity="0" />
        </radialGradient>

        {/* Cable knit pattern */}
        <pattern id="cablePattern" width="6" height="8" patternUnits="userSpaceOnUse">
          <path d="M 1 0 Q 3 4 1 8 M 5 0 Q 3 4 5 8" fill="none" stroke="#D8CDBA" strokeWidth="0.75" />
        </pattern>

        {/* Corduroy stripe pattern */}
        <pattern id="corduroyPattern" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#5E381A" strokeWidth="0.8" />
        </pattern>
      </defs>

      {/* 1. Ground Pedestal / Shadow */}
      <ellipse cx="100" cy="342" rx="42" ry="7" fill="url(#dollShadow)" />
      <line x1="65" y1="342" x2="135" y2="342" stroke="#1A2628" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

      {/* ====================================================================
          2. Base Mannequin Figure (Head, Face, Hair Base, Torso, Limbs)
          ==================================================================== */}
      {/* Legs (Bare Skin Base) */}
      <g id="body-legs">
        {/* Left Leg */}
        <path
          d="M 88 185 L 86 280 L 84 322 L 91 324 L 94 280 L 96 185 Z"
          fill="#F7EDE2"
          stroke="#1A2628"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Right Leg */}
        <path
          d="M 104 185 L 106 280 L 109 324 L 116 322 L 114 280 L 112 185 Z"
          fill="#F7EDE2"
          stroke="#1A2628"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Knee hints */}
        <circle cx="90" cy="245" r="1.5" fill="#E6D3BF" />
        <circle cx="110" cy="245" r="1.5" fill="#E6D3BF" />
      </g>

      {/* Torso & Neck (Base Skin) */}
      <g id="body-torso">
        {/* Neck */}
        <rect x="95" y="68" width="10" height="15" fill="#F7EDE2" stroke="#1A2628" strokeWidth="1.5" />
        {/* Collarbones */}
        <line x1="91" y1="84" x2="98" y2="86" stroke="#1A2628" strokeWidth="1" opacity="0.3" />
        <line x1="102" y1="86" x2="109" y2="84" stroke="#1A2628" strokeWidth="1" opacity="0.3" />
        {/* Torso silhouette */}
        <path
          d="M 86 82 Q 100 84 114 82 L 112 140 Q 100 144 88 140 Z"
          fill="#F7EDE2"
          stroke="#1A2628"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Minimal Underwear Base (so mannequin is never bare) */}
        <path
          d="M 88 140 Q 100 143 112 140 L 114 175 Q 100 184 86 175 Z"
          fill="#FFFDF7"
          stroke="#1A2628"
          strokeWidth="1.25"
        />
      </g>

      {/* Arms & Hands */}
      <g id="body-arms">
        {/* Left Arm */}
        <path
          d="M 86 83 L 75 140 L 73 185 Q 73 192 78 190 L 80 140 L 89 88 Z"
          fill="#F7EDE2"
          stroke="#1A2628"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Right Arm */}
        <path
          d="M 114 83 L 125 140 L 127 185 Q 127 192 122 190 L 120 140 L 111 88 Z"
          fill="#F7EDE2"
          stroke="#1A2628"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Head, Face & Hair Base */}
      <g id="body-head">
        {/* Hair Back */}
        <path
          d="M 84 50 Q 100 32 116 50 Q 124 72 120 90 Q 100 95 80 90 Q 76 72 84 50 Z"
          fill="#2C3E40"
          stroke="#1A2628"
          strokeWidth="1.5"
        />
        {/* Head/Face Oval */}
        <ellipse cx="100" cy="56" rx="14" ry="17" fill="#F7EDE2" stroke="#1A2628" strokeWidth="1.5" />
        
        {/* Cute Minimalist Facial Features */}
        {/* Eyebrows */}
        <path d="M 91 50 Q 94 48 97 50" fill="none" stroke="#1A2628" strokeWidth="1" />
        <path d="M 103 50 Q 106 48 109 50" fill="none" stroke="#1A2628" strokeWidth="1" />
        {/* Eyes (chic manga/fashion dots with eyelashes) */}
        <circle cx="94" cy="55" r="1.8" fill="#1A2628" />
        <circle cx="106" cy="55" r="1.8" fill="#1A2628" />
        <line x1="93" y1="53" x2="96" y2="52" stroke="#1A2628" strokeWidth="1" />
        <line x1="107" y1="52" x2="104" y2="53" stroke="#1A2628" strokeWidth="1" />
        {/* Subtle blush */}
        <ellipse cx="91" cy="59" rx="2.5" ry="1.2" fill="#ED6A85" opacity="0.65" />
        <ellipse cx="109" cy="59" rx="2.5" ry="1.2" fill="#ED6A85" opacity="0.65" />
        {/* Sweet smile */}
        <path d="M 98 63 Q 100 65 102 63" fill="none" stroke="#ED6A85" strokeWidth="1" strokeLinecap="round" />

        {/* Front Hair Bangs */}
        <path
          d="M 86 48 Q 100 42 114 48 Q 112 55 106 54 Q 100 49 94 54 Q 88 55 86 48 Z"
          fill="#2C3E40"
          stroke="#1A2628"
          strokeWidth="1.5"
        />
      </g>

      {/* ====================================================================
          3. Bottom Garments Layer
          ==================================================================== */}
      <g id="garment-bottom">
        {bottom === "linen_shorts" && (
          // Breezy Linen Shorts (Cream/Sandy)
          <path
            d="M 86 142 L 114 142 L 116 195 L 102 195 L 100 162 L 98 195 L 84 195 Z"
            fill="#EADBCE"
            stroke="#1A2628"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}

        {bottom === "chino_shorts" && (
          // Tailored Chino Shorts (Navy Twill)
          <path
            d="M 86 142 L 114 142 L 117 200 L 103 200 L 100 165 L 97 200 L 83 200 Z"
            fill="#1E2E42"
            stroke="#1A2628"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}

        {bottom === "linen_trousers" && (
          // Pleated Linen Trousers (Wide-leg off-white)
          <g>
            <path
              d="M 85 142 L 115 142 L 119 308 L 104 308 L 100 180 L 96 308 L 81 308 Z"
              fill="#F4EFE6"
              stroke="#1A2628"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Pleat creases */}
            <line x1="91" y1="145" x2="89" y2="304" stroke="#1A2628" strokeWidth="0.8" opacity="0.35" />
            <line x1="109" y1="145" x2="111" y2="304" stroke="#1A2628" strokeWidth="0.8" opacity="0.35" />
          </g>
        )}

        {bottom === "selvedge_denim" && (
          // 14oz Raw Selvedge Denim (Deep Indigo with cuffs)
          <g>
            <path
              d="M 85 142 L 115 142 L 117 308 L 104 308 L 100 178 L 96 308 L 83 308 Z"
              fill="#24334A"
              stroke="#1A2628"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Rolled Selvedge Cuffs */}
            <rect x="83" y="299" width="13" height="9" fill="#D6DFE0" stroke="#1A2628" strokeWidth="1" />
            <rect x="104" y="299" width="13" height="9" fill="#D6DFE0" stroke="#1A2628" strokeWidth="1" />
            {/* Contrast copper stitch lines */}
            <path d="M 87 148 Q 100 151 113 148" fill="none" stroke="#C87A36" strokeWidth="0.9" strokeDasharray="2 1" />
          </g>
        )}

        {bottom === "corduroy_pants" && (
          // Wide-Wale Corduroy Pants (Rich Tobacco Brown)
          <g>
            <path
              d="M 85 142 L 115 142 L 117 310 L 103 310 L 100 178 L 97 310 L 83 310 Z"
              fill="#7A4B27"
              stroke="#1A2628"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Textured lines */}
            <path
              d="M 85 142 L 115 142 L 117 310 L 103 310 L 100 178 L 97 310 L 83 310 Z"
              fill="url(#corduroyPattern)"
              opacity="0.3"
            />
          </g>
        )}

        {bottom === "thermal_pants" && (
          // Fleece-Lined Wool Slacks (Charcoal Minimal)
          <path
            d="M 85 142 L 115 142 L 118 312 L 103 312 L 100 176 L 97 312 L 82 312 Z"
            fill="#2A2D33"
            stroke="#1A2628"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}
      </g>

      {/* ====================================================================
          4. Top Garments Layer
          ==================================================================== */}
      <g id="garment-top">
        {top === "ribbed_tank" && (
          // Ribbed Sleeveless Tank (Crisp White)
          <g>
            <path
              d="M 91 82 L 96 82 L 96 95 Q 100 97 104 95 L 104 82 L 109 82 L 113 144 L 87 144 Z"
              fill="#FFFFFF"
              stroke="#1A2628"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Rib texture lines */}
            <line x1="96" y1="102" x2="96" y2="140" stroke="#D3DBDC" strokeWidth="0.8" />
            <line x1="100" y1="102" x2="100" y2="140" stroke="#D3DBDC" strokeWidth="0.8" />
            <line x1="104" y1="102" x2="104" y2="140" stroke="#D3DBDC" strokeWidth="0.8" />
          </g>
        )}

        {top === "camp_shirt" && (
          // Linen Camp-Collar Shirt (Muted Sage with lapels)
          <g>
            {/* Body */}
            <path
              d="M 84 83 L 116 83 L 115 146 L 85 146 Z"
              fill="#6B8568"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            {/* Short Sleeves */}
            <path d="M 84 83 L 73 115 L 81 120 L 87 95 Z" fill="#6B8568" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 116 83 L 127 115 L 119 120 L 113 95 Z" fill="#6B8568" stroke="#1A2628" strokeWidth="1.5" />
            {/* Open Camp Lapels */}
            <polygon points="94,83 100,98 90,92" fill="#88A385" stroke="#1A2628" strokeWidth="1" />
            <polygon points="106,83 100,98 110,92" fill="#88A385" stroke="#1A2628" strokeWidth="1" />
          </g>
        )}

        {top === "heavy_tee" && (
          // Heavyweight Boxy Tee (Warm Ecru)
          <g>
            <path
              d="M 83 83 L 117 83 L 116 147 L 84 147 Z"
              fill="#ECE7DE"
              stroke="#1A2628"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Boxy Sleeves */}
            <path d="M 83 83 L 71 122 L 79 126 L 86 98 Z" fill="#ECE7DE" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 117 83 L 129 122 L 121 126 L 114 98 Z" fill="#ECE7DE" stroke="#1A2628" strokeWidth="1.5" />
            {/* Crewneck collar rib */}
            <path d="M 94 83 Q 100 87 106 83" fill="none" stroke="#1A2628" strokeWidth="1.5" />
          </g>
        )}

        {top === "oxford_shirt" && (
          // Oxford Button-Down (Classic Sky Blue)
          <g>
            {/* Body */}
            <path
              d="M 84 83 L 116 83 L 115 146 L 85 146 Z"
              fill="#B0D0E5"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            {/* Long Sleeves */}
            <path d="M 84 83 L 74 165 L 81 166 L 87 100 Z" fill="#B0D0E5" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 116 83 L 126 165 L 119 166 L 113 100 Z" fill="#B0D0E5" stroke="#1A2628" strokeWidth="1.5" />
            {/* Collar */}
            <polygon points="94,83 100,91 91,89" fill="#C8E2F2" stroke="#1A2628" strokeWidth="1" />
            <polygon points="106,83 100,91 109,89" fill="#C8E2F2" stroke="#1A2628" strokeWidth="1" />
            {/* Placket line & buttons */}
            <line x1="100" y1="91" x2="100" y2="146" stroke="#1A2628" strokeWidth="1" />
            <circle cx="100" cy="102" r="1.2" fill="#FFFFFF" />
            <circle cx="100" cy="116" r="1.2" fill="#FFFFFF" />
            <circle cx="100" cy="130" r="1.2" fill="#FFFFFF" />
          </g>
        )}

        {top === "merino_knit" && (
          // Merino Wool Roll-Neck (Sleek Charcoal Turtleneck)
          <g>
            {/* Turtleneck collar */}
            <rect x="94" y="66" width="12" height="18" rx="2" fill="#1C2128" stroke="#1A2628" strokeWidth="1.5" />
            {/* Torso */}
            <path
              d="M 84 82 L 116 82 L 115 148 L 85 148 Z"
              fill="#1C2128"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            {/* Fitted Long Sleeves */}
            <path d="M 84 82 L 73 170 L 79 171 L 87 100 Z" fill="#1C2128" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 116 82 L 127 170 L 121 171 L 113 100 Z" fill="#1C2128" stroke="#1A2628" strokeWidth="1.5" />
          </g>
        )}

        {top === "cable_knit" && (
          // Chunky Cable Knit Sweater (Cream Fisherman Knit)
          <g>
            {/* Chunky Crew Collar */}
            <path d="M 93 82 Q 100 88 107 82" fill="none" stroke="#1A2628" strokeWidth="2.5" />
            {/* Torso */}
            <path
              d="M 83 83 L 117 83 L 117 150 L 83 150 Z"
              fill="#EDE6D6"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            <rect x="83" y="83" width="34" height="67" fill="url(#cablePattern)" opacity="0.65" />
            {/* Chunky Sleeves */}
            <path d="M 83 83 L 71 170 L 79 172 L 87 105 Z" fill="#EDE6D6" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 117 83 L 129 170 L 121 172 L 113 105 Z" fill="#EDE6D6" stroke="#1A2628" strokeWidth="1.5" />
          </g>
        )}
      </g>

      {/* ====================================================================
          5. Outerwear Garments Layer
          ==================================================================== */}
      <g id="garment-outerwear">
        {outerwear === "linen_overshirt" && (
          // Light Linen Overshirt (Open Drape in Warm Olive)
          <g>
            <path d="M 80 82 L 92 82 L 90 155 L 78 152 Z" fill="#8CA086" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 120 82 L 108 82 L 110 155 L 122 152 Z" fill="#8CA086" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 80 82 L 70 148 L 78 150 L 86 98 Z" fill="#8CA086" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 120 82 L 130 148 L 122 150 L 114 98 Z" fill="#8CA086" stroke="#1A2628" strokeWidth="1.5" />
          </g>
        )}

        {outerwear === "denim_jacket" && (
          // Denim Trucker Jacket (Classic Deep Indigo with Brass Hardware)
          <g>
            {/* Jacket body */}
            <path
              d="M 81 82 L 119 82 L 118 145 L 82 145 Z"
              fill="#223E63"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            {/* Sleeves */}
            <path d="M 81 82 L 69 168 L 77 170 L 86 102 Z" fill="#223E63" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 119 82 L 131 168 L 123 170 L 114 102 Z" fill="#223E63" stroke="#1A2628" strokeWidth="1.5" />
            {/* Collar */}
            <polygon points="91,82 100,90 88,87" fill="#2E5282" stroke="#1A2628" strokeWidth="1" />
            <polygon points="109,82 100,90 112,87" fill="#2E5282" stroke="#1A2628" strokeWidth="1" />
            {/* Flap pockets & brass rivets */}
            <rect x="86" y="100" width="9" height="7" fill="#2E5282" stroke="#1A2628" strokeWidth="1" />
            <rect x="105" y="100" width="9" height="7" fill="#2E5282" stroke="#1A2628" strokeWidth="1" />
            <circle cx="90.5" cy="103.5" r="0.9" fill="#EDAC50" />
            <circle cx="109.5" cy="103.5" r="0.9" fill="#EDAC50" />
          </g>
        )}

        {outerwear === "chore_coat" && (
          // Canvas Chore Coat (French Workwear in Rich Ochre)
          <g>
            <path
              d="M 80 82 L 120 82 L 119 158 L 81 158 Z"
              fill="#C48439"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            {/* Sleeves */}
            <path d="M 80 82 L 68 170 L 76 172 L 85 102 Z" fill="#C48439" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 120 82 L 132 170 L 124 172 L 115 102 Z" fill="#C48439" stroke="#1A2628" strokeWidth="1.5" />
            {/* Collar */}
            <polygon points="91,82 100,91 88,88" fill="#DB994A" stroke="#1A2628" strokeWidth="1" />
            <polygon points="109,82 100,91 112,88" fill="#DB994A" stroke="#1A2628" strokeWidth="1" />
            {/* 3 Patch Pockets */}
            <rect x="85" y="100" width="8" height="8" fill="#B3752E" stroke="#1A2628" strokeWidth="1" />
            <rect x="84" y="128" width="10" height="12" fill="#B3752E" stroke="#1A2628" strokeWidth="1" />
            <rect x="106" y="128" width="10" height="12" fill="#B3752E" stroke="#1A2628" strokeWidth="1" />
          </g>
        )}

        {outerwear === "trench_shell" && (
          // Waterproof Trench Shell (Classic British Khaki)
          <g>
            <path
              d="M 80 82 L 120 82 L 122 225 L 78 225 Z"
              fill="#D4C4A3"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            {/* Sleeves */}
            <path d="M 80 82 L 68 172 L 77 174 L 86 102 Z" fill="#D4C4A3" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 120 82 L 132 172 L 123 174 L 114 102 Z" fill="#D4C4A3" stroke="#1A2628" strokeWidth="1.5" />
            {/* Storm flap & lapels */}
            <polygon points="90,82 100,96 86,91" fill="#E2D4B7" stroke="#1A2628" strokeWidth="1" />
            <polygon points="110,82 100,96 114,91" fill="#E2D4B7" stroke="#1A2628" strokeWidth="1" />
            {/* Trench Waist Belt */}
            <rect x="79" y="138" width="42" height="7" fill="#BEAD8B" stroke="#1A2628" strokeWidth="1.25" />
            <rect x="96" y="137" width="8" height="9" fill="#1A2628" />
          </g>
        )}

        {outerwear === "wool_overcoat" && (
          // Tailored Wool Overcoat (Long-Line Charcoal/Camel)
          <g>
            <path
              d="M 79 82 L 121 82 L 123 250 L 77 250 Z"
              fill="#34383F"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            {/* Structured Sleeves */}
            <path d="M 79 82 L 67 175 L 76 177 L 85 104 Z" fill="#34383F" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 121 82 L 133 175 L 124 177 L 115 104 Z" fill="#34383F" stroke="#1A2628" strokeWidth="1.5" />
            {/* Tailored Notch Lapel */}
            <polygon points="90,82 100,105 85,96" fill="#434952" stroke="#1A2628" strokeWidth="1" />
            <polygon points="110,82 100,105 115,96" fill="#434952" stroke="#1A2628" strokeWidth="1" />
          </g>
        )}

        {outerwear === "down_parka" && (
          // Arctic Down Parka (Quilted Teal Puffer with Fur Trim)
          <g>
            <path
              d="M 77 80 L 123 80 L 124 235 L 76 235 Z"
              fill="#0E5259"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            {/* Puffer Quilt Lines */}
            <line x1="77" y1="110" x2="123" y2="110" stroke="#1A2628" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="77" y1="140" x2="123" y2="140" stroke="#1A2628" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="77" y1="170" x2="123" y2="170" stroke="#1A2628" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="77" y1="200" x2="123" y2="200" stroke="#1A2628" strokeWidth="1.2" strokeDasharray="3 2" />
            {/* Puffed Sleeves */}
            <path d="M 77 80 L 64 175 L 75 177 L 85 105 Z" fill="#0E5259" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 123 80 L 136 175 L 125 177 L 115 105 Z" fill="#0E5259" stroke="#1A2628" strokeWidth="1.5" />
            {/* Hood Fur Trim around neck */}
            <path
              d="M 84 80 Q 100 87 116 80 Q 120 73 115 70 Q 100 78 85 70 Z"
              fill="#EDE8DC"
              stroke="#1A2628"
              strokeWidth="1.2"
            />
          </g>
        )}
      </g>

      {/* ====================================================================
          6. Footwear Layer
          ==================================================================== */}
      <g id="garment-shoes">
        {shoes === "flip_flops" && (
          // Slide Sandals
          <g>
            <ellipse cx="88" cy="328" rx="8" ry="3" fill="#1A2628" stroke="#1A2628" strokeWidth="1" />
            <ellipse cx="112" cy="328" rx="8" ry="3" fill="#1A2628" stroke="#1A2628" strokeWidth="1" />
            <path d="M 84 327 Q 88 322 92 327" fill="none" stroke="#ED6A85" strokeWidth="1.5" />
            <path d="M 108 327 Q 112 322 116 327" fill="none" stroke="#ED6A85" strokeWidth="1.5" />
          </g>
        )}

        {shoes === "leather_mules" && (
          // Leather Loafers / Mules (Oxblood / Black)
          <g>
            <path d="M 83 318 L 93 318 L 94 332 L 81 332 Z" fill="#3D1D24" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 107 318 L 117 318 L 119 332 L 106 332 Z" fill="#3D1D24" stroke="#1A2628" strokeWidth="1.5" />
            {/* Penny loafer strap */}
            <line x1="82" y1="324" x2="93" y2="324" stroke="#EDAC50" strokeWidth="1" />
            <line x1="107" y1="324" x2="118" y2="324" stroke="#EDAC50" strokeWidth="1" />
          </g>
        )}

        {shoes === "canvas_sneakers" && (
          // Court Sneakers (Crisp White Canvas)
          <g>
            <path d="M 82 316 L 94 316 L 95 334 L 80 334 Z" fill="#FFFFFF" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 106 316 L 118 316 L 120 334 L 105 334 Z" fill="#FFFFFF" stroke="#1A2628" strokeWidth="1.5" />
            {/* Rubber soles */}
            <rect x="80" y="331" width="15" height="4" fill="#EAE5D9" stroke="#1A2628" strokeWidth="1" />
            <rect x="105" y="331" width="15" height="4" fill="#EAE5D9" stroke="#1A2628" strokeWidth="1" />
            {/* Laces */}
            <line x1="84" y1="322" x2="92" y2="322" stroke="#1A2628" strokeWidth="1" />
            <line x1="108" y1="322" x2="116" y2="322" stroke="#1A2628" strokeWidth="1" />
          </g>
        )}

        {shoes === "chelsea_boots" && (
          // Waterproof Chelsea Boots (Waxed Black Leather)
          <g>
            <path d="M 81 310 L 95 310 L 96 336 L 79 336 Z" fill="#1A2628" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 105 310 L 119 310 L 121 336 L 104 336 Z" fill="#1A2628" stroke="#1A2628" strokeWidth="1.5" />
            {/* Elastic Gusset */}
            <polygon points="88,310 91,324 85,324" fill="#3A484A" />
            <polygon points="112,310 115,324 109,324" fill="#3A484A" />
          </g>
        )}

        {shoes === "goodyear_boots" && (
          // Goodyear-Welted Leather Work Boots (Cognac Brown)
          <g>
            <path d="M 81 306 L 95 306 L 96 336 L 79 336 Z" fill="#693A19" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 105 306 L 119 306 L 121 336 L 104 336 Z" fill="#693A19" stroke="#1A2628" strokeWidth="1.5" />
            {/* Rugged Sole */}
            <rect x="79" y="332" width="17" height="4" fill="#1A2628" stroke="#1A2628" strokeWidth="1" />
            <rect x="104" y="332" width="17" height="4" fill="#1A2628" stroke="#1A2628" strokeWidth="1" />
            {/* Speed hooks / laces */}
            <line x1="84" y1="312" x2="92" y2="312" stroke="#EDAC50" strokeWidth="1" />
            <line x1="84" y1="318" x2="92" y2="318" stroke="#EDAC50" strokeWidth="1" />
            <line x1="108" y1="312" x2="116" y2="312" stroke="#EDAC50" strokeWidth="1" />
            <line x1="108" y1="318" x2="116" y2="318" stroke="#EDAC50" strokeWidth="1" />
          </g>
        )}

        {shoes === "arctic_snow_boots" && (
          // Insulated Snow Boots (Slate Grey & Shearling Trim)
          <g>
            <path d="M 80 304 L 96 304 L 97 338 L 78 338 Z" fill="#3E4752" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 104 304 L 120 304 L 122 338 L 103 338 Z" fill="#3E4752" stroke="#1A2628" strokeWidth="1.5" />
            {/* Shearling Cuff */}
            <rect x="79" y="304" width="17" height="6" rx="2" fill="#FAF5EB" stroke="#1A2628" strokeWidth="1" />
            <rect x="104" y="304" width="17" height="6" rx="2" fill="#FAF5EB" stroke="#1A2628" strokeWidth="1" />
            {/* Heavy Arctic Tread */}
            <rect x="78" y="334" width="19" height="4" fill="#1A2628" stroke="#1A2628" strokeWidth="1" />
            <rect x="103" y="334" width="19" height="4" fill="#1A2628" stroke="#1A2628" strokeWidth="1" />
          </g>
        )}
      </g>

      {/* ====================================================================
          7. Accessories & Weather Gear Layer
          ==================================================================== */}
      <g id="garment-accessory">
        {accessory === "straw_hat" && (
          // Wide-Brim Straw Hat (Golden Summer Sun Shade)
          <g>
            <ellipse cx="100" cy="40" rx="28" ry="8" fill="#E8C363" stroke="#1A2628" strokeWidth="1.5" />
            <path d="M 91 38 Q 100 24 109 38 Z" fill="#DFB750" stroke="#1A2628" strokeWidth="1.5" />
            {/* Black ribbon band */}
            <path d="M 91 38 Q 100 42 109 38" fill="none" stroke="#1A2628" strokeWidth="2.5" />
          </g>
        )}

        {accessory === "acetate_shades" && (
          // Polarized Sunglasses (Tortoiseshell/Black)
          <g>
            <rect x="88" y="52" width="10" height="7" rx="1.5" fill="#1A2628" stroke="#1A2628" strokeWidth="1" />
            <rect x="102" y="52" width="10" height="7" rx="1.5" fill="#1A2628" stroke="#1A2628" strokeWidth="1" />
            <line x1="98" y1="55" x2="102" y2="55" stroke="#1A2628" strokeWidth="1.5" />
          </g>
        )}

        {accessory === "canvas_tote" && (
          // Heavy Canvas Tote (Slung on Left Shoulder)
          <g>
            <path d="M 75 145 L 67 185 L 85 188 L 82 147 Z" fill="#EFE9DD" stroke="#1A2628" strokeWidth="1.5" />
            {/* Strap */}
            <path d="M 80 115 Q 73 130 75 145" fill="none" stroke="#1A2628" strokeWidth="1.5" />
            {/* Graphic print on tote */}
            <line x1="72" y1="165" x2="80" y2="167" stroke="#ED6A85" strokeWidth="2" />
            <line x1="72" y1="170" x2="77" y2="171" stroke="#0C4F56" strokeWidth="1" />
          </g>
        )}

        {accessory === "windproof_umbrella" && (
          // Windproof Storm Umbrella (Overhead Canopy + Hook Handle in Right Hand)
          <g>
            {/* Shaft & Handle */}
            <line x1="124" y1="180" x2="135" y2="40" stroke="#1A2628" strokeWidth="2" />
            <path d="M 124 180 Q 120 185 122 190" fill="none" stroke="#1A2628" strokeWidth="2" strokeLinecap="round" />
            {/* Canopy */}
            <path
              d="M 105 45 Q 135 15 165 45 Q 150 42 135 44 Q 120 42 105 45 Z"
              fill="#0E5259"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            {/* Ferrule tip */}
            <line x1="135" y1="28" x2="135" y2="20" stroke="#1A2628" strokeWidth="2" />
          </g>
        )}

        {accessory === "cashmere_scarf_beanie" && (
          // Cashmere Scarf & Watch Cap Beanie (Rose/Coral Knit)
          <g>
            {/* Beanie Watch Cap */}
            <path
              d="M 86 46 Q 100 28 114 46 Z"
              fill="#ED6A85"
              stroke="#1A2628"
              strokeWidth="1.5"
            />
            <rect x="85" y="44" width="30" height="5" rx="1.5" fill="#F48BA1" stroke="#1A2628" strokeWidth="1" />
            
            {/* Thick Wrapped Scarf around Neck */}
            <ellipse cx="100" cy="79" rx="14" ry="6" fill="#ED6A85" stroke="#1A2628" strokeWidth="1.5" />
            {/* Hanging scarf tail */}
            <path d="M 104 82 L 108 115 L 100 115 L 98 83 Z" fill="#ED6A85" stroke="#1A2628" strokeWidth="1.5" />
            {/* Fringe */}
            <line x1="101" y1="115" x2="101" y2="120" stroke="#1A2628" strokeWidth="1" />
            <line x1="104" y1="115" x2="104" y2="120" stroke="#1A2628" strokeWidth="1" />
            <line x1="107" y1="115" x2="107" y2="120" stroke="#1A2628" strokeWidth="1" />
          </g>
        )}
      </g>
    </svg>
  );
}
