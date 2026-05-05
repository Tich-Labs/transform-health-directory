// Centralized country → continent mapping
// Used by: useLeaders hook, Analytics page, Database filters

export const COUNTRY_TO_CONTINENT = {
  "South Africa": "Africa",  Nigeria: "Africa",    Kenya: "Africa",
  Tanzania:       "Africa",  Uganda: "Africa",     Ghana: "Africa",
  Ethiopia:       "Africa",  Rwanda: "Africa",     Senegal: "Africa",
  India:          "Asia",    Malaysia: "Asia",     China: "Asia",     Japan: "Asia",
  France:         "Europe",  "United Kingdom": "Europe", Germany: "Europe", Switzerland: "Europe",
  "United States": "North America", Canada: "North America",
  Brazil:         "South America",
  Australia:      "Oceania",
};

// Analytics page region keys (different grouping)
export const COUNTRY_TO_REGION = {
  "United States": "north_america", Canada: "north_america", Mexico: "north_america",
  Brazil: "latin_america", Argentina: "latin_america", Colombia: "latin_america",
  Peru: "latin_america", Chile: "latin_america",
  France: "europe", "United Kingdom": "europe", Germany: "europe",
  Switzerland: "europe", Spain: "europe", Italy: "europe", Netherlands: "europe",
  "South Africa": "sub_saharan_africa", Nigeria: "sub_saharan_africa",
  Kenya: "sub_saharan_africa", Tanzania: "sub_saharan_africa",
  Uganda: "sub_saharan_africa", Ghana: "sub_saharan_africa",
  Ethiopia: "sub_saharan_africa", Rwanda: "sub_saharan_africa", Senegal: "sub_saharan_africa",
  India: "south_asia", Pakistan: "south_asia", Bangladesh: "south_asia",
  "Sri Lanka": "south_asia", Nepal: "south_asia", Bhutan: "south_asia",
};

// Region metadata for Analytics page
export const REGION_LABELS = {
  north_america:    "North America",
  latin_america:    "Latin America",
  europe:           "Europe",
  sub_saharan_africa: "Sub-Saharan Africa",
  south_asia:       "South & SE Asia",
};

export const REGION_MARKERS = [
  { key: "north_america",     coordinates: [-95, 40],  dx: -105, dy: -90, oceanCoords: [-110, 42] },  // Atlantic left of N. America (visible)
  { key: "latin_america",     coordinates: [-55, -10], dx: -55,  dy: 80,  oceanCoords: [-75, -8]  },  // Pacific left of S. America (visible)
  { key: "europe",            coordinates: [10, 50],   dx: 60,   dy: 80,  oceanCoords: [-25, 44]  },  // Atlantic between Americas & Europe
  { key: "sub_saharan_africa",coordinates: [20, 5],    dx: 60,   dy: 55,  oceanCoords: [18, -38]  },  // South Atlantic below SA
  { key: "south_asia",        coordinates: [80, 20],   dx: 85,   dy: -55, oceanCoords: [78, -12]  },  // Indian Ocean (user confirmed working)
];

export const CONTINENTS = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"];
