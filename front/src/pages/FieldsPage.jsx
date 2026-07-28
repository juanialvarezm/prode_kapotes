import { useEffect, useState } from 'react';
import { getFootballFields } from '../api';
import { useSEO } from '../utils/useSEO';
import Breadcrumbs from '../components/Breadcrumbs';

const ZONES = ['Todos', 'CABA', 'GBA Norte', 'GBA Sur', 'GBA Oeste'];
const TYPES = ['Todos', 'F5', 'F7', 'F8', 'F11'];

const DEFAULT_FIELD_IMAGE = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80';

function cleanFieldName(name) {
  if (!name) return 'Camp Nou';
  let cleaned = name;
  ['Predio ', ' Predio', 'Arena ', ' Arena', 'Complejo ', ' Complejo', 'Torneos y Complejo '].forEach((word) => {
    cleaned = cleaned.replaceAll(word, '');
  });
  cleaned = cleaned.trim();
  if (!cleaned || ['arena', 'predio', 'complejo'].includes(cleaned.toLowerCase())) {
    return 'Camp Nou';
  }
  return cleaned;
}

const SPECIFIC_FIELD_IMAGES = {
  'Fútbol Vieytes': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
  'Fútbol Madero': 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80',
  'Grün FC Núñez': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80',
  'Caballito Norte': 'https://images.unsplash.com/photo-1575361204480-aadea2559ee2?w=800&auto=format&fit=crop&q=80',
  'Fútbol Retiro': 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop&q=80',
  'Racket Club Palermo': 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80',
  'Salguero Fútbol': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
  'Doble Cinco Caballito': 'https://images.unsplash.com/photo-1543351611-c82399575a20?w=800&auto=format&fit=crop&q=80',
  'Harrods Gath & Chaves': 'https://images.unsplash.com/photo-1431324155629-1a6edd1d2224?w=800&auto=format&fit=crop&q=80',
  'Parque Sarmiento': 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&auto=format&fit=crop&q=80',
  'El Portón': 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&auto=format&fit=crop&q=80',
  'El Trébol de Parque Chacabuco': 'https://images.unsplash.com/photo-1556816214-3d61168547df?w=800&auto=format&fit=crop&q=80',
  'Pampa Fútbol Belgrano': 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80',
  'El Duende de Floresta': 'https://images.unsplash.com/photo-1628891890467-b79f2c8ba9dc?w=800&auto=format&fit=crop&q=80',
  'Camp Nou Liniers': 'https://images.unsplash.com/photo-1524015368236-bdf6f7254216?w=800&auto=format&fit=crop&q=80',
  'La Esquina Fútbol': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80',
  'Locos por el Fútbol Belgrano': 'https://images.unsplash.com/photo-1600679472126-c695dd65db83?w=800&auto=format&fit=crop&q=80',
  'El Barrilete de Almagro': 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80',
  'La Quemita (Huracán)': 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&auto=format&fit=crop&q=80',
  'Solanas Fútbol Villa Urquiza': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
  'La Terraza Boedo': 'https://images.unsplash.com/photo-1510051640316-5b1275214227?w=800&auto=format&fit=crop&q=80',
  'Club Sunderland Urquiza': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
  'El Semillero': 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80',
  'Club 17 de Agosto Pueyrredón': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
  'El Diego de San Telmo': 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80',
  'Parque Patricios Fútbol': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80',
  'Fútbol Palace Palermo': 'https://images.unsplash.com/photo-1575361204480-aadea2559ee2?w=800&auto=format&fit=crop&q=80',
  'Open Gallo Abasto': 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop&q=80',
  'La Bombonerita Boca': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
  'Metegol Devoto': 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&auto=format&fit=crop&q=80',
  'El Galpón de Colegiales': 'https://images.unsplash.com/photo-1556816214-3d61168547df?w=800&auto=format&fit=crop&q=80',
  'Fútbol Plaza Italia Palermo': 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80',
  'La Rosadita Monserrat': 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80',
  'Estación Congreso': 'https://images.unsplash.com/photo-1628891890467-b79f2c8ba9dc?w=800&auto=format&fit=crop&q=80',
  'Doble 5 San Isidro': 'https://images.unsplash.com/photo-1524015368236-bdf6f7254216?w=800&auto=format&fit=crop&q=80',
  'Punto Gol Vicente López': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80',
  'San Isidro Club (SIC)': 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&auto=format&fit=crop&q=80',
  'Centro Asturiano Vicente López': 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&auto=format&fit=crop&q=80',
  'Tigre Fútbol Club': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
  'Pilar Soccer Club': 'https://images.unsplash.com/photo-1510051640316-5b1275214227?w=800&auto=format&fit=crop&q=80',
  'Fútbol Total Avellaneda': 'https://images.unsplash.com/photo-1600679472126-c695dd65db83?w=800&auto=format&fit=crop&q=80',
  'La Masía Lanús': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
  'Club Atlético Lanús F5': 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80',
  'Lomas Fútbol': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80',
  'Quilmes Fútbol': 'https://images.unsplash.com/photo-1575361204480-aadea2559ee2?w=800&auto=format&fit=crop&q=80',
  'San Martín F5 y F7': 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop&q=80',
  'Ramos Mejía Fútbol Club': 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80',
  'Morón Fútbol 5': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
  'Ituzaingó Soccer Club': 'https://images.unsplash.com/photo-1431324155629-1a6edd1d2224?w=800&auto=format&fit=crop&q=80',
  'Camp Nou': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80',
  'Castelar Fútbol 5': 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&auto=format&fit=crop&q=80'
};

function getFieldImageUrl(field) {
  const cleanName = cleanFieldName(field?.name);
  if (SPECIFIC_FIELD_IMAGES[cleanName]) {
    return SPECIFIC_FIELD_IMAGES[cleanName];
  }
  if (SPECIFIC_FIELD_IMAGES[field?.name]) {
    return SPECIFIC_FIELD_IMAGES[field.name];
  }
  return field?.image_url || DEFAULT_FIELD_IMAGE;
}

const SPECIFIC_FIELD_ADDRESSES = {
  'Camp Nou': 'Juan Zufriategui 2021, Florida, Vicente López',
  'Fútbol Vieytes': 'Av. Vieytes 1134, Barracas',
  'Fútbol Madero': 'Av. Alicia Moreau de Justo 989, Puerto Madero',
  'Grün FC Núñez': 'Padre Canavery 1351, Núñez',
  'Caballito Norte': 'Av. Avellaneda 1423, Caballito',
  'Fútbol Retiro': 'Av. Ramos Mejía 1350, Retiro',
  'Racket Club Palermo': 'Av. Valentín Alsina 1450, Palermo',
  'Salguero Fútbol': 'Av. Rafael Obligado 1221, Costanera Norte',
  'Doble Cinco Caballito': 'Doblas 1043, Caballito',
  'Harrods Gath & Chaves': 'Virrey del Pino 1480, Belgrano',
  'Parque Sarmiento': 'Av. Dr. Ricardo Balbín 4750, Saavedra',
  'El Portón': "O'Higgins 3487, Núñez",
  'El Trébol de Parque Chacabuco': 'Emilio Mitre 985, Parque Chacabuco',
  'Pampa Fútbol Belgrano': 'Arribeños 1701, Belgrano',
  'El Duende de Floresta': 'Av. Gaona 4660, Floresta',
  'Camp Nou Liniers': 'Roma 560, Liniers',
  'La Esquina Fútbol': 'Av. San Martín 4500, Villa del Parque',
  'Locos por el Fútbol Belgrano': 'Moldes 2200, Belgrano',
  'El Barrilete de Almagro': 'Guardia Vieja 3400, Almagro',
  'La Quemita (Huracán)': 'Av. Mariano Acosta 1981, Villa Soldati',
  'Solanas Fútbol Villa Urquiza': 'Av. Francisco Beiró 2835, Agronomía',
  'La Terraza Boedo': 'Castro 1224, Boedo',
  'Club Sunderland Urquiza': 'Lugones 3161, Villa Urquiza',
  'El Semillero': 'Av. Díaz Vélez 4100, Almagro',
  'Club 17 de Agosto Pueyrredón': 'Av. Albarellos 2935, Villa Pueyrredón',
  'El Diego de San Telmo': 'Av. San Juan 500, San Telmo',
  'Parque Patricios Fútbol': 'Pepirí 135, Parque Patricios',
  'Fútbol Palace Palermo': 'Av. Santa Fe 4200, Palermo',
  'Open Gallo Abasto': 'Gallo 240, Abasto',
  'La Bombonerita Boca': 'Brandsen 805, La Boca',
  'Metegol Devoto': 'Av. Francisco Beiró 4200, Villa Devoto',
  'El Galpón de Colegiales': 'Av. Elcano 3840, Colegiales',
  'Fútbol Plaza Italia Palermo': 'Thames 2400, Palermo',
  'La Rosadita Monserrat': 'Av. Entre Ríos 1100, Monserrat',
  'Estación Congreso': 'Av. Congreso 2300, Belgrano',
  'Doble 5 San Isidro': 'Gaetán Gutiérrez 857, San Isidro',
  'Punto Gol Vicente López': 'Carlos Francisco Melo 460, Vicente López',
  'San Isidro Club (SIC)': 'Av. Blanco Encalada 404, San Isidro',
  'Centro Asturiano Vicente López': 'Av. del Libertador 1081, Vicente López',
  'Tigre Fútbol Club': 'Av. Liniers 2244, Victoria, Tigre',
  'Pilar Soccer Club': 'Panamericana Km 52, Pilar',
  'Fútbol Total Avellaneda': '9 de Julio 398, Avellaneda',
  'La Masía Lanús': 'Ramón Cabrero 2007, Lanús',
  'Club Atlético Lanús F5': 'Madariaga 900, Lanús',
  'Lomas Fútbol': 'Av. Las Heras 1512, Lomas de Zamora',
  'Quilmes Fútbol': 'Av. Vicente López 3186, Quilmes',
  'San Martín F5 y F7': 'Rodríguez Peña 3131, Villa Lynch, San Martín',
  'Ramos Mejía Fútbol Club': 'Necochea 953, Ramos Mejía',
  'Morón Fútbol 5': 'Av. Eva Perón 2176, Morón',
  'Ituzaingó Soccer Club': 'Intendente Carlos Ratti 1490, Ituzaingó',
  'Castelar Fútbol 5': 'Pte. Sarmiento 3391, Castelar'
};

const OLD_ADDRESS_CORRECTIONS = [
  { match: 'San Martin 892', replace: 'Rodríguez Peña 3131, Villa Lynch, San Martín' },
  { match: 'San Martín 892', replace: 'Rodríguez Peña 3131, Villa Lynch, San Martín' },
  { match: 'Directorio', replace: 'Doblas 1043, Caballito' },
  { match: 'Crisólogo Larralde', replace: 'Padre Canavery 1351, Núñez' },
  { match: 'Elvira Rawson', replace: 'Av. Alicia Moreau de Justo 989, Puerto Madero' },
  { match: 'Mugica', replace: 'Av. Ramos Mejía 1350, Retiro' },
  { match: 'Asamblea', replace: 'Emilio Mitre 985, Parque Chacabuco' },
  { match: 'Pampa 1420', replace: 'Arribeños 1701, Belgrano' },
  { match: 'Juan B. Justo 7700', replace: 'Roma 560, Liniers' },
  { match: 'Triunvirato 4500', replace: 'Av. Francisco Beiró 2835, Agronomía' },
  { match: 'Boedo 800', replace: 'Castro 1224, Boedo' },
  { match: 'Libertador 15000', replace: 'Gaetán Gutiérrez 857, San Isidro' },
  { match: 'Maipú 1100', replace: 'Carlos Francisco Melo 460, Vicente López' },
  { match: 'Libertador 900', replace: 'Av. del Libertador 1081, Vicente López' },
  { match: 'Liniers 1200', replace: 'Av. Liniers 2244, Victoria, Tigre' },
  { match: 'Mitre 1200', replace: '9 de Julio 398, Avellaneda' },
  { match: 'Hipólito Yrigoyen 4500', replace: 'Ramón Cabrero 2007, Lanús' },
  { match: 'Alsina 1200', replace: 'Av. Las Heras 1512, Lomas de Zamora' },
  { match: 'Guido y Autopista', replace: 'Av. Vicente López 3186, Quilmes' },
  { match: '25 de Mayo 1200', replace: 'Rodríguez Peña 3131, Villa Lynch, San Martín' },
  { match: 'Rivadavia 14200', replace: 'Necochea 953, Ramos Mejía' },
  { match: 'Hipólito Yrigoyen 1200', replace: 'Av. Eva Perón 2176, Morón' },
  { match: 'Brandson 3200', replace: 'Intendente Carlos Ratti 1490, Ituzaingó' },
  { match: 'Arias 2300', replace: 'Pte. Sarmiento 3391, Castelar' }
];

function getFieldAddress(field) {
  if (!field) return '';
  const cleanName = cleanFieldName(field.name);
  if (SPECIFIC_FIELD_ADDRESSES[cleanName]) {
    return SPECIFIC_FIELD_ADDRESSES[cleanName];
  }
  if (SPECIFIC_FIELD_ADDRESSES[field.name]) {
    return SPECIFIC_FIELD_ADDRESSES[field.name];
  }
  const rawAddress = field.address || '';
  for (const corr of OLD_ADDRESS_CORRECTIONS) {
    if (rawAddress.includes(corr.match)) {
      return corr.replace;
    }
  }
  return rawAddress;
}

const SPECIFIC_FIELD_ZONES = {
  'Fútbol Vieytes': 'CABA',
  'Fútbol Madero': 'CABA',
  'Grün FC Núñez': 'CABA',
  'Caballito Norte': 'CABA',
  'Club Caballito': 'CABA',
  'Doble Cinco Caballito': 'CABA',
  'Fútbol Retiro': 'CABA',
  'Racket Club Palermo': 'CABA',
  'Complejo Salguero Fútbol': 'CABA',
  'Club Harrods Gath & Chaves': 'CABA',
  'Parque Sarmiento Predio': 'CABA',
  'Complejo El Portón': 'CABA',
  'El Trébol de Parque Chacabuco': 'CABA',
  'Pampa Fútbol Belgrano': 'CABA',
  'El Duende de Floresta': 'CABA',
  'Camp Nou Liniers': 'CABA',
  'La Esquina Fútbol': 'CABA',
  'Locos por el Fútbol Belgrano': 'CABA',
  'El Barrilete de Almagro': 'CABA',
  'Predio La Quemita (Huracán)': 'CABA',
  'Solanas Fútbol Villa Urquiza': 'CABA',
  'Complejo La Terraza Boedo': 'CABA',
  'Club Sunderland Urquiza': 'CABA',
  'Torneos y Complejo El Semillero': 'CABA',
  'Club 17 de Agosto Pueyrredón': 'CABA',
  'El Diego de San Telmo': 'CABA',
  'Complejo Parque Patricios': 'CABA',
  'Fútbol Palace Palermo': 'CABA',
  'Complejo Open Gallo Abasto': 'CABA',
  'La Bombonerita Predio Boca': 'CABA',
  'Metegol Complejo Devoto': 'CABA',
  'El Galpón de Colegiales': 'CABA',
  'Fútbol Plaza Italia Palermo': 'CABA',
  'Complejo La Rosadita Monserrat': 'CABA',
  'Complejo Estación Congreso': 'CABA',

  'Arena Vicente López': 'GBA Norte',
  'Punto Gol Vicente López': 'GBA Norte',
  'Doble 5 San Isidro': 'GBA Norte',
  'San Isidro Club (SIC) Predio': 'GBA Norte',
  'Centro Asturiano Vicente López': 'GBA Norte',
  'Tigre Fútbol Club Predio': 'GBA Norte',
  'Pilar Soccer Club': 'GBA Norte',

  'Fútbol Total Avellaneda': 'GBA Sur',
  'La Masía Lanús': 'GBA Sur',
  'Club Atlético Lanús Predio F5': 'GBA Sur',
  'Lomas Fútbol Complejo': 'GBA Sur',
  'Quilmes Predio Fútbol': 'GBA Sur',

  'Predio San Martín F5 y F7': 'GBA Oeste',
  'Ramos Mejía Fútbol Club': 'GBA Oeste',
  'Morón Predio Fútbol 5': 'GBA Oeste',
  'Ituzaingó Soccer Club': 'GBA Oeste',
  'Castelar Fútbol 5': 'GBA Oeste'
};

function getFieldZone(field) {
  if (!field) return '';
  if (SPECIFIC_FIELD_ZONES[field.name]) {
    return SPECIFIC_FIELD_ZONES[field.name];
  }
  const name = (field.name || '').toLowerCase();
  const address = (field.address || '').toLowerCase();

  if (name.includes('caballito') || address.includes('caballito')) return 'CABA';
  if (name.includes('vicente') || address.includes('vicente')) return 'GBA Norte';
  if (name.includes('san isidro') || address.includes('san isidro')) return 'GBA Norte';
  if (name.includes('tigre') || address.includes('tigre')) return 'GBA Norte';
  if (name.includes('pilar') || address.includes('pilar')) return 'GBA Norte';

  if (name.includes('lanús') || name.includes('lanus') || address.includes('lanús') || address.includes('lanus')) return 'GBA Sur';
  if (name.includes('avellaneda') || address.includes('avellaneda')) return 'GBA Sur';
  if (name.includes('lomas') || address.includes('lomas')) return 'GBA Sur';
  if (name.includes('quilmes') || address.includes('quilmes')) return 'GBA Sur';

  if (name.includes('san martín') || name.includes('san martin') || address.includes('san martín')) return 'GBA Oeste';
  if (name.includes('ramos') || address.includes('ramos')) return 'GBA Oeste';
  if (name.includes('morón') || name.includes('moron') || address.includes('morón')) return 'GBA Oeste';
  if (name.includes('ituzaingó') || name.includes('ituzaingo')) return 'GBA Oeste';
  if (name.includes('castelar') || address.includes('castelar')) return 'GBA Oeste';

  return field.zone || 'CABA';
}

export default function FieldsPage() {
  useSEO({
    title: 'Buscador de Canchas y Complejos de Fútbol Amateur',
    description: 'Encontrá canchas de fútbol 5, 7, 8 y 11 en CABA y GBA. Consultá teléfonos, direcciones, fotos y tipos de césped para reservar con tus amigos.',
    keywords: 'canchas futbol 5, alquiler canchas futbol, complejos deportivos futbol 5, canchas caba, canchas futbol sintetico',
    canonicalUrl: '/canchas',
  });

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Modal state
  const [selectedField, setSelectedField] = useState(null);

  const fetchFields = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    try {
      const filters = { page: pageNum, per_page: 12 };
      if (search) filters.q = search;
      if (selectedZone !== 'Todos') filters.zone = selectedZone;
      if (selectedType !== 'Todos') filters.type = selectedType;

      const res = await getFootballFields(filters);
      const data = res.data;

      if (append) {
        setFields((prev) => [...prev, ...data.fields]);
      } else {
        setFields(data.fields || []);
      }
      setHasMore(data.has_more || false);
      setTotal(data.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError('No se pudieron cargar los complejos deportivos.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch when filters change (with a minor debounce for search)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFields(1, false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedZone, selectedType]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFields(page + 1, true);
    }
  };

  const handleOpenGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address + ", Buenos Aires, Argentina");
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleWhatsApp = (phone, name) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hola, te consulto desde Prode Kapotes por disponibilidad para reservar en ${name}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}><span className="icon">🏟️</span> Canchas de Fútbol</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {total} complejos encontrados
        </span>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Filters Area */}
      <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            className="predictions-search-input"
            placeholder="Buscar por nombre de complejo o dirección..."
            style={{ width: '100%', paddingLeft: 40, height: '42px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Zone Filter Chips */}
        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: '600' }}>
            📍 Filtrar por Zona GBA / CABA
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ZONES.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`user-chip ${selectedZone === zone ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: selectedZone === zone ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                  color: selectedZone === zone ? '#000' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {zone === 'Todos' ? '👥 Todas' : zone}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter Chips */}
        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: '600' }}>
            ⚽ Tamaño de Cancha
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`user-chip ${selectedType === type ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: selectedType === type ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                  color: selectedType === type ? '#000' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {type === 'Todos' ? '🏃 Todos' : `Fútbol ${type.substring(1)}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: 12 }}>⏳</span>
          Cargando listado de canchas reales...
        </div>
      ) : fields.length === 0 ? (
        <div className="card empty-state" style={{ padding: 48 }}>
          <span className="empty-icon">🏟️</span>
          <p>No se encontraron complejos deportivos con los filtros aplicados.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20
          }}>
            {fields.map((f) => (
              <div
                key={f.id}
                className="card"
                onClick={() => setSelectedField(f)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: 0,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card-solid)',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  hover: {
                    transform: 'translateY(-4px)',
                    borderColor: 'var(--accent)',
                    boxShadow: 'var(--shadow-glow)'
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Complex Image */}
                <div style={{ height: 160, width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={getFieldImageUrl(f)}
                    alt={f.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_FIELD_IMAGE;
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid var(--border)',
                    color: 'var(--accent-light)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}>
                    📍 {getFieldZone(f)}
                  </span>
                </div>

                {/* Complex details */}
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{cleanFieldName(f.name)}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>📍</span> {getFieldAddress(f)}
                  </p>

                  {/* Badges types */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold-light)', border: '1px solid rgba(245,158,11,0.25)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      🥅 {f.field_types}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-light)', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      🌱 {f.surface}
                    </span>
                  </div>

                  {/* Features inline list */}
                  {f.features && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {f.features.split(',').slice(0, 3).map((feat, idx) => (
                        <span key={idx} style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          • {feat.trim()}
                        </span>
                      ))}
                      {f.features.split(',').length > 3 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          (+{f.features.split(',').length - 3})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              className="btn btn-primary"
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loadingMore ? (
                <>
                  <div className="match-detail-spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', margin: 0 }} />
                  Cargando más complejos...
                </>
              ) : (
                'Cargar más canchas 🏟️'
              )}
            </button>
          )}
        </div>
      )}

      {/* Details Modal overlay */}
      {selectedField && (
        <div
          onClick={() => setSelectedField(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{
              maxWidth: 550,
              width: '100%',
              overflow: 'hidden',
              padding: 0,
              position: 'relative',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border)',
              animation: 'modal-zoom 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Modal Header Image */}
            <div style={{ height: 220, width: '100%', overflow: 'hidden', position: 'relative' }}>
              <img
                src={getFieldImageUrl(selectedField)}
                alt={cleanFieldName(selectedField.name)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_FIELD_IMAGE;
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'linear-gradient(to top, rgba(10,15,26,0.95), transparent)',
                padding: '24px 20px 16px 20px'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  background: 'var(--accent)',
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  display: 'inline-block',
                  marginBottom: 6
                }}>
                  📍 {getFieldZone(selectedField)}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', fontWeight: '800' }}>{cleanFieldName(selectedField.name)}</h3>
              </div>
              {/* Close button */}
              <button
                onClick={() => setSelectedField(null)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  outline: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              {selectedField.description && (
                <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {selectedField.description}
                </p>
              )}

              {/* Details table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 2 }}>⚽ Canchas</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedField.field_types}</span>
                </div>
                <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 2 }}>🌱 Superficie</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedField.surface}</span>
                </div>
              </div>

              {/* Comodidades list */}
              {selectedField.features && (
                <div style={{ marginBottom: 20 }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: '600' }}>
                    🏢 Comodidades & Servicios
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedField.features.split(',').map((feat, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        ✔ {feat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulated Map Container */}
              <div
                onClick={() => handleOpenGoogleMaps(getFieldAddress(selectedField))}
                style={{
                  height: 90,
                  background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(10,15,26,0.9) 100%)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  marginBottom: 24,
                  padding: 10,
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: '1.2rem', marginBottom: 2 }}>🗺️</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-light)' }}>
                  Ver en Google Maps
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>
                  {getFieldAddress(selectedField)}
                </span>
              </div>

              {/* Call to actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                {selectedField.phone && (
                  <button
                    onClick={() => handleWhatsApp(selectedField.phone, selectedField.name)}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      margin: 0,
                      background: '#25D366',
                      color: '#000',
                      border: 'none',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <span>💬 WhatsApp</span>
                  </button>
                )}
                <button
                  onClick={() => window.open(`tel:${selectedField.phone}`)}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    margin: 0,
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>📞 Llamar: {selectedField.phone}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS injection for modal zoom */}
      <style>{`
        @keyframes modal-zoom {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
