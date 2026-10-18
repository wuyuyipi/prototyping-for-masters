export type MetArtworkData = {
  objectID: number;
  title: string;
  artistDisplayName: string;
  artistDisplayBio: string;
  objectDate: string;
  medium: string;
  dimensions?: string;
  department: string;
  primaryImage: string;
  primaryImageSmall: string;
  remoteImage?: string;
  objectURL: string;
  creditLine?: string;
  weatherConditionCategory: "rain" | "storm" | "snow" | "clear" | "clouds";
  weatherMood: string;
  curatorialNote: string;
};

// Curated collection of 100% verified Open Access public domain masterworks from The Met
// Bundled locally in /public/met-art/ for instant, 100% reliable zero-latency delivery
export const MET_WEATHER_MASTERWORKS: Record<
  "rain" | "storm" | "snow" | "clear" | "clouds",
  MetArtworkData[]
> = {
  rain: [
    {
      objectID: 36971,
      title: "Spring Rain at Tsuchiyama (Fifty-three Stations of the Tōkaidō)",
      artistDisplayName: "Utagawa Hiroshige",
      artistDisplayBio: "Japanese, Tokyo 1797–1858 Tokyo",
      objectDate: "1834–35",
      medium: "Woodblock print; ink and color on paper",
      dimensions: "9 1/2 × 14 in. (24.1 × 35.6 cm)",
      department: "Asian Art",
      primaryImage: "/met-art/rain_hiroshige_tsuchiyama.jpg",
      primaryImageSmall: "/met-art/rain_hiroshige_tsuchiyama.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/as/web-large/DP122230.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/36971",
      creditLine: "Rogers Fund, 1918",
      weatherConditionCategory: "rain",
      weatherMood: "Heavy Spring Downpour & River Crossing",
      curatorialNote:
        "Sheets of dark spring rain slice diagonally across the flooded mountain river, capturing the wet atmosphere and drenched travelers in Hiroshige’s masterwork.",
    },
    {
      objectID: 51087,
      title: "Rain of the Fifth Month (Samidare)",
      artistDisplayName: "Utagawa Kunisada",
      artistDisplayBio: "Japanese, 1786–1864",
      objectDate: "1847–1852",
      medium: "Polychrome woodblock print; ink and color on paper",
      dimensions: "14 1/8 × 9 11/16 in. (35.9 × 24.6 cm)",
      department: "Asian Art",
      primaryImage: "/met-art/rain_kunisada_samidare.jpg",
      primaryImageSmall: "/met-art/rain_kunisada_samidare.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/as/web-large/DP124461.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/51087",
      creditLine: "Bequest of William S. Lieberman, 2005",
      weatherConditionCategory: "rain",
      weatherMood: "Steady Early Summer Drizzle (Samidare)",
      curatorialNote:
        "The gentle persistence of early summer drizzle is etched through paper umbrellas and flowing garments, mirroring steady overcast rainfall.",
    },
    {
      objectID: 36531,
      title: "Night Rain at Karasaki (Eight Views of Ōmi)",
      artistDisplayName: "Utagawa Hiroshige",
      artistDisplayBio: "Japanese, Tokyo 1797–1858 Tokyo",
      objectDate: "ca. 1835",
      medium: "Woodblock print; ink and color on paper",
      dimensions: "8 3/4 × 13 5/8 in. (22.2 × 34.6 cm)",
      department: "Asian Art",
      primaryImage: "/met-art/rain_hiroshige_karasaki.jpg",
      primaryImageSmall: "/met-art/rain_hiroshige_karasaki.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/as/web-large/DP122118.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/36531",
      creditLine: "Rogers Fund, 1918",
      weatherConditionCategory: "rain",
      weatherMood: "Nocturnal Rain over Lake Biwa",
      curatorialNote:
        "Gentle veil of nocturnal rain falling upon the ancient pine tree of Karasaki on Lake Biwa, conveying peaceful, cool dampness.",
    },
  ],
  storm: [
    {
      objectID: 435997,
      title: "The Storm",
      artistDisplayName: "Pierre-Auguste Cot",
      artistDisplayBio: "French, Bédarieux 1837–1883 Paris",
      objectDate: "1880",
      medium: "Oil on canvas",
      dimensions: "92 1/4 × 61 1/2 in. (234.3 × 156.2 cm)",
      department: "European Paintings",
      primaryImage: "/met-art/storm_cot_the_storm.jpg",
      primaryImageSmall: "/met-art/storm_cot_the_storm.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ep/web-large/DT11964.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/435997",
      creditLine: "Bequest of Catharine Lorillard Wolfe, 1887",
      weatherConditionCategory: "storm",
      weatherMood: "Sudden Gale & Woodland Tempest",
      curatorialNote:
        "Cot’s sweeping canvas depicts two young figures fleeing an oncoming thunderstorm as wind violently bends the woodland branches overhead.",
    },
    {
      objectID: 11050,
      title: "Approaching Thunder Storm",
      artistDisplayName: "Martin Johnson Heade",
      artistDisplayBio: "American, Lumberville, PA 1819–1904 St. Augustine, FL",
      objectDate: "1859",
      medium: "Oil on canvas",
      dimensions: "28 × 44 in. (71.1 × 111.8 cm)",
      department: "The American Wing",
      primaryImage: "/met-art/storm_heade_thunderstorm.jpg",
      primaryImageSmall: "/met-art/storm_heade_thunderstorm.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ad/web-large/DP248013.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/11050",
      creditLine: "Gift of the Erving and Joyce Wolf Foundation, 1975",
      weatherConditionCategory: "storm",
      weatherMood: "Eerie Pre-Storm Calm & Electric Skies",
      curatorialNote:
        "The black, ominous shelf cloud looming over glassy coastal water captures the uncanny suspense moments before lightning and heavy gusts strike.",
    },
    {
      objectID: 45434,
      title: "Under the Wave off Kanagawa (The Great Wave)",
      artistDisplayName: "Katsushika Hokusai",
      artistDisplayBio: "Japanese, Tokyo 1760–1849 Tokyo",
      objectDate: "ca. 1830–32",
      medium: "Woodblock print; ink and color on paper",
      dimensions: "10 1/8 × 14 15/16 in. (25.7 × 37.9 cm)",
      department: "Asian Art",
      primaryImage: "/met-art/storm_hokusai_great_wave.jpg",
      primaryImageSmall: "/met-art/storm_hokusai_great_wave.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/as/web-large/DP130155.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/45434",
      creditLine: "H. O. Havemeyer Collection, Bequest of Mrs. H. O. Havemeyer, 1929",
      weatherConditionCategory: "storm",
      weatherMood: "Oceanic Tempest & Gale-Force Winds",
      curatorialNote:
        "Towering crested waves freeze in dynamic claw-like foam against an ominous sky, embodying the ferocious power of severe gale conditions.",
    },
    {
      objectID: 11122,
      title: "The Gulf Stream",
      artistDisplayName: "Winslow Homer",
      artistDisplayBio: "American, Boston 1836–1910 Prouts Neck, Maine",
      objectDate: "1899; reworked by 1906",
      medium: "Oil on canvas",
      dimensions: "28 1/8 × 49 1/8 in. (71.4 × 124.8 cm)",
      department: "The American Wing",
      primaryImage: "/met-art/storm_homer_gulf_stream.jpg",
      primaryImageSmall: "/met-art/storm_homer_gulf_stream.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ad/web-large/DP-20821-001.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/11122",
      creditLine: "Catharine Lorillard Wolfe Collection, Wolfe Fund, 1906",
      weatherConditionCategory: "storm",
      weatherMood: "Tropical Squall & Swelling Seas",
      curatorialNote:
        "A dismasted boat tossed by churning swells beneath a bruised, stormy horizon evokes high winds and torrential tropical tempests.",
    },
  ],
  snow: [
    {
      objectID: 437686,
      title: "Rue Eugène Moussoir at Moret: Winter",
      artistDisplayName: "Alfred Sisley",
      artistDisplayBio: "British, Paris 1839–1899 Moret-sur-Loing",
      objectDate: "1891",
      medium: "Oil on canvas",
      dimensions: "23 × 28 3/8 in. (58.4 × 72.1 cm)",
      department: "European Paintings",
      primaryImage: "/met-art/snow_sisley_winter.jpg",
      primaryImageSmall: "/met-art/snow_sisley_winter.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ep/web-large/DP-33708-001.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/437686",
      creditLine: "Bequest of Miss Adelaide Milton de Groot, 1967",
      weatherConditionCategory: "snow",
      weatherMood: "Quiet Snowfall & Crisp Winter Air",
      curatorialNote:
        "Sisley’s winter streetscape registers soft lilac shadows in fresh snow, evoking the muffled stillness and crisp chill of sub-freezing temperatures.",
    },
    {
      objectID: 436826,
      title: "Winter Landscape, Holland",
      artistDisplayName: "Barend Cornelis Koekkoek",
      artistDisplayBio: "Dutch, Middelburg 1803–1862 Cleves",
      objectDate: "1833",
      medium: "Oil on canvas",
      dimensions: "26 × 32 in. (66 × 81.3 cm)",
      department: "European Paintings",
      primaryImage: "/met-art/snow_koekkoek_winter.jpg",
      primaryImageSmall: "/met-art/snow_koekkoek_winter.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ep/web-large/DP143197.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/436826",
      creditLine: "Bequest of Catharine Lorillard Wolfe, 1887",
      weatherConditionCategory: "snow",
      weatherMood: "Deep Frost & Frozen Canal",
      curatorialNote:
        "Frosted branches and ice-skaters navigating frozen waterways reflect the clarity and brisk energy of a deep Northern winter.",
    },
    {
      objectID: 54646,
      title: "Snow Landscape",
      artistDisplayName: "Hashimoto Gahō",
      artistDisplayBio: "Japanese, Kawagoe 1835–1908 Tokyo",
      objectDate: "ca. 1885–89",
      medium: "Album leaf; ink and color on silk",
      dimensions: "14 1/4 × 10 1/2 in. (36.2 × 26.7 cm)",
      department: "Asian Art",
      primaryImage: "/met-art/snow_hashimoto_landscape.jpg",
      primaryImageSmall: "/met-art/snow_hashimoto_landscape.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/as/web-large/DP211828.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/54646",
      creditLine: "Charles Stewart Smith Collection, 1914",
      weatherConditionCategory: "snow",
      weatherMood: "Silent Mountain Snowdrift",
      curatorialNote:
        "Delicate ink washes on silk create a serene mountain wilderness coated in pure white snow, evoking silent winter solitude.",
    },
  ],
  clear: [
    {
      objectID: 435809,
      title: "The Harvesters",
      artistDisplayName: "Pieter Bruegel the Elder",
      artistDisplayBio: "Netherlandish, Breda ca. 1525–1569 Brussels",
      objectDate: "1565",
      medium: "Oil on wood",
      dimensions: "46 7/8 × 63 3/4 in. (119 × 162 cm)",
      department: "European Paintings",
      primaryImage: "/met-art/clear_bruegel_harvesters.jpg",
      primaryImageSmall: "/met-art/clear_bruegel_harvesters.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ep/web-large/DP119115.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/435809",
      creditLine: "Rogers Fund, 1919",
      weatherConditionCategory: "clear",
      weatherMood: "Golden Summer Sun & Harvest Heat",
      curatorialNote:
        "A monumental tribute to late-summer warmth, where golden light and ripe wheat fields shimmer under a high, pale blue sky.",
    },
    {
      objectID: 438551,
      title: "On the Beach, Sunset",
      artistDisplayName: "Eugène Boudin",
      artistDisplayBio: "French, Honfleur 1824–1898 Deauville",
      objectDate: "1865",
      medium: "Oil on wood",
      dimensions: "15 × 23 1/4 in. (38.1 × 59.1 cm)",
      department: "European Paintings",
      primaryImage: "/met-art/clear_boudin_sunset.jpg",
      primaryImageSmall: "/met-art/clear_boudin_sunset.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ep/web-large/DT1031.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/438551",
      creditLine: "Bequest of Miss Adelaide Milton de Groot, 1967",
      weatherConditionCategory: "clear",
      weatherMood: "Radiant Evening Glow & Crisp Horizons",
      curatorialNote:
        "Boudin, known as the 'master of skies', captures the expansive clarity of clear weather as the setting sun warms the open coastline.",
    },
    {
      objectID: 436528,
      title: "Irises",
      artistDisplayName: "Vincent van Gogh",
      artistDisplayBio: "Dutch, Zundert 1853–1890 Auvers-sur-Oise",
      objectDate: "1890",
      medium: "Oil on canvas",
      dimensions: "29 × 36 1/4 in. (73.7 × 92.1 cm)",
      department: "European Paintings",
      primaryImage: "/met-art/clear_vangogh_irises.jpg",
      primaryImageSmall: "/met-art/clear_vangogh_irises.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ep/web-large/DP346474.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/436528",
      creditLine: "Gift of Adele R. Levy, 1958",
      weatherConditionCategory: "clear",
      weatherMood: "Luminous Spring Sun & Radiant Blooms",
      curatorialNote:
        "Bathed in radiant Provence light against a soft pink backdrop, Van Gogh’s bold blossoms celebrate clear, cheerful sunshine.",
    },
    {
      objectID: 10481,
      title: "Heart of the Andes",
      artistDisplayName: "Frederic Edwin Church",
      artistDisplayBio: "American, Hartford, CT 1826–1900 New York",
      objectDate: "1859",
      medium: "Oil on canvas",
      dimensions: "66 1/8 × 120 3/16 in. (168 × 302.9 cm)",
      department: "The American Wing",
      primaryImage: "/met-art/clear_church_andes.jpg",
      primaryImageSmall: "/met-art/clear_church_andes.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ad/web-large/DT78.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/10481",
      creditLine: "Bequest of Margaret E. Dows, 1909",
      weatherConditionCategory: "clear",
      weatherMood: "Brilliant High-Altitude Sunshine",
      curatorialNote:
        "Sunlight illuminates cascading waterfalls and lush mountain valleys, celebrating the sublime beauty of an expansive, crystal-clear day.",
    },
  ],
  clouds: [
    {
      objectID: 436535,
      title: "Wheat Field with Cypresses",
      artistDisplayName: "Vincent van Gogh",
      artistDisplayBio: "Dutch, Zundert 1853–1890 Auvers-sur-Oise",
      objectDate: "1889",
      medium: "Oil on canvas",
      dimensions: "28 7/8 × 36 3/4 in. (73.2 × 93.4 cm)",
      department: "European Paintings",
      primaryImage: "/met-art/clouds_vangogh_wheatfield.jpg",
      primaryImageSmall: "/met-art/clouds_vangogh_wheatfield.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ep/web-large/DP-42549-001.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/436535",
      creditLine: "The Annenberg Collection, 1993",
      weatherConditionCategory: "clouds",
      weatherMood: "Turbulent Clouds & Gusty Wind",
      curatorialNote:
        "Turbulent, ribboned cumulus clouds undulate above the Provençal wheat field, embodying dynamic winds and heavy atmospheric cloud cover.",
    },
    {
      objectID: 437980,
      title: "Cypresses",
      artistDisplayName: "Vincent van Gogh",
      artistDisplayBio: "Dutch, Zundert 1853–1890 Auvers-sur-Oise",
      objectDate: "1889",
      medium: "Oil on canvas",
      dimensions: "36 3/4 × 29 1/8 in. (93.4 × 74 cm)",
      department: "European Paintings",
      primaryImage: "/met-art/clouds_vangogh_cypresses.jpg",
      primaryImageSmall: "/met-art/clouds_vangogh_cypresses.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ep/web-large/DP130999.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/437980",
      creditLine: "Rogers Fund, 1949",
      weatherConditionCategory: "clouds",
      weatherMood: "Billowing Cloud Banks & Wind Gusts",
      curatorialNote:
        "Swirling, sculptural cloud patterns form an expressive canopy over towering evergreen cypresses swaying in strong breezes.",
    },
    {
      objectID: 436005,
      title: "The Calm Sea",
      artistDisplayName: "Gustave Courbet",
      artistDisplayBio: "French, Ornans 1819–1877 La Tour-de-Peilz",
      objectDate: "1869",
      medium: "Oil on canvas",
      dimensions: "23 1/2 × 28 3/4 in. (59.7 × 73 cm)",
      department: "European Paintings",
      primaryImage: "/met-art/clouds_courbet_calm_sea.jpg",
      primaryImageSmall: "/met-art/clouds_courbet_calm_sea.jpg",
      remoteImage: "https://images.metmuseum.org/CRDImages/ep/web-large/DT1973.jpg",
      objectURL: "https://www.metmuseum.org/art/collection/search/436005",
      creditLine: "H. O. Havemeyer Collection, Bequest of Mrs. H. O. Havemeyer, 1929",
      weatherConditionCategory: "clouds",
      weatherMood: "Expansive Overcast Horizon & Muted Waters",
      curatorialNote:
        "Courbet’s immense sky filled with low, soft cloud layers over a placid shoreline reflects the meditative stillness of an overcast day.",
    },
  ],
};

export function resolveWeatherArtCategory(condition?: string, tempF?: number): "rain" | "storm" | "snow" | "clear" | "clouds" {
  const cond = (condition || "").toLowerCase();

  // If sub-freezing, snow/winter theme is appropriate even if overcast
  if (tempF !== undefined && tempF <= 32) {
    return "snow";
  }

  if (cond.includes("snow") || cond.includes("sleet") || cond.includes("blizzard") || cond.includes("ice") || cond.includes("freez")) {
    return "snow";
  }
  if (cond.includes("thunder") || cond.includes("storm") || cond.includes("tornado") || cond.includes("squall") || cond.includes("gale")) {
    return "storm";
  }
  if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower") || cond.includes("wet")) {
    return "rain";
  }
  if (cond.includes("cloud") || cond.includes("overcast") || cond.includes("fog") || cond.includes("mist") || cond.includes("haze")) {
    return "clouds";
  }
  if (cond.includes("clear") || cond.includes("sun") || cond.includes("fair")) {
    return "clear";
  }

  // Default fallback
  return "clouds";
}
