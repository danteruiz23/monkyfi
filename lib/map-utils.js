export function curvedPath(a, b, sign) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = Math.min(dist * 0.18, 60);
  const mx = (a.x + b.x) / 2 - (dy / dist) * offset * sign;
  const my = (a.y + b.y) / 2 + (dx / dist) * offset * sign;
  return `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
}

export const CITIES = [
  { name: 'Miami',        lon: -80.19,  lat: 25.76,  hub: true,  side: 'right' },
  { name: 'Ashburn',      lon: -77.49,  lat: 39.04,              side: 'right' },
  { name: 'New York',     lon: -74.00,  lat: 40.71,              side: 'left'  },
  { name: 'Los Angeles',  lon: -118.24, lat: 34.05,              side: 'right' },
  { name: 'Querétaro',    lon: -100.39, lat: 20.59,              side: 'left'  },
  { name: 'Mexico City',  lon: -99.13,  lat: 19.43,              side: 'left'  },
  { name: 'Panamá',       lon: -79.53,  lat: 8.97,               side: 'left'  },
  { name: 'San Juan',     lon: -66.10,  lat: 18.46,              side: 'right' },
  { name: 'Bogotá',       lon: -74.07,  lat: 4.71,               side: 'left'  },
  { name: 'Caracas',      lon: -66.90,  lat: 10.48,              side: 'right' },
  { name: 'Quito',        lon: -78.46,  lat: -0.18,              side: 'left'  },
  { name: 'Lima',         lon: -77.04,  lat: -12.04,             side: 'left'  },
  { name: 'Fortaleza',    lon: -38.54,  lat: -3.73,              side: 'right' },
  { name: 'Rio',          lon: -43.17,  lat: -22.91,             side: 'right' },
  { name: 'São Paulo',    lon: -46.63,  lat: -23.55,  major: true, side: 'right', latency: '112 ms' },
  { name: 'Santiago',     lon: -70.66,  lat: -33.45,             side: 'left'  },
  { name: 'Buenos Aires', lon: -58.38,  lat: -34.60,             side: 'right' },
];

export const CROSS_PAIRS = [
  ['Bogotá', 'São Paulo'],
  ['Mexico City', 'New York'],
  ['Lima', 'Buenos Aires'],
  ['Querétaro', 'Bogotá'],
  ['Caracas', 'Fortaleza'],
  ['Panamá', 'Lima'],
  ['San Juan', 'Caracas'],
  ['Quito', 'Santiago'],
  ['Rio', 'Buenos Aires'],
  ['Ashburn', 'São Paulo'],
];

export function findCity(name) {
  return CITIES.find(c => c.name === name);
}

export function getHubs() {
  return CITIES.filter(c => c.hub);
}

export function getNonHubs() {
  return CITIES.filter(c => !c.hub);
}
