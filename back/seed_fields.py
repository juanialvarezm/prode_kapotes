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
        "image_url": images[0]
    },
    {
        "name": "Fútbol Madero",
        "address": "Elvira Rawson de Dellepiane 340, Puerto Madero",
        "zone": "CABA",
        "phone": "+54 11 5432-8765",
        "field_types": "F5, F8, F11",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Bar, Parrilla, Vestuarios, Iluminación LED",
        "description": "Canchas con las mejores vistas de Puerto Madero. Estacionamiento privado y canchas de fútbol 11 profesionales.",
        "image_url": images[1]
    },
    {
        "name": "Grün FC Núñez",
        "address": "Av. Crisólogo Larralde 999, Núñez",
        "zone": "CABA",
        "phone": "+54 11 8765-4321",
        "field_types": "F5, F8, F11",
        "surface": "Césped Sintético",
        "features": "Bar, Vestuarios, Iluminación LED, Seguridad",
        "description": "Complejo premium en Núñez con excelente drenaje y alfombras importadas de última generación.",
        "image_url": images[2]
    },
    {
        "name": "Caballito Norte",
        "address": "Av. Avellaneda 1423, Caballito",
        "zone": "CABA",
        "phone": "+54 11 2345-6789",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Techado, Vestuarios, Buffet, Climatizado",
        "description": "Canchas techadas de gran categoría en Caballito, ideal para días de lluvia y torneos semanales.",
        "image_url": images[3]
    },
    {
        "name": "Fútbol Retiro",
        "address": "Padre Carlos Mugica 199, Retiro",
        "zone": "CABA",
        "phone": "+54 11 4567-8901",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Bar, Vestuarios, Parrilla",
        "description": "Canchas muy accesibles a metros de la terminal de Retiro. Excelente ambiente de fútbol amateur.",
        "image_url": images[4]
    },
    {
        "name": "Racket Club Palermo",
        "address": "Valentín Alsina 1450, Palermo",
        "zone": "CABA",
        "phone": "+54 11 9876-5432",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Buffet, Seguridad, Gimnasio",
        "description": "Canchas de fútbol 5 de primer nivel dentro del prestigioso predio de tenis y paddle de los Bosques de Palermo.",
        "image_url": images[5]
    },
    {
        "name": "Complejo Salguero Fútbol",
        "address": "Av. Rafael Obligado 1221, Costanera Norte",
        "zone": "CABA",
        "phone": "+54 11 3221-4321",
        "field_types": "F5, F6, F9",
        "surface": "Césped Sintético",
        "features": "Bar, Estacionamiento, Parrilla, Vestuarios, Eventos",
        "description": "El clásico complejo de Costanera Norte. Canchas excelentes y espectacular bar frente al río para el post-partido.",
        "image_url": images[0]
    },
    {
        "name": "Doble Cinco Caballito",
        "address": "Av. Directorio 450, Caballito",
        "zone": "CABA",
        "phone": "+54 11 6677-8899",
        "field_types": "F5",
        "surface": "Cemento / Parquet",
        "features": "Techado, Vestuarios, Buffet, Climatizado",
        "description": "Ideal para futsal y fútbol rápido sobre superficie dura en una ubicación céntrica de Caballito.",
        "image_url": images[1]
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
        "image_url": images[2]
    },
    {
        "name": "Parque Sarmiento Predio",
        "address": "Av. Dr. Ricardo Balbín 4750, Saavedra",
        "zone": "CABA",
        "phone": "+54 11 4547-0800",
        "field_types": "F5, F9, F11",
        "surface": "Césped Sintético / Natural",
        "features": "Estacionamiento, Parrillas, Buffet, Vestuarios",
        "description": "Espacio público concesionado con excelentes canchas de fútbol 11 de césped natural y sintético. Gran cantidad de parrillas libres.",
        "image_url": images[3]
    },
    {
        "name": "Complejo El Portón",
        "address": "Av. Congreso 5400, Villa Urquiza",
        "zone": "CABA",
        "phone": "+54 11 4998-3321",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Parrilla, Vestuarios",
        "description": "Las mejores canchas techadas de Villa Urquiza. Muy buena iluminación y bar amigable.",
        "image_url": images[4]
    },
    {
        "name": "El Trébol de Parque Chacabuco",
        "address": "Av. Asamblea 850, Parque Chacabuco",
        "zone": "CABA",
        "phone": "+54 11 4921-2211",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Buffet, Vestuarios",
        "description": "Complejo techado de fácil acceso en Parque Chacabuco. Canchas protegidas del clima y excelente cantina.",
        "image_url": images[5]
    },
    {
        "name": "Pampa Fútbol Belgrano",
        "address": "Pampa 1420, Belgrano",
        "zone": "CABA",
        "phone": "+54 11 4781-9988",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios, Eventos",
        "description": "A metros de la estación de tren Belgrano C, ideal para ir directo después de la oficina. Canchas techadas.",
        "image_url": images[0]
    },
    {
        "name": "El Duende de Floresta",
        "address": "Av. Gaona 4600, Floresta",
        "zone": "CABA",
        "phone": "+54 11 4671-8822",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Parrilla",
        "description": "Complejo en el barrio de Floresta, ideal para grupos de amigos que buscan un post-partido con asado.",
        "image_url": images[1]
    },
    {
        "name": "Camp Nou Liniers",
        "address": "Av. Juan B. Justo 7700, Liniers",
        "zone": "CABA",
        "phone": "+54 11 4642-1212",
        "field_types": "F5, F6, F8",
        "surface": "Césped Sintético",
        "features": "Bar, Parrilla, Estacionamiento, Vestuarios",
        "description": "Predio de dimensiones internacionales para fútbol 8 y excelentes canchas rápidas de fútbol 5.",
        "image_url": images[2]
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
        "image_url": images[3]
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
        "image_url": images[4]
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
        "image_url": images[5]
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
        "image_url": images[0]
    },
    {
        "name": "Solanas Fútbol Villa Urquiza",
        "address": "Av. Triunvirato 4500, Villa Urquiza",
        "zone": "CABA",
        "phone": "+54 11 4521-8899",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Techado, Parrilla, Bar, Estacionamiento",
        "description": "Complejo emblemático del barrio con canchas bien mantenidas y una parrilla de gran nivel.",
        "image_url": images[1]
    },
    {
        "name": "Complejo La Terraza Boedo",
        "address": "Av. Boedo 800, Boedo",
        "zone": "CABA",
        "phone": "+54 11 4931-1122",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Vestuarios, Parrilla, Terraza al aire libre",
        "description": "Ubicado en la terraza del club, jugar al fútbol aquí brinda una vista increíble de la ciudad. Muy buena iluminación nocturna.",
        "image_url": images[2]
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
        "image_url": images[3]
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
        "image_url": images[4]
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
        "image_url": images[5]
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
        "image_url": images[0]
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
        "image_url": images[1]
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
        "image_url": images[2]
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
        "image_url": images[3]
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
        "image_url": images[4]
    },
    {
        "name": "Metegol Complejo Devoto",
        "address": "Av. Beiró 4200, Villa Devoto",
        "zone": "CABA",
        "phone": "+54 11 4501-7788",
        "field_types": "F5",
        "surface": "Césped Sintético",
        "features": "Techado, Vestuarios, Bar, Parrilla",
        "description": "El complejo favorito de Villa Devoto. Canchas rápidas y protegidas con excelente bar post-partido.",
        "image_url": images[5]
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
        "image_url": images[0]
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
        "image_url": images[1]
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
        "image_url": images[2]
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
        "image_url": images[3]
    },

    # GBA NORTE
    {
        "name": "Doble 5 San Isidro",
        "address": "Av. del Libertador 15000, San Isidro",
        "zone": "GBA Norte",
        "phone": "+54 11 4743-1221",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Bar, Vestuarios, Parrilla",
        "description": "Hermosas canchas con césped importado a pasos del centro de San Isidro. Amplio estacionamiento.",
        "image_url": images[4]
    },
    {
        "name": "Punto Gol Vicente López",
        "address": "Av. Maipú 1100, Vicente López",
        "zone": "GBA Norte",
        "phone": "+54 11 4791-3344",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Bar, Vestuarios",
        "description": "Canchas sobre la Avenida Maipú en Vicente López, de rápido acceso y con buffet equipado con pantallas gigantes.",
        "image_url": images[5]
    },
    {
        "name": "San Isidro Club (SIC) Predio",
        "address": "Blanco Encalada 404, San Isidro",
        "zone": "GBA Norte",
        "phone": "+54 11 4766-2345",
        "field_types": "F7, F11",
        "surface": "Césped Natural",
        "features": "Estacionamiento, Vestuarios, Cantina del Club",
        "description": "Alquiler de canchas de fútbol 7 y 11 de césped natural dentro del anexo del San Isidro Club.",
        "image_url": images[0]
    },
    {
        "name": "Centro Asturiano Vicente López",
        "address": "Av. del Libertador 900, Vicente López",
        "zone": "GBA Norte",
        "phone": "+54 11 4797-1234",
        "field_types": "F5, F7, F11",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Buffet, Vestuarios, Vista al Río",
        "description": "Canchas espectaculares a la vera del río en Vicente López. Fútbol 11 profesional sintético.",
        "image_url": images[1]
    },
    {
        "name": "Tigre Fútbol Club Predio",
        "address": "Av. Liniers 1200, Tigre",
        "zone": "GBA Norte",
        "phone": "+54 11 4749-3322",
        "field_types": "F5, F7, F9",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Buffet, Parrillas, Vestuarios",
        "description": "Predio inmenso en la zona turística de Tigre. Ofrece asadores para alquilar con amigos luego de los partidos.",
        "image_url": images[2]
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
        "image_url": images[3]
    },

    # GBA SUR
    {
        "name": "Fútbol Total Avellaneda",
        "address": "Av. Mitre 1200, Avellaneda",
        "zone": "GBA Sur",
        "phone": "+54 11 4201-9988",
        "field_types": "F5, F6, F8",
        "surface": "Césped Sintético",
        "features": "Bar, Parrilla, Vestuarios, Estacionamiento",
        "description": "Canchas muy bien mantenidas con parrillas listas para el clásico asado post-partido en Avellaneda.",
        "image_url": images[4]
    },
    {
        "name": "La Masía Lanús",
        "address": "Av. Hipólito Yrigoyen 4500, Lanús",
        "zone": "GBA Sur",
        "phone": "+54 11 4241-1122",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Parrilla, Bar, Vestuarios, Estacionamiento",
        "description": "El complejo de fútbol 5 y 7 por excelencia en Lanús Oeste. Gran ambiente los fines de semana.",
        "image_url": images[5]
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
        "image_url": images[0]
    },
    {
        "name": "Lomas Fútbol Complejo",
        "address": "Av. Alsina 1200, Lomas de Zamora",
        "zone": "GBA Sur",
        "phone": "+54 11 4244-9988",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Bar, Vestuarios, Parrilla, Estacionamiento",
        "description": "Ubicado a metros de la avenida Alsina en Lomas. Muy recomendado para campeonatos nocturnos.",
        "image_url": images[1]
    },
    {
        "name": "Quilmes Predio Fútbol",
        "address": "Guido y Autopista, Quilmes",
        "zone": "GBA Sur",
        "phone": "+54 11 4253-1200",
        "field_types": "F5, F7, F11",
        "surface": "Césped Sintético",
        "features": "Estacionamiento, Buffet, Vestuarios, Seguridad",
        "description": "Predio moderno con canchas de fútbol sintético para todas las edades. Cuenta con escuela infantil y alquiler nocturno.",
        "image_url": images[2]
    },

    # GBA OESTE
    {
        "name": "Predio San Martín F5 y F7",
        "address": "Av. 25 de Mayo 1200, San Martín",
        "zone": "GBA Oeste",
        "phone": "+54 11 4754-3322",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios, Parrilla",
        "description": "Canchas de gran amortiguación y buena altura en el partido de San Martín, ideales para torneos corporativos.",
        "image_url": images[3]
    },
    {
        "name": "Ramos Mejía Fútbol Club",
        "address": "Av. Rivadavia 14200, Ramos Mejía",
        "zone": "GBA Oeste",
        "phone": "+54 11 4658-2233",
        "field_types": "F5, F8",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios, Estacionamiento",
        "description": "Complejo muy concurrido en pleno Ramos Mejía. Excelente césped y muy buen buffet con minutas y cerveza fría.",
        "image_url": images[4]
    },
    {
        "name": "Morón Predio Fútbol 5",
        "address": "Av. Hipólito Yrigoyen 1200, Morón",
        "zone": "GBA Oeste",
        "phone": "+54 11 4627-8899",
        "field_types": "F5, F6",
        "surface": "Césped Sintético",
        "features": "Bar, Parrilla, Vestuarios",
        "description": "Muy cercano a la estación de Morón. Ofrece torneos los fines de semana y alquiler por hora de lunes a lunes.",
        "image_url": images[5]
    },
    {
        "name": "Ituzaingó Soccer Club",
        "address": "Brandson 3200, Ituzaingó",
        "zone": "GBA Oeste",
        "phone": "+54 11 4458-9900",
        "field_types": "F5, F7",
        "surface": "Césped Sintético",
        "features": "Parrillas, Buffet, Estacionamiento, Vestuarios",
        "description": "Complejo tranquilo con mucho verde alrededor. Ideal para ir con la familia e iniciar el asado directo al finalizar.",
        "image_url": images[0]
    },
    {
        "name": "Castelar Fútbol 5",
        "address": "Av. Arias 2300, Castelar",
        "zone": "GBA Oeste",
        "phone": "+54 11 4629-1122",
        "field_types": "F5, F6",
        "surface": "Césped Sintético",
        "features": "Techado, Bar, Vestuarios",
        "description": "Canchas cubiertas bien mantenidas en una zona residencial de Castelar con fácil estacionamiento.",
        "image_url": images[1]
    }
]

# Programmatic generation of 100 extra fields to reach 150 total fields
import random
random.seed(42)

extra_names_prefixes = ["Complejo", "Fútbol", "Predio", "Club", "Arena", "La Canchita de", "Punto Gol", "Estación", "El Portón de", "Marangoni", "Doble Cinco", "La Catedral de"]
extra_names_suffixes = ["Madero", "Palermo", "Belgrano", "Caballito", "San Isidro", "Vicente López", "Lanús", "Avellaneda", "Morón", "Ramos", "Devoto", "Urquiza", "Flores", "San Martín", "Quilmes", "Lomas", "Banfield", "Tigre", "Olivos", "Pilar", "Caseros", "San Miguel", "Moreno", "Haedo", "San Justo", "Escobar"]

streets = ["Av. del Libertador", "Av. Rivadavia", "Av. Santa Fe", "Av. Cabildo", "Av. San Martín", "Av. Juan B. Justo", "Av. Corrientes", "Av. Córdoba", "Av. Triunvirato", "Av. de Mayo", "Av. Belgrano", "Av. Callao", "Av. Entre Ríos", "Av. Directorio", "Av. Asamblea", "Av. Beiró", "Av. Mitre", "Av. Hipólito Yrigoyen", "Calle Florida", "Calle San Martín", "Calle Paraná", "Calle Chacabuco", "Calle Maipú"]

zones_list = ["CABA", "GBA Norte", "GBA Sur", "GBA Oeste"]
surfaces_list = ["Césped Sintético", "Césped Natural", "Parquet", "Cemento"]
field_types_list = ["F5", "F5, F7", "F5, F8", "F7, F9", "F8, F11", "F5, F7, F11"]

features_pool = ["Techado", "Bar", "Vestuarios", "Parrilla", "Estacionamiento", "Iluminación LED", "Seguridad", "Wifi", "Cafetería", "Pantallas Gigantes", "Duchas", "Tribuna"]

generated = 0
used_combos = set()

while generated < 100:
    prefix = random.choice(extra_names_prefixes)
    suffix = random.choice(extra_names_suffixes)
    name = f"{prefix} {suffix}"
    
    # Avoid duplicate name
    if name in [f["name"] for f in fields_data] or name in used_combos:
        continue
        
    used_combos.add(name)
    
    zone = random.choice(zones_list)
    street = random.choice(streets)
    number = random.randint(100, 6500)
    address = f"{street} {number}, {suffix}"
    
    phone = f"+54 11 {random.randint(4000, 4999)}-{random.randint(1000, 9999)}"
    field_types = random.choice(field_types_list)
    surface = random.choice(surfaces_list)
    
    num_features = random.randint(3, 5)
    selected_features = ", ".join(random.sample(features_pool, num_features))
    
    image_url = random.choice(images)
    description = f"Vení a jugar al fútbol en {name}. Contamos con excelentes canchas de {surface} y todos los servicios para tu grupo de amigos."
    
    fields_data.append({
        "name": name,
        "address": address,
        "zone": zone,
        "phone": phone,
        "field_types": field_types,
        "surface": surface,
        "features": selected_features,
        "description": description,
        "image_url": image_url
    })
    generated += 1


def seed():
    print(f"Starting seeding of {len(fields_data)} football fields...")
    count_added = 0
    for data in fields_data:
        existing = FootballField.query.filter_by(name=data["name"], address=data["address"]).first()
        if not existing:
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
    print(f"Seeding completed. Added {count_added} new fields.")

if __name__ == "__main__":
    with app.app_context():
        seed()
