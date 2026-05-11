// Centralized country → continent mapping
// Used by: useLeaders hook, Analytics page, Database filters

// Map from world-atlas country name → our canonical name
export const ATLAS_TO_CANONICAL = {
  "United States of America": "United States",
  "United Kingdom": "United Kingdom",
  "South Africa": "South Africa",
};

// Canonical name → continent
export const COUNTRY_TO_CONTINENT = {
  // Africa (54 countries)
  "South Africa": "Africa", Nigeria: "Africa", Kenya: "Africa",
  Tanzania: "Africa", Uganda: "Africa", Ghana: "Africa",
  Ethiopia: "Africa", Rwanda: "Africa", Senegal: "Africa",
  Algeria: "Africa", Angola: "Africa", Benin: "Africa",
  Botswana: "Africa", "Burkina Faso": "Africa", Burundi: "Africa",
  Cameroon: "Africa", "Cape Verde": "Africa", "Central African Republic": "Africa",
  Chad: "Africa", Comoros: "Africa", Congo: "Africa",
  "Côte d'Ivoire": "Africa", "Democratic Republic of the Congo": "Africa", Djibouti: "Africa",
  Egypt: "Africa", "Equatorial Guinea": "Africa", Eritrea: "Africa",
  Eswatini: "Africa", Gabon: "Africa", Gambia: "Africa",
  Guinea: "Africa", "Guinea-Bissau": "Africa",
  Lesotho: "Africa", Liberia: "Africa", Libya: "Africa",
  Madagascar: "Africa", Malawi: "Africa", Mali: "Africa",
  Mauritania: "Africa", Mauritius: "Africa", Morocco: "Africa",
  Mozambique: "Africa", Namibia: "Africa", Niger: "Africa",
  "Sao Tome and Principe": "Africa", Seychelles: "Africa",
  "Sierra Leone": "Africa", Somalia: "Africa", "South Sudan": "Africa",
  Sudan: "Africa", Togo: "Africa", Tunisia: "Africa",
  Zambia: "Africa", Zimbabwe: "Africa",

  // Asia
  India: "Asia", Malaysia: "Asia", China: "Asia", Japan: "Asia",
  Afghanistan: "Asia", Bangladesh: "Asia", Bhutan: "Asia",
  Brunei: "Asia", Cambodia: "Asia", Indonesia: "Asia",
  Kazakhstan: "Asia", Kyrgyzstan: "Asia", Laos: "Asia",
  Maldives: "Asia", Mongolia: "Asia", Myanmar: "Asia",
  Nepal: "Asia", Pakistan: "Asia", Philippines: "Asia",
  Singapore: "Asia", "South Korea": "Asia", "Sri Lanka": "Asia",
  Taiwan: "Asia", Tajikistan: "Asia", Thailand: "Asia",
  Turkmenistan: "Asia", Uzbekistan: "Asia", Vietnam: "Asia",

  // Europe
  France: "Europe", "United Kingdom": "Europe", Germany: "Europe", Switzerland: "Europe",
  Albania: "Europe", Austria: "Europe", Belgium: "Europe",
  "Bosnia and Herzegovina": "Europe", Bulgaria: "Europe", Croatia: "Europe",
  Cyprus: "Europe", "Czech Republic": "Europe", Denmark: "Europe",
  Estonia: "Europe", Finland: "Europe", Greece: "Europe",
  Hungary: "Europe", Iceland: "Europe", Ireland: "Europe",
  Italy: "Europe", Latvia: "Europe", Lithuania: "Europe",
  Luxembourg: "Europe", Malta: "Europe", Montenegro: "Europe",
  Netherlands: "Europe", "North Macedonia": "Europe", Norway: "Europe",
  Poland: "Europe", Portugal: "Europe", Romania: "Europe",
  Serbia: "Europe", Slovakia: "Europe", Slovenia: "Europe",
  Spain: "Europe", Sweden: "Europe", Turkey: "Europe",
  Ukraine: "Europe",

  // North America
  "United States": "North America", Canada: "North America",
  Mexico: "North America", "Costa Rica": "North America",
  Cuba: "North America", "Dominican Republic": "North America",
  "El Salvador": "North America", Guatemala: "North America",
  Haiti: "North America", Honduras: "North America",
  Jamaica: "North America", Nicaragua: "North America",
  Panama: "North America", "Trinidad and Tobago": "North America",

  // South America
  Brazil: "South America",
  Argentina: "South America", Bolivia: "South America",
  Chile: "South America", Colombia: "South America",
  Ecuador: "South America", Guyana: "South America",
  Paraguay: "South America", Peru: "South America",
  Suriname: "South America", Uruguay: "South America",
  Venezuela: "South America",

  // Oceania
  Australia: "Oceania",
  "New Zealand": "Oceania", Fiji: "Oceania",
  "Papua New Guinea": "Oceania", Samoa: "Oceania",
  "Solomon Islands": "Oceania", Tonga: "Oceania",
  Vanuatu: "Oceania",
};

// Analytics page: canonical country name → region key
export const COUNTRY_TO_REGION = {
  "United States": "north_america", Canada: "north_america", Mexico: "north_america",
  Brazil: "latin_america", Argentina: "latin_america", Colombia: "latin_america",
  Peru: "latin_america", Chile: "latin_america",
  France: "europe", "United Kingdom": "europe", Germany: "europe",
  Switzerland: "europe", Spain: "europe", Italy: "europe", Netherlands: "europe",
  // All African countries → sub_saharan_africa
  "South Africa": "sub_saharan_africa", Nigeria: "sub_saharan_africa",
  Kenya: "sub_saharan_africa", Tanzania: "sub_saharan_africa",
  Uganda: "sub_saharan_africa", Ghana: "sub_saharan_africa",
  Ethiopia: "sub_saharan_africa", Rwanda: "sub_saharan_africa", Senegal: "sub_saharan_africa",
  Algeria: "sub_saharan_africa", Angola: "sub_saharan_africa", Benin: "sub_saharan_africa",
  Botswana: "sub_saharan_africa", "Burkina Faso": "sub_saharan_africa", Burundi: "sub_saharan_africa",
  Cameroon: "sub_saharan_africa", "Cape Verde": "sub_saharan_africa",
  "Central African Republic": "sub_saharan_africa", Chad: "sub_saharan_africa",
  Comoros: "sub_saharan_africa", Congo: "sub_saharan_africa",
  "Côte d'Ivoire": "sub_saharan_africa",
  "Democratic Republic of the Congo": "sub_saharan_africa", Djibouti: "sub_saharan_africa",
  Egypt: "sub_saharan_africa", "Equatorial Guinea": "sub_saharan_africa",
  Eritrea: "sub_saharan_africa", Eswatini: "sub_saharan_africa", Gabon: "sub_saharan_africa",
  Gambia: "sub_saharan_africa", Guinea: "sub_saharan_africa",
  "Guinea-Bissau": "sub_saharan_africa", Lesotho: "sub_saharan_africa",
  Liberia: "sub_saharan_africa", Libya: "sub_saharan_africa",
  Madagascar: "sub_saharan_africa", Malawi: "sub_saharan_africa", Mali: "sub_saharan_africa",
  Mauritania: "sub_saharan_africa", Mauritius: "sub_saharan_africa", Morocco: "sub_saharan_africa",
  Mozambique: "sub_saharan_africa", Namibia: "sub_saharan_africa", Niger: "sub_saharan_africa",
  "Sao Tome and Principe": "sub_saharan_africa", Seychelles: "sub_saharan_africa",
  "Sierra Leone": "sub_saharan_africa", Somalia: "sub_saharan_africa",
  "South Sudan": "sub_saharan_africa", Sudan: "sub_saharan_africa",
  Togo: "sub_saharan_africa", Tunisia: "sub_saharan_africa",
  Zambia: "sub_saharan_africa", Zimbabwe: "sub_saharan_africa",
  India: "south_asia", Pakistan: "south_asia", Bangladesh: "south_asia",
  "Sri Lanka": "south_asia", Nepal: "south_asia", Bhutan: "south_asia",
};

// No manual exclusions needed — highlighting is driven by actual leader data (country field)

export const REGION_LABELS = {
  north_america:    "North America",
  latin_america:    "Latin America",
  europe:           "Europe",
  sub_saharan_africa: "Sub-Saharan Africa",
  south_asia:       "South & SE Asia",
};

export const REGION_MARKERS = [
  { key: "north_america",      coordinates: [-95, 40],  oceanCoords: [-58, 30]  },
  { key: "latin_america",      coordinates: [-55, -10], oceanCoords: [-58, 30]  },
  { key: "europe",             coordinates: [10, 50],   oceanCoords: [-58, 30]  },
  { key: "sub_saharan_africa", coordinates: [20, 5],    oceanCoords: [-22, -22] },
  { key: "south_asia",         coordinates: [80, 20],   oceanCoords: [78, -5]   },
];

export const CONTINENTS = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"];

// Maps geo scope dropdown values → continent filter(s)
// null means "show all countries" (Global, National, or unselected)
export const GEO_SCOPE_TO_CONTINENTS = {
  "Global": null,
  "Africa": ["Africa"],
  "Americas": ["North America", "South America"],
  "Asia": ["Asia"],
  "Europe": ["Europe"],
  "Oceania": ["Oceania"],
  "National": null,
};

/** Filter the full country list to only those within the given geo scope. */
export function getCountriesForGeoScope(geoScope) {
  const continents = GEO_SCOPE_TO_CONTINENTS[geoScope];
  if (!continents) return ALL_COUNTRIES;
  return ALL_COUNTRIES.filter(c => continents.includes(COUNTRY_TO_CONTINENT[c]));
}

// Canonical sorted list of all known countries (derived from COUNTRY_TO_CONTINENT)
export const ALL_COUNTRIES = Object.keys(COUNTRY_TO_CONTINENT).sort();
