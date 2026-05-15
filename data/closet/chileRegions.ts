export interface ChileRegion {
  name: string;
  comunas: ChileComuna[];
}
 
export interface ChileComuna {
  name: string;
  latitude: number;
  longitude: number;
  cityCode: string; // Añadido para usar en la API de clima
}

// Lista de ciudades y sus límites geográficos aproximados (basado en el archivo SQL)
// Esta es ahora la fuente única de verdad para las ciudades soportadas.
export const CITIES_BOUNDARIES = [
  { name: 'Concepción', region: 'Región del Biobío', cityCode: 'SCIE', latMin: -36.9, latMax: -36.7, lonMin: -73.15, lonMax: -72.95 },
  { name: 'Quellón', region: 'Región de Los Lagos', cityCode: 'SCON', latMin: -43.23, latMax: -43.03, lonMin: -73.72, lonMax: -73.52 },
  { name: 'Chillán', region: 'Región de Ñuble', cityCode: 'SCCH', latMin: -36.7, latMax: -36.5, lonMin: -72.2, lonMax: -72.0 },
  { name: 'Osorno', region: 'Región de Los Lagos', cityCode: 'SCJO', latMin: -40.67, latMax: -40.47, lonMin: -73.23, lonMax: -73.03 },
  { name: 'Antártica', region: 'Antártica Chilena', cityCode: 'SCRM', latMin: -80, latMax: -60, lonMin: -100, lonMax: -53 },
  { name: 'Caldera', region: 'Región de Atacama', cityCode: 'SCAT', latMin: -27.17, latMax: -26.97, lonMin: -70.92, lonMax: -70.72 },
  { name: 'Santiago Poniente', region: 'Región Metropolitana', cityCode: 'SCEL', latMin: -33.53, latMax: -33.33, lonMin: -70.88, lonMax: -70.75 },
  { name: 'Iquique', region: 'Región de Tarapacá', cityCode: 'SCDA', latMin: -20.31, latMax: -20.11, lonMin: -70.25, lonMax: -70.05 },
  { name: 'Cochrane', region: 'Región de Aysén', cityCode: 'SCHR', latMin: -47.35, latMax: -47.15, lonMin: -72.67, lonMax: -72.47 },
  { name: 'Curicó', region: 'Región del Maule', cityCode: 'SCIC', latMin: -35.08, latMax: -34.88, lonMin: -71.33, lonMax: -71.13 },
  { name: 'La Serena/Coquimbo', region: 'Región de Coquimbo', cityCode: 'SCSE', latMin: -30.0, latMax: -29.8, lonMin: -71.35, lonMax: -71.15 },
  { name: 'Isla de Pascua', region: 'Región de Valparaíso', cityCode: 'SCIP', latMin: -27.24, latMax: -27.04, lonMin: -109.52, lonMax: -109.32 },
  { name: 'Puerto Montt', region: 'Región de Los Lagos', cityCode: 'SCTE', latMin: -41.57, latMax: -41.37, lonMin: -73.04, lonMax: -72.84 },
  { name: 'Arica', region: 'Región de Arica y Parinacota', cityCode: 'SCAR', latMin: -18.57, latMax: -18.37, lonMin: -70.42, lonMax: -70.22 },
  { name: 'Chaitén', region: 'Región de Los Lagos', cityCode: 'SCTN', latMin: -43.02, latMax: -42.82, lonMin: -72.81, lonMax: -72.61 },
  { name: 'Melinka', region: 'Región de Aysén', cityCode: 'SCMK', latMin: -44.0, latMax: -43.8, lonMin: -73.84, lonMax: -73.64 },
  { name: 'Santiago Centro', region: 'Región Metropolitana', cityCode: 'SCQN', latMin: -33.55, latMax: -33.35, lonMin: -70.74, lonMax: -70.56 },
  { name: 'Coyhaique', region: 'Región de Aysén', cityCode: 'SCCY', latMin: -45.67, latMax: -45.47, lonMin: -72.17, lonMax: -71.97 },
  { name: 'Calama', region: 'Región de Antofagasta', cityCode: 'SCCF', latMin: -22.55, latMax: -22.35, lonMin: -69.03, lonMax: -68.83 },
  { name: 'Temuco', region: 'Región de La Araucanía', cityCode: 'SCQP', latMin: -38.84, latMax: -38.64, lonMin: -72.69, lonMax: -72.49 },
  { name: 'Balmaceda', region: 'Región de Aysén', cityCode: 'SCBA', latMin: -46.0, latMax: -45.8, lonMin: -71.82, lonMax: -71.62 },
  { name: 'Punta Arenas', region: 'Región de Magallanes', cityCode: 'SCCI', latMin: -53.26, latMax: -53.06, lonMin: -71.01, lonMax: -70.81 },
  { name: 'Antofagasta', region: 'Región de Antofagasta', cityCode: 'SCFA', latMin: -23.75, latMax: -23.55, lonMin: -70.5, lonMax: -70.3 },
  { name: 'Viña del Mar/Valparaíso', region: 'Región de Valparaíso', cityCode: 'SCVM', latMin: -33.14, latMax: -32.94, lonMin: -71.71, lonMax: -71.51 },
  { name: 'San Antonio/Cartagena', region: 'Región de Valparaíso', cityCode: 'SCSN', latMin: -33.68, latMax: -33.48, lonMin: -71.71, lonMax: -71.51 },
  { name: 'Valdivia', region: 'Región de Los Ríos', cityCode: 'SCVD', latMin: -39.91, latMax: -39.71, lonMin: -73.34, lonMax: -73.14 },
  { name: 'Futaleufú', region: 'Región de Los Lagos', cityCode: 'SCFT', latMin: -43.28, latMax: -43.08, lonMin: -71.96, lonMax: -71.76 },
  { name: 'Rancagua', region: 'Región de O\'Higgins', cityCode: 'SCRG', latMin: -34.27, latMax: -34.07, lonMin: -70.84, lonMax: -70.64 },
  { name: 'Puerto Natales', region: 'Región de Magallanes', cityCode: 'SCNT', latMin: -51.82, latMax: -51.62, lonMin: -72.58, lonMax: -72.38 },
  { name: 'Los Angeles', region: 'Región del Biobío', cityCode: 'SCGE', latMin: -37.57, latMax: -37.37, lonMin: -72.45, lonMax: -72.25 },
  { name: 'Puerto Williams', region: 'Antártica Chilena', cityCode: 'SCGZ', latMin: -55.03, latMax: -54.83, lonMin: -67.71, lonMax: -67.51 },
  { name: 'Chile Chico', region: 'Región de Aysén', cityCode: 'SCCC', latMin: -46.63, latMax: -46.43, lonMin: -71.82, lonMax: -71.62 },
  { name: 'Juan Fernández', region: 'Región de Valparaíso', cityCode: 'SCIR', latMin: -33.74, latMax: -33.54, lonMin: -78.92, lonMax: -78.72 },
  { name: 'Porvenir', region: 'Región de Magallanes', cityCode: 'SCFM', latMin: -53.3, latMax: -53.2, lonMin: -70.4, lonMax: -70.2 },
];

/**
 * Genera la lista de regiones y comunas a partir de la lista de ciudades soportadas.
 * Esto asegura que la selección manual solo muestre las ciudades que la API de clima conoce.
 */
const generateRegionsFromBoundaries = (): ChileRegion[] => {
  const regionsMap = new Map<string, ChileComuna[]>();

  // Agrupar comunas por región
  for (const city of CITIES_BOUNDARIES) {
    if (!regionsMap.has(city.region)) {
      regionsMap.set(city.region, []);
    }
    regionsMap.get(city.region)!.push({
      name: city.name,
      // Usamos el centro del cuadro delimitador como coordenadas de la comuna
      latitude: (city.latMin + city.latMax) / 2,
      longitude: (city.lonMin + city.lonMax) / 2,
      cityCode: city.cityCode, // Propagamos el cityCode
    });
  }

  // Convertir el mapa a la estructura de array requerida
  return Array.from(regionsMap.entries()).map(([regionName, comunas]) => ({
    name: regionName,
    comunas: comunas.sort((a, b) => a.name.localeCompare(b.name)), // Ordenar comunas alfabéticamente
  })).sort((a, b) => a.name.localeCompare(b.name)); // Ordenar regiones alfabéticamente
};

export const CHILE_REGIONS: ChileRegion[] = generateRegionsFromBoundaries();
 
export const getRegionByName = (regionName: string): ChileRegion | undefined => {
  return CHILE_REGIONS.find(region => region.name === regionName);
};

export const getComunaByName = (regionName: string, comunaName: string): ChileComuna | undefined => {
  const region = getRegionByName(regionName);
  return region?.comunas.find(comuna => comuna.name === comunaName);
};

export const getRegionNames = (): string[] => {
  return CHILE_REGIONS.map(region => region.name);
};

export const getComunaNamesByRegion = (regionName: string): string[] => {
  const region = getRegionByName(regionName);
  return region ? region.comunas.map(comuna => comuna.name) : [];
};

export const findComunaByName = (comunaName: string): ChileComuna | undefined => {
  for (const region of CHILE_REGIONS) {
    const comuna = region.comunas.find(c => c.name === comunaName);
    if (comuna) {
      return comuna;
    }
  }
  return undefined;
};
