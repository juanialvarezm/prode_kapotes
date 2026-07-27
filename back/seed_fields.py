import os
from datetime import datetime
from init import app
from db import db
from models import FootballField

# Selected premium Unsplash images for soccer fields
images = [
    "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1575361204480-aadea2559ee2?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6edd1d2224?w=600&auto=format&fit=crop&q=80"
]

fields_data = [
    # CABA
    {
        "name": "Fútbol Vieytes",
        "address": "Av. Vieytes 1134, Barracas",
        "zone": "CABA",
        "phone": "+54 11 3444-2321",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios, Parrilla",
        "description": "Excelente complejo de fútbol 5 y 8 con césped de alta calidad en Barracas. Ideal para el tercer tiempo en su amplio buffet.",
        "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Fútbol Madero",
        "address": "Av. Alicia Moreau de Justo 989, Puerto Madero",
        "zone": "CABA",
        "phone": "+54 11 5432-8765",
        "field_types": "F5, F8, F11",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Bar, Parrilla, Vestuarios, Iluminación LED",
        "description": "Canchas con las mejores vistas de Puerto Madero. Estacionamiento privado y canchas de fútbol 11 profesionales.",
        "image_url": "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Grün FC Núñez",
        "address": "Padre Canavery 1351, Núñez",
        "zone": "CABA",
        "phone": "+54 11 8765-4321",
        "field_types": "F5, F8, F11",
        "surface": "Césped Sintético",
        "features": "Bar, Vestuarios, Iluminación LED, Seguridad",
        "description": "Complejo premium en Núñez al lado del CENARD con excelente drenaje y alfombras importadas de última generación.",
        "image_url": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Caballito Norte",
        "address": "Av. Avellaneda 1423, Caballito",
        "zone": "CABA",
        "phone": "+54 11 2345-6789",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Techado, Vestuarios, Buffet, Climatizado",
        "description": "Canchas techadas de gran categoría entre Nicasio Oroño y Biedma en Caballito, ideal para días de lluvia y torneos semanales.",
        "image_url": "https://images.unsplash.com/photo-1575361204480-aadea2559ee2?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Club Caballito",
        "address": "Av. Avellaneda 1423, Caballito",
        "zone": "CABA",
        "phone": "+54 11 2345-6789",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Techado, Vestuarios, Buffet, Climatizado",
        "description": "Gran club de fútbol en el corazón del barrio de Caballito, CABA.",
        "image_url": "https://images.unsplash.com/photo-1575361204480-aadea2559ee2?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Fútbol Retiro",
        "address": "Av. Ramos Mejía 1350, Retiro",
        "zone": "CABA",
        "phone": "+54 11 4567-8901",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Bar, Vestuarios, Parrilla",
        "description": "Canchas muy accesibles a metros de la terminal de Retiro. Excelente ambiente de fútbol amateur.",
        "image_url": "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Racket Club Palermo",
        "address": "Av. Valentín Alsina 1450, Palermo",
        "zone": "CABA",
        "phone": "+54 11 9876-5432",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Buffet, Seguridad, Gimnasio",
        "description": "Canchas de fútbol 5 de primer nivel dentro del prestigioso predio en los Bosques de Palermo.",
        "image_url": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Complejo Salguero Fútbol",
        "address": "Av. Rafael Obligado 1221, Costanera Norte",
        "zone": "CABA",
        "phone": "+54 11 4801-8757",
        "field_types": "F5, F6, F9",
        "surface": "Césped Sintético",
        "features": "Bar, Estacionamiento, Parrilla, Vestuarios, Eventos",
        "description": "El clásico complejo en Costa Salguero frente al río. Canchas excelentes y espectacular bar para el post-partido.",
        "image_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Doble Cinco Caballito",
        "address": "Doblas 1043, Caballito",
        "zone": "CABA",
        "phone": "+54 11 6677-8899",
        "field_types": "F5",
        "surface": "Cemento / Parquet",
        "features": "Techado, Vestuarios, Buffet, Climatizado",
        "description": "Ideal para futsal y fútbol rápido sobre superficie dura en una ubicación céntrica de Caballito.",
        "image_url": "https://images.unsplash.com/photo-1543351611-c82399575a20?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Club Harrods Gath & Chaves",
        "address": "Virrey del Pino 1480, Belgrano",
        "zone": "CABA",
        "phone": "+54 11 5544-3322",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Buffet, Vestuarios, Estacionamiento, Seguridad",
        "description": "Predio histórico en Belgrano. Canchas en un predio social muy familiar y arbolado.",
        "image_url": "https://images.unsplash.com/photo-1431324155629-1a6edd1d2224?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Parque Sarmiento Predio",
        "address": "Av. Dr. Ricardo Balbín 4750, Saavedra",
        "zone": "CABA",
        "phone": "+54 11 4547-0800",
        "field_types": "F5, F9, F11",
        "surface": "Césped Sintético / Natural",
        "features": "Estacionamiento, Parrillas, Buffet, Vestuarios",
        "description": "Espacio público con excelentes canchas de fútbol 11 de césped natural y sintético. Gran cantidad de parrillas libres.",
        "image_url": "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Complejo El Portón",
        "address": "O'Higgins 3487, Núñez",
        "zone": "CABA",
        "phone": "+54 11 4998-3321",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Parrilla, Vestuarios",
        "description": "Gran complejo de canchas techadas de césped sintético con excelente iluminación y bar amigable.",
        "image_url": "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "El Trébol de Parque Chacabuco",
        "address": "Emilio Mitre 985, Parque Chacabuco",
        "zone": "CABA",
        "phone": "+54 11 4921-2211",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Buffet, Vestuarios",
        "description": "Complejo de fácil acceso en Parque Chacabuco. Canchas protegidas del clima y excelente cantina.",
        "image_url": "https://images.unsplash.com/photo-1556816214-3d61168547df?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Pampa Fútbol Belgrano",
        "address": "Arribeños 1701, Belgrano",
        "zone": "CABA",
        "phone": "+54 11 4781-9988",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios, Eventos",
        "description": "A metros de la estación de tren Belgrano C, ideal para ir directo después de la oficina. Canchas de gran calidad.",
        "image_url": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "El Duende de Floresta",
        "address": "Av. Gaona 4660, Floresta",
        "zone": "CABA",
        "phone": "+54 11 4671-8822",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Parrilla",
        "description": "Complejo en el barrio de Floresta, ideal para grupos de amigos que buscan un post-partido con asado.",
        "image_url": "https://images.unsplash.com/photo-1628891890467-b79f2c8ba9dc?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Camp Nou Liniers",
        "address": "Roma 560, Liniers",
        "zone": "CABA",
        "phone": "+54 11 4642-1212",
        "field_types": "F5, F6, F8",
        "surface": "Césped Sintético",
        "features": "Bar, Parrilla, Estacionamiento, Vestuarios",
        "description": "Predio de grandes dimensiones para fútbol 8 y excelentes canchas rápidas de fútbol 5 en Liniers.",
        "image_url": "https://images.unsplash.com/photo-1524015368236-bdf6f7254216?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "La Esquina Fútbol",
        "address": "Av. San Martín 4500, Villa del Parque",
        "zone": "CABA",
        "phone": "+54 11 4501-1234",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios",
        "description": "Canchas cubiertas en una de las esquinas más tradicionales de Villa del Parque. Turnos todo el día.",
        "image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Locos por el Fútbol Belgrano",
        "address": "Moldes 2200, Belgrano",
        "zone": "CABA",
        "phone": "+54 11 4788-3434",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Vestuarios, Bar, Climatizado",
        "description": "Complejo deportivo con canchas rápidas de fútbol 5. Ubicado en el corazón residencial de Belgrano.",
        "image_url": "https://images.unsplash.com/photo-1600679472126-c695dd65db83?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "El Barrilete de Almagro",
        "address": "Guardia Vieja 3400, Almagro",
        "zone": "CABA",
        "phone": "+54 11 4861-1212",
        "field_types": "F5",
        "surface": "Cemento",
        "features": "Techado, Parrilla, Buffet",
        "description": "Especial para los amantes del fútbol de salón en cancha rápida de cemento. Con un buffet imperdible.",
        "image_url": "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Predio La Quemita (Huracán)",
        "address": "Av. Mariano Acosta 1981, Villa Soldati",
        "zone": "CABA",
        "phone": "+54 11 4611-3311",
        "field_types": "F8, F11",
        "surface": "Césped Natural / Sintético",
        "features": "Estacionamiento, Parrillas, Buffet, Vestuarios, Seguridad",
        "description": "Inmenso predio deportivo del Club Huracán habilitado para alquiler general. Excelentes campos de fútbol 11 profesionales.",
        "image_url": "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Solanas Fútbol Villa Urquiza",
        "address": "Av. Francisco Beiró 2835, Agronomía",
        "zone": "CABA",
        "phone": "+54 11 4504-3577",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Techado, Parrilla, Bar, Estacionamiento",
        "description": "Complejo emblemático con canchas techadas bien mantenidas, estacionamiento y una parrilla de gran nivel.",
        "image_url": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Complejo La Terraza Boedo",
        "address": "Castro 1224, Boedo",
        "zone": "CABA",
        "phone": "+54 11 4931-1122",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Vestuarios, Parrilla, Terraza al aire libre",
        "description": "Ubicado en el barrio de Boedo, jugar al fútbol aquí brinda una gran experiencia post-partido con parrilla e iluminación nocturna.",
        "image_url": "https://images.unsplash.com/photo-1510051640316-5b1275214227?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Club Sunderland Urquiza",
        "address": "Lugones 3161, Villa Urquiza",
        "zone": "CABA",
        "phone": "+54 11 4541-9922",
        "field_types": "F5",
        "surface": "Baldosa",
        "features": "Techado, Buffet, Vestuarios, Histórico",
        "description": "Una de las canchas de baldosas más veloces y emblemáticas de Buenos Aires. Para jugar con zapatillas de goma y tercer tiempo con milanesas.",
        "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Torneos y Complejo El Semillero",
        "address": "Av. Díaz Vélez 4100, Almagro",
        "zone": "CABA",
        "phone": "+54 11 4981-8822",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Vestuarios, Bar",
        "description": "Canchas cubiertas en el barrio de Almagro. Muy buena acústica e ideal para torneos amateurs.",
        "image_url": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Club 17 de Agosto Pueyrredón",
        "address": "Av. Albarellos 2935, Villa Pueyrredón",
        "zone": "CABA",
        "phone": "+54 11 4572-1200",
        "surface": "Parquet",
        "field_types": "F5",
        "features": "Techado, Buffet, Estacionamiento, Futsal Profesional",
        "description": "Cancha reglamentaria de parquet sobre la cual juega el equipo de Primera de Futsal AFA. Jugar aquí es como ser profesional.",
        "image_url": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "El Diego de San Telmo",
        "address": "Av. San Juan 500, San Telmo",
        "zone": "CABA",
        "phone": "+54 11 4361-2244",
        "field_types": "F5",
        "surface": "Cemento / Sintético",
        "features": "Techado, Bar, Vestuarios",
        "description": "Lugar típico e informal en el pintoresco San Telmo. Cuenta con canchas cubiertas y rápidas.",
        "image_url": "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Complejo Parque Patricios",
        "address": "Pepirí 135, Parque Patricios",
        "zone": "CABA",
        "phone": "+54 11 4911-3344",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Buffet, Vestuarios, Estacionamiento",
        "description": "Amplias instalaciones frente al parque. Vestuarios modernos y excelente buffet de comida casera.",
        "image_url": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Fútbol Palace Palermo",
        "address": "Av. Santa Fe 4200, Palermo",
        "zone": "CABA",
        "phone": "+54 11 4771-8833",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios, Climatizado",
        "description": "Complejo cerrado con ambiente climatizado en una ubicación inmejorable frente a Plaza Italia.",
        "image_url": "https://images.unsplash.com/photo-1575361204480-aadea2559ee2?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Complejo Open Gallo Abasto",
        "address": "Gallo 240, Abasto",
        "zone": "CABA",
        "phone": "+54 11 4861-3434",
        "field_types": "F5, F6",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios",
        "description": "Canchas muy cotizadas en la zona del Abasto. Cuentan con un excelente mantenimiento de redes y césped.",
        "image_url": "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "La Bombonerita Predio Boca",
        "address": "Brandsen 805, La Boca",
        "zone": "CABA",
        "phone": "+54 11 4309-4700",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Buffet, Estacionamiento, Seguridad, Museo Cercano",
        "description": "Alquiler de canchas a metros del mítico estadio Alberto J. Armando. Sentí la mística xeneize a pasos de la cancha.",
        "image_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Metegol Complejo Devoto",
        "address": "Av. Francisco Beiró 4200, Villa Devoto",
        "zone": "CABA",
        "phone": "+54 11 4501-7788",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Vestuarios, Bar, Parrilla",
        "description": "El complejo favorito de Villa Devoto. Canchas rápidas y protegidas con excelente bar post-partido.",
        "image_url": "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "El Galpón de Colegiales",
        "address": "Av. Elcano 3800, Colegiales",
        "zone": "CABA",
        "phone": "+54 11 4551-2233",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Buffet, Vestuarios",
        "description": "Espacio cerrado con gran altura de techo en Colegiales. Ideal para jugar cómodamente sin importar el clima.",
        "image_url": "https://images.unsplash.com/photo-1556816214-3d61168547df?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Fútbol Plaza Italia Palermo",
        "address": "Thames 2400, Palermo",
        "zone": "CABA",
        "phone": "+54 11 4772-1200",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Vestuarios, Buffet",
        "description": "Excelente iluminación y vestuarios limpios. Se encuentra a metros del subte D en Plaza Italia.",
        "image_url": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Complejo La Rosadita Monserrat",
        "address": "Av. Entre Ríos 1100, Monserrat",
        "zone": "CABA",
        "phone": "+54 11 4304-2233",
        "field_types": "F5",
        "surface": "Cemento / Baldosa",
        "features": "Techado, Buffet, Vestuarios",
        "description": "Canchas rápidas y cubiertas en pleno Monserrat. Tradicional complejo ideal para salir de la oficina directo a jugar.",
        "image_url": "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Complejo Estación Congreso",
        "address": "Av. Congreso 2300, Belgrano",
        "zone": "CABA",
        "phone": "+54 11 4781-1122",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Buffet, Vestuarios",
        "description": "Predio techado muy céntrico en Belgrano. Excelente césped sintético sin caucho que lastime.",
        "image_url": "https://images.unsplash.com/photo-1628891890467-b79f2c8ba9dc?w=800&auto=format&fit=crop&q=80"
    },

    # GBA NORTE
    {
        "name": "Doble 5 San Isidro",
        "address": "Gaetán Gutiérrez 857, San Isidro",
        "zone": "GBA Norte",
        "phone": "+54 11 4743-1221",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Bar, Vestuarios, Parrilla",
        "description": "Hermosas canchas con césped importado a pasos del centro de San Isidro. Amplio estacionamiento.",
        "image_url": "https://images.unsplash.com/photo-1524015368236-bdf6f7254216?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Punto Gol Vicente López",
        "address": "Carlos Francisco Melo 460, Vicente López",
        "zone": "GBA Norte",
        "phone": "+54 11 4791-3344",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Bar, Vestuarios",
        "description": "Canchas de rápido acceso en Vicente López y con buffet equipado con pantallas gigantes.",
        "image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Arena Vicente López",
        "address": "Carlos Francisco Melo 460, Vicente López",
        "zone": "GBA Norte",
        "phone": "+54 11 4791-3344",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Bar, Vestuarios",
        "description": "Complejo deportivo premium de fútbol en Vicente López, GBA Norte.",
        "image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "San Isidro Club (SIC) Predio",
        "address": "Av. Blanco Encalada 404, San Isidro",
        "zone": "GBA Norte",
        "phone": "+54 11 4766-2345",
        "field_types": "F7, F11",
        "surface": "Césped Natural",
        "features": "Estacionamiento, Vestuarios, Cantina del Club",
        "description": "Alquiler de canchas de fútbol 7 y 11 de césped natural dentro de la sede principal del San Isidro Club.",
        "image_url": "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Centro Asturiano Vicente López",
        "address": "Av. del Libertador 1081, Vicente López",
        "zone": "GBA Norte",
        "phone": "+54 11 4797-1234",
        "field_types": "F5, F7, F11",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Buffet, Vestuarios, Vista al Río",
        "description": "Canchas espectaculares en el Campo Covadonga a la vera del río en Vicente López. Fútbol 11 profesional sintético.",
        "image_url": "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tigre Fútbol Club Predio",
        "address": "Av. Liniers 2244, Victoria, Tigre",
        "zone": "GBA Norte",
        "phone": "+54 11 4749-3322",
        "field_types": "F5, F7, F9",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Buffet, Parrillas, Vestuarios",
        "description": "Predio inmenso en la zona turística de Tigre. Ofrece asadores para alquilar con amigos luego de los partidos.",
        "image_url": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Pilar Soccer Club",
        "address": "Panamericana Km 52, Pilar",
        "zone": "GBA Norte",
        "phone": "+54 11 2299-1122",
        "field_types": "F8, F11",
        "surface": "Césped Natural / Sintético",
        "features": "Estacionamiento, Parrillas, Vestuarios, Bar",
        "description": "Predio de entrenamiento profesional disponible para el alquiler corporativo o de grupos amateurs de fin de semana.",
        "image_url": "https://images.unsplash.com/photo-1510051640316-5b1275214227?w=800&auto=format&fit=crop&q=80"
    },

    # GBA SUR
    {
        "name": "Fútbol Total Avellaneda",
        "address": "9 de Julio 398, Avellaneda",
        "zone": "GBA Sur",
        "phone": "+54 11 4201-9988",
        "field_types": "F5, F6, F8",
        "surface": "Césped Sintético",
        "features": "Bar, Parrilla, Vestuarios, Estacionamiento",
        "description": "Canchas muy bien mantenidas en pleno centro de Avellaneda con parrillas listas para el clásico asado post-partido.",
        "image_url": "https://images.unsplash.com/photo-1600679472126-c695dd65db83?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "La Masía Lanús",
        "address": "Ramón Cabrero 2007, Lanús",
        "zone": "GBA Sur",
        "phone": "+54 11 4241-1122",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Parrilla, Bar, Vestuarios, Estacionamiento",
        "description": "Gran complejo de fútbol 5 y 7 dentro de las instalaciones deportivas en Lanús. Excelente ambiente.",
        "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Club Atlético Lanús Predio F5",
        "address": "Madariaga 900, Lanús",
        "zone": "GBA Sur",
        "phone": "+54 11 4357-1200",
        "field_types": "F5, F7, F11",
        "surface": "Césped Sintético / Natural",
        "features": "Estacionamiento, Buffet, Vestuarios, Seguridad",
        "description": "Canchas de alquiler oficial dentro del polideportivo de Lanús. Excelente calidad de mantenimiento y luminaria.",
        "image_url": "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Lomas Fútbol Complejo",
        "address": "Av. Las Heras 1512, Lomas de Zamora",
        "zone": "GBA Sur",
        "phone": "+54 11 4244-9988",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Bar, Vestuarios, Parrilla, Estacionamiento",
        "description": "Gran predio sobre la Av. Las Heras en Lomas de Zamora. Muy recomendado para campeonatos nocturnos y tercer tiempo.",
        "image_url": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Quilmes Predio Fútbol",
        "address": "Av. Vicente López 3186, Quilmes",
        "zone": "GBA Sur",
        "phone": "+54 11 4253-1200",
        "field_types": "F5, F7, F11",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Buffet, Vestuarios, Seguridad",
        "description": "Predio moderno con canchas de fútbol sintético para todas las edades. Alquiler diurno y nocturno.",
        "image_url": "https://images.unsplash.com/photo-1575361204480-aadea2559ee2?w=800&auto=format&fit=crop&q=80"
    },

    # GBA OESTE
    {
        "name": "Predio San Martín F5 y F7",
        "address": "Rodríguez Peña 3131, Villa Lynch, San Martín",
        "zone": "GBA Oeste",
        "phone": "+54 11 4754-3322",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios, Parrilla",
        "description": "Canchas de gran amortiguación y buena altura en Villa Lynch, ideales para torneos corporativos y partidos con amigos.",
        "image_url": "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Ramos Mejía Fútbol Club",
        "address": "Necochea 953, Ramos Mejía",
        "zone": "GBA Oeste",
        "phone": "+54 11 4658-2233",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios, Estacionamiento",
        "description": "Complejo muy concurrido en pleno Ramos Mejía entre Tacuarí y Alvarado. Excelente césped y muy buen buffet con minutas y cerveza fría.",
        "image_url": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Morón Predio Fútbol 5",
        "address": "Av. Eva Perón 2176, Morón",
        "zone": "GBA Oeste",
        "phone": "+54 11 4627-8899",
        "field_types": "F5, F6",
        "surface": "Césped Sintético",
        "features": "Bar, Parrilla, Vestuarios",
        "description": "Excelente predio en Morón sobre Av. Eva Perón. Ofrece torneos los fines de semana y alquiler por hora de lunes a lunes.",
        "image_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Ituzaingó Soccer Club",
        "address": "Intendente Carlos Ratti 1490, Ituzaingó",
        "zone": "GBA Oeste",
        "phone": "+54 11 4458-9900",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Parrillas, Buffet, Estacionamiento, Vestuarios",
        "description": "Complejo tranquilo con canchas bien iluminadas sobre Av. Ratti. Ideal para ir con la familia e iniciar el asado directo al finalizar.",
        "image_url": "https://images.unsplash.com/photo-1431324155629-1a6edd1d2224?w=800&auto=format&fit=crop&q=80"
    },
    {
        "name": "Castelar Fútbol 5",
        "address": "Pte. Sarmiento 3391, Castelar",
        "zone": "GBA Oeste",
        "phone": "+54 11 4629-1122",
        "field_types": "F5, F6",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios",
        "description": "Canchas cubiertas bien mantenidas en una zona residencial de Castelar con amplio estacionamiento y bar.",
        "image_url": "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&auto=format&fit=crop&q=80"
    }
]


def seed():
    print(f"Starting seeding of {len(fields_data)} football fields...")
    count_added = 0
    count_updated = 0
    for data in fields_data:
        existing = FootballField.query.filter_by(name=data["name"]).first()
        if existing:
            existing.address = data["address"]
            existing.zone = data["zone"]
            existing.phone = data["phone"]
            existing.field_types = data["field_types"]
            existing.surface = data["surface"]
            existing.features = data["features"]
            existing.description = data["description"]
            existing.image_url = data["image_url"]
            count_updated += 1
        else:
            field = FootballField(
                name=data["name"],
                address=data["address"],
                zone=data["zone"],
                phone=data["phone"],
                field_types=data["field_types"],
                surface=data["surface"],
                features=data["features"],
                image_url=data["image_url"],
                description=data["description"]
            )
            db.session.add(field)
            count_added += 1
    
    db.session.commit()
    print(f"Seeding completed. Added {count_added} new fields, updated {count_updated} existing fields.")

if __name__ == "__main__":
    with app.app_context():
        seed()
