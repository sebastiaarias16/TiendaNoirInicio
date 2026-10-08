const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const Product = require('../models/Product');

/**
 * NOIR Apparel â€” Script de inserciÃ³n segura de nuevos productos al catÃ¡logo.
 *
 * Reglas de seguridad:
 * 1. NO utiliza deleteMany, drop ni operaciones destructivas.
 * 2. NO modifica, sobreescribe ni altera los productos ya existentes en MongoDB.
 * 3. Valida la existencia fÃ­sica de cada imagen en disco antes de cualquier operaciÃ³n.
 * 4. Verifica si el producto ya existe por `nombre` antes de insertar (idempotente).
 * 5. Mantiene precio: 0, stock: 0 y featured: false para los productos nuevos segÃºn especificaciÃ³n.
 * 6. Cierra la conexiÃ³n de MongoDB al finalizar.
 */

const nuevosProductos = [
  {
    nombre: 'Camiseta Oversize',
    precio: 0,
    descripcion: 'Camiseta oversize NOIR para hombre con silueta relajada y corte streetwear contemporÃ¡neo. DiseÃ±ada para brindar comodidad y presencia dentro y fuera del entrenamiento.',
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
    descripcion: 'Camiseta tank NOIR para hombre con sisa amplia y corte ergonÃ³mico. DiseÃ±ada para optimizar el rango de movimiento y rendimiento en entrenamientos de alta intensidad.',
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
    descripcion: 'Buzo hoodie oversize NOIR para hombre con capota estructurada, bolsillo frontal y caÃ­da amplia. Una prenda esencial de estÃ©tica urbana y comodidad superior.',
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
    descripcion: 'Jogger deportivo NOIR para hombre con pretina elÃ¡stica ajustable y corte cÃ³nico funcional. DiseÃ±ado para ofrecer versatilidad y confort en movimiento.',
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
    descripcion: 'Bicicletero deportivo para mujer con pretina anatÃ³mica de tiro alto y ajuste ceÃ±ido. DiseÃ±ado para proporcionar soporte y libertad de movimiento en cada rutina.',
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
    descripcion: 'Top deportivo de manga larga para mujer con cuello ergonÃ³mico y ajuste anatÃ³mico al cuerpo. DiseÃ±ado para entrenamientos que demandan mÃ¡xima concentraciÃ³n y estilo.',
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
    descripcion: 'Conjunto coordinado NOIR Hoodie Oversize y Jogger. Silueta relajada y estÃ©tica minimalista para entrenar con presencia y vestir streetwear de alto impacto.',
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

const validarArchivosFisicos = () => {
  console.log('========================================================');
  console.log('1. VALIDACIÃ“N FÃSICA DE IMÃGENES EN DISCO');
  console.log('========================================================');
  const uploadsDir = path.resolve(__dirname, '..', 'uploads');
  let missingCount = 0;

  for (const prod of nuevosProductos) {
    console.log(`\nVerificando imÃ¡genes para: "${prod.nombre}"...`);
    for (const imgUrl of prod.imagen) {
      const rel = imgUrl.replace(/^\/uploads\//, '');
      const full = path.join(uploadsDir, rel);
      if (!fs.existsSync(full)) {
        console.error(`  âŒ [FALTANTE]: ${full}`);
        missingCount++;
      } else {
        console.log(`  âœ… [OK]: ${imgUrl}`);
      }
    }
  }

  if (missingCount > 0) {
    throw new Error(`Se detectaron ${missingCount} imÃ¡genes faltantes. OperaciÃ³n abortada.`);
  }

  console.log('\nâœ… Todas las imÃ¡genes requeridas estÃ¡n confirmadas en disco.\n');
};

const ejecutarInsercion = async () => {
  try {
    validarArchivosFisicos();

    console.log('========================================================');
    console.log('2. CONEXIÃ“N A MONGODB ATLAS');
    console.log('========================================================');
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no estÃ¡ definido en el archivo de entorno.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('âœ… ConexiÃ³n establecida a MongoDB Atlas.\n');

    const totalPrevio = await Product.countDocuments();
    console.log(`Cantidad previa de productos en MongoDB: ${totalPrevio}\n`);

    console.log('========================================================');
    console.log('3. EVALUACIÃ“N E INSERCIÃ“N CONTROLADA');
    console.log('========================================================');

    const insertados = [];
    const existentes = [];
    const errores = [];

    for (const prod of nuevosProductos) {
      try {
        const existe = await Product.findOne({ nombre: prod.nombre });
        if (existe) {
          console.log(`âš ï¸  [EXISTENTE] "${prod.nombre}" ya existe en BD (ID: ${existe._id}) â€” no se insertÃ³.`);
          existentes.push({
            id: existe._id,
            nombre: existe.nombre,
            precio: existe.precio,
            stock: existe.stock
          });
        } else {
          const nuevo = new Product(prod);
          await nuevo.save();
          console.log(`âœ¨ [INSERTADO] "${prod.nombre}" insertado exitosamente (ID: ${nuevo._id}).`);
          insertados.push({
            id: nuevo._id,
            nombre: nuevo.nombre,
            categoria: nuevo.categoria,
            precio: nuevo.precio,
            stock: nuevo.stock,
            imagen: nuevo.imagen
          });
        }
      } catch (err) {
        console.error(`âŒ [ERROR] FallÃ³ la inserciÃ³n de "${prod.nombre}":`, err.message);
        errores.push({ nombre: prod.nombre, error: err.message });
      }
    }

    console.log('\n========================================================');
    console.log('4. RESUMEN DE LA OPERACIÃ“N');
    console.log('========================================================');
    console.log(`Productos insertados: ${insertados.length}`);
    console.log(`Productos ya existentes: ${existentes.length}`);
    console.log(`Errores: ${errores.length}`);

    const totalFinal = await Product.countDocuments();
    console.log(`Cantidad total final de productos en MongoDB: ${totalFinal}`);

    console.log('\n========================================================');
    console.log('5. CONSULTA DE VERIFICACIÃ“N COMPLETA');
    console.log('========================================================');
    const todos = await Product.find({}).sort({ _id: 1 });
    todos.forEach((p, idx) => {
      console.log(`[#${idx + 1}] ID: ${p._id} | ${p.nombre} | Cat: ${p.categoria} | Precio: $${p.precio} | Stock: ${p.stock} | Img: ${p.imagen.length} archivos`);
    });

  } catch (error) {
    console.error('\nâŒ ERROR CRÃTICO:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('\nâœ… ConexiÃ³n con MongoDB cerrada ordenadamente.');
    }
  }
};

if (require.main === module) {
  ejecutarInsercion();
}

module.exports = { nuevosProductos, ejecutarInsercion };
