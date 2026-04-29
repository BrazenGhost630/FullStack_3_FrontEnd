export interface ChileRegion {
  name: string;
  comunas: ChileComuna[];
}

export interface ChileComuna {
  name: string;
  latitude: number;
  longitude: number;
}

export const CHILE_REGIONS: ChileRegion[] = [
  {
    name: 'Región de Arica y Parinacota',
    comunas: [
      { name: 'Arica', latitude: -18.4746, longitude: -70.3013 },
      { name: 'Putre', latitude: -18.1933, longitude: -69.5806 }
    ]
  },
  {
    name: 'Región de Tarapacá',
    comunas: [
      { name: 'Iquique', latitude: -20.2206, longitude: -70.1507 },
      { name: 'Alto Hospicio', latitude: -20.2705, longitude: -70.1155 }
    ]
  },
  {
    name: 'Región de Antofagasta',
    comunas: [
      { name: 'Antofagasta', latitude: -23.6499, longitude: -70.4008 },
      { name: 'Calama', latitude: -22.4518, longitude: -68.9253 },
      { name: 'Tocopilla', latitude: -22.0876, longitude: -70.1831 }
    ]
  },
  {
    name: 'Región de Atacama',
    comunas: [
      { name: 'Copiapó', latitude: -27.3667, longitude: -70.3333 },
      { name: 'Chañaral', latitude: -26.8592, longitude: -70.6197 },
      { name: 'Vallenar', latitude: -28.5742, longitude: -70.7706 }
    ]
  },
  {
    name: 'Región de Coquimbo',
    comunas: [
      { name: 'La Serena', latitude: -29.9045, longitude: -71.2489 },
      { name: 'Coquimbo', latitude: -30.0474, longitude: -71.3497 },
      { name: 'Ovalle', latitude: -30.6028, longitude: -71.2006 }
    ]
  },
  {
    name: 'Región de Valparaíso',
    comunas: [
      { name: 'Valparaíso', latitude: -33.0458, longitude: -71.6204 },
      { name: 'Viña del Mar', latitude: -32.9516, longitude: -71.5455 },
      { name: 'Quilpué', latitude: -33.0474, longitude: -71.6887 },
      { name: 'Villa Alemana', latitude: -33.0333, longitude: -71.6333 },
      { name: 'Limache', latitude: -32.9833, longitude: -71.2500 },
      { name: 'Olmué', latitude: -32.9833, longitude: -71.1667 },
      { name: 'La Calera', latitude: -32.7833, longitude: -71.2000 },
      { name: 'Hijuelas', latitude: -32.8167, longitude: -71.1167 },
      { name: 'La Cruz', latitude: -32.8333, longitude: -71.2500 },
      { name: 'Nogales', latitude: -32.8000, longitude: -71.2167 },
      { name: 'Quillota', latitude: -32.8833, longitude: -71.2333 },
      { name: 'San Antonio', latitude: -33.5929, longitude: -71.6077 },
      { name: 'San Pedro', latitude: -33.5500, longitude: -71.6167 },
      { name: 'Cartagena', latitude: -33.6667, longitude: -71.6000 },
      { name: 'El Tabo', latitude: -33.4500, longitude: -71.6333 },
      { name: 'El Quisco', latitude: -33.4167, longitude: -71.6833 },
      { name: 'Santo Domingo', latitude: -33.6500, longitude: -71.6500 },
      { name: 'Los Andes', latitude: -32.8333, longitude: -70.6000 },
      { name: 'Rinconada', latitude: -32.8500, longitude: -70.6833 },
      { name: 'San Esteban', latitude: -32.8167, longitude: -70.6500 },
      { name: 'Calle Larga', latitude: -32.9000, longitude: -70.5333 },
      { name: 'Catemu', latitude: -32.7500, longitude: -70.9167 },
      { name: 'Llay-Llay', latitude: -32.8333, longitude: -70.9500 },
      { name: 'Panquehue', latitude: -32.7833, longitude: -71.0833 },
      { name: 'Putaendo', latitude: -32.7000, longitude: -70.7333 },
      { name: 'Santa María', latitude: -32.8833, longitude: -70.9000 },
      { name: 'Cabildo', latitude: -32.9667, longitude: -70.9500 },
      { name: 'La Ligua', latitude: -32.4500, longitude: -71.1667 },
      { name: 'Papudo', latitude: -32.4667, longitude: -71.4333 },
      { name: 'Petorca', latitude: -32.2333, longitude: -70.8500 },
      { name: 'Zapallar', latitude: -32.5500, longitude: -71.4500 },
      { name: 'Puchuncaví', latitude: -32.7333, longitude: -71.4167 },
      { name: 'Quintero', latitude: -32.7833, longitude: -71.5167 },
      { name: 'Isla de Pascua', latitude: -27.1167, longitude: -109.3500 },
      { name: 'Juan Fernández', latitude: -33.6333, longitude: -78.8500 },
      { name: 'Puchuncaví', latitude: -32.7333, longitude: -71.4167 },
      { name: 'Quintero', latitude: -32.7833, longitude: -71.5167 },
      { name: 'Casablanca', latitude: -33.4000, longitude: -71.6167 },
      { name: 'Concón', latitude: -32.9500, longitude: -71.5500 }
    ]
  },
  {
    name: 'Región del Libertador General Bernardo O\'Higgins',
    comunas: [
      { name: 'Rancagua', latitude: -34.1708, longitude: -70.7444 },
      { name: 'Rancagua', latitude: -34.1708, longitude: -70.7444 },
      { name: 'San Fernando', latitude: -34.5833, longitude: -70.9500 }
    ]
  },
  {
    name: 'Región del Maule',
    comunas: [
      { name: 'Talca', latitude: -35.4264, longitude: -71.6554 },
      { name: 'Curicó', latitude: -34.9833, longitude: -70.7000 },
      { name: 'Linares', latitude: -35.8500, longitude: -71.5833 }
    ]
  },
  {
    name: 'Región del Ñuble',
    comunas: [
      { name: 'Chillán', latitude: -36.6069, longitude: -72.1034 },
      { name: 'Chillán Viejo', latitude: -36.5833, longitude: -72.1167 }
    ]
  },
  {
    name: 'Región del Biobío',
    comunas: [
      { name: 'Concepción', latitude: -36.8201, longitude: -73.0444 },
      { name: 'Talcahuano', latitude: -36.7167, longitude: -73.1167 },
      { name: 'Los Ángeles', latitude: -37.4667, longitude: -72.3500 }
    ]
  },
  {
    name: 'Región de La Araucanía',
    comunas: [
      { name: 'Temuco', latitude: -38.7359, longitude: -72.5904 },
      { name: 'Villarrica', latitude: -39.3167, longitude: -72.0833 }
    ]
  },
  {
    name: 'Región de Los Ríos',
    comunas: [
      { name: 'Valdivia', latitude: -39.8142, longitude: -73.2459 },
      { name: 'La Unión', latitude: -40.2333, longitude: -73.0833 }
    ]
  },
  {
    name: 'Región de Los Lagos',
    comunas: [
      { name: 'Puerto Montt', latitude: -41.4693, longitude: -72.9421 },
      { name: 'Puerto Varas', latitude: -41.3167, longitude: -73.0833 }
    ]
  },
  {
    name: 'Región de Aysén del General Carlos Ibáñez del Campo',
    comunas: [
      { name: 'Coyhaique', latitude: -45.5754, longitude: -72.0565 },
      { name: 'Puerto Aysén', latitude: -45.4167, longitude: -72.7000 }
    ]
  },
  {
    name: 'Región de Magallanes y de la Antártica Chilena',
    comunas: [
      { name: 'Punta Arenas', latitude: -53.1635, longitude: -70.9107 },
      { name: 'Puerto Natales', latitude: -51.7333, longitude: -72.4833 }
    ]
  },
  {
    name: 'Región Metropolitana de Santiago',
    comunas: [
      { name: 'Santiago', latitude: -33.4475, longitude: -70.6737 },
      { name: 'Puente Alto', latitude: -33.5926, longitude: -70.5804 },
      { name: 'La Florida', latitude: -33.5125, longitude: -70.5886 },
      { name: 'Maipú', latitude: -33.5064, longitude: -70.7825 },
      { name: 'San Bernardo', latitude: -33.5929, longitude: -70.7077 }
    ]
  }
];

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
