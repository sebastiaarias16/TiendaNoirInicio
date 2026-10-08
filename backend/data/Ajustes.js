/**
 * NOIR Apparel — Catálogo oficial de referencia y datos semilla.
 * 
 * NOTA DE SEGURIDAD:
 * Este archivo es exclusivamente una fuente de datos/exportación estática.
 * No ejecuta operaciones de conexión ni mutación sobre MongoDB.
 * Para migraciones controladas de catálogo, utilizar scripts quirúrgicos dedicados.
 */

const productos = [
  {
    nombre: 'Camiseta Hombre',
    precio: 89900,
    descripcion: 'Camiseta deportiva y urbana NOIR con corte regular premium y tela de alto rendimiento.',
    stock: 10,
    categoria: 'Camiseta',
    imagen: [
      '/uploads/productos/hombre/camiseta/Camisa_Frontal1.jpg',
      '/uploads/productos/hombre/camiseta/Camisa_Posterior1.jpg',
      '/uploads/productos/hombre/camiseta/Catalogo_Colorways_de_Camisetas1.png'
    ],
    tallas: ['M', 'L'],
    colores: ['Negro'],
    featured: true
  },
  {
    nombre: 'Pantaloneta Hombre',
    precio: 89900,
    descripcion: 'Pantaloneta deportiva NOIR de alta resistencia y secado rápido para entrenamiento y streetwear.',
    stock: 9,
    categoria: 'Pantaloneta',
    imagen: [
      '/uploads/productos/hombre/pantaloneta/pantaloneta_frontal1.jpg',
      '/uploads/productos/hombre/pantaloneta/pantaloneta_posterior1.jpg',
      '/uploads/productos/hombre/pantaloneta/Catalogo_Pantalonetas_deportivas1.png'
    ],
    tallas: ['M', 'L'],
    colores: ['Negro'],
    featured: true
  },
  {
    nombre: 'Short Mujer',
    precio: 84900,
    descripcion: 'Short deportivo para mujer con compresión suave, tiro alto y control abdominal.',
    stock: 15,
    categoria: 'Short',
    imagen: [
      '/uploads/productos/mujer/short/Frontal_Short1.jpg',
      '/uploads/productos/mujer/short/Posterior_Short1.jpg'
    ],
    tallas: ['S', 'M'],
    colores: ['Negro', 'Blanco', 'Rojo'],
    featured: false
  },
  {
    nombre: 'Top Mujer',
    precio: 79900,
    descripcion: 'Top deportivo NOIR con soporte firme, tirantes reforzados y diseño ergonómico.',
    stock: 10,
    categoria: 'Top',
    imagen: [
      '/uploads/productos/mujer/top_deportivo/Frontal_Top1.jpg',
      '/uploads/productos/mujer/top_deportivo/Posterior_Top1.jpg'
    ],
    tallas: ['S', 'M'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'leggins Mujer',
    precio: 119900,
    descripcion: 'Leggins deportivos de alto rendimiento con pretina anatómica, control de figura y tejido opaco premium.',
    stock: 10,
    categoria: 'leggins',
    imagen: [
      '/uploads/productos/mujer/leggings/legguins_Frontal1.jpg',
      '/uploads/productos/mujer/leggings/legguins_Posterior1.jpg',
      '/uploads/productos/mujer/leggings/Catalogo_legguins1.png'
    ],
    tallas: ['S', 'M'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'Conjunto Camiseta y Pantaloneta',
    precio: 149900,
    descripcion: 'Conjunto coordinado NOIR Camiseta y Pantaloneta. Máxima transpirabilidad y estilo urbano para entrenamiento.',
    stock: 9,
    categoria: 'Conjunto',
    imagen: [
      '/uploads/productos/conjuntos/Conjunto_Hombre_Camisa_Pantaloneta.jpg'
    ],
    tallas: ['S', 'M'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'Conjunto Top y Leggins',
    precio: 169900,
    descripcion: 'Conjunto coordinado NOIR Top y Leggins. Ajuste anatómico y confección premium para alto rendimiento.',
    stock: 10,
    categoria: 'Conjunto',
    imagen: [
      '/uploads/productos/conjuntos/Conjunto_Mujer_TopMangaLarga_Legguins.jpg'
    ],
    tallas: ['S', 'M'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'Camiseta Oversize',
    precio: 0,
    descripcion: 'Camiseta oversize NOIR para hombre con silueta relajada y corte streetwear contemporáneo. Diseñada para brindar comodidad y presencia dentro y fuera del entrenamiento.',
    stock: 0,
    categoria: 'Camiseta',
    imagen: [
      '/uploads/productos/hombre/camisa_oversize/Camisa_Overzise_Frontal_posterior1.jpg',
      '/uploads/productos/hombre/camisa_oversize/Catalogo_camisetas_overzise1.png'
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'Camiseta Tank',
    precio: 0,
    descripcion: 'Camiseta tank NOIR para hombre con sisa amplia y corte ergonómico. Diseñada para optimizar el rango de movimiento y rendimiento en entrenamientos de alta intensidad.',
    stock: 0,
    categoria: 'Camiseta',
    imagen: [
      '/uploads/productos/hombre/camisa_tank/FontralTank1.jpg',
      '/uploads/productos/hombre/camisa_tank/PosteriorTank1.jpg',
      '/uploads/productos/hombre/camisa_tank/Catalogo_de_camisetas_tank1.png'
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'Hoodie Oversize',
    precio: 0,
    descripcion: 'Buzo hoodie oversize NOIR para hombre con capota estructurada, bolsillo frontal y caída amplia. Una prenda esencial de estética urbana y comodidad superior.',
    stock: 0,
    categoria: 'Hoodie',
    imagen: [
      '/uploads/productos/hombre/hoodis/Hoodi_Overzise_Frontal1.jpg',
      '/uploads/productos/hombre/hoodis/Hoodi_Overzise_Posterior1.jpg'
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'Jogger',
    precio: 0,
    descripcion: 'Jogger deportivo NOIR para hombre con pretina elástica ajustable y corte cónico funcional. Diseñado para ofrecer versatilidad y confort en movimiento.',
    stock: 0,
    categoria: 'Jogger',
    imagen: [
      '/uploads/productos/hombre/jogger/Jogger_Frontal1.jpg',
      '/uploads/productos/hombre/jogger/Jogger_Posterior1.jpg'
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'Bicicletero Mujer',
    precio: 0,
    descripcion: 'Bicicletero deportivo para mujer con pretina anatómica de tiro alto y ajuste ceñido. Diseñado para proporcionar soporte y libertad de movimiento en cada rutina.',
    stock: 0,
    categoria: 'Bicicletero',
    imagen: [
      '/uploads/productos/mujer/bicicletero/Frontal_Bicicletero_Mujer1.jpg',
      '/uploads/productos/mujer/bicicletero/Posterior_Bicicletero_Mujer1.jpg'
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'Top Manga Larga Mujer',
    precio: 0,
    descripcion: 'Top deportivo de manga larga para mujer con cuello ergonómico y ajuste anatómico al cuerpo. Diseñado para entrenamientos que demandan máxima concentración y estilo.',
    stock: 0,
    categoria: 'Top',
    imagen: [
      '/uploads/productos/mujer/top_manga_larga/Frontal_Manga_larga_Top_1.jpg',
      '/uploads/productos/mujer/top_manga_larga/Posterior_Manga_Larga_Top_1.jpg',
      '/uploads/productos/mujer/top_manga_larga/Catalogo_Manga_larga_Top_1.png'
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro'],
    featured: false
  },
  {
    nombre: 'Conjunto Hoodie Oversize + Jogger',
    precio: 0,
    descripcion: 'Conjunto coordinado NOIR Hoodie Oversize y Jogger. Silueta relajada y estética minimalista para entrenar con presencia y vestir streetwear de alto impacto.',
    stock: 0,
    categoria: 'Conjunto',
    imagen: [
      '/uploads/productos/conjuntos/Conjunto_Overzise_Hoddi_Jogger.jpg'
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro'],
    featured: false
  }
];

module.exports = { productos };