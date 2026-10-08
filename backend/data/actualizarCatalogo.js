const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Product = require('../models/Product');

/**
 * Script de migración y asociación definitiva de imágenes para NOIR Apparel.
 * 
 * Reglas estrictas:
 * 1. Actualiza EXCLUSIVAMENTE el array `imagen`.
 * 2. NO modifica precio, stock, descripción, categoría, tallas, colores, featured ni _id.
 * 3. Valida previamente que cada archivo exista físicamente en disco antes de tocar MongoDB.
 * 4. Imprime backup del estado previo de las imágenes.
 * 5. Idempotente y seguro: no usa deleteMany, deleteOne, drop ni upsert.
 */

// Resolución dinámica de la variante ortográfica física en disco (Legguins vs Leggins)
const conjuntoMujerFilename = fs.existsSync(
  path.resolve(__dirname, '..', 'uploads', 'productos', 'conjuntos', 'Conjunto_Mujer_TopMangaLarga_Leggins.jpg')
)
  ? 'Conjunto_Mujer_TopMangaLarga_Leggins.jpg'
  : 'Conjunto_Mujer_TopMangaLarga_Legguins.jpg';

const imageMappings = [
  {
    _id: '680fe18a43f54cff5f642330',
    nombre: 'Camiseta Hombre',
    imagen: [
      '/uploads/productos/hombre/camiseta/Camisa_Frontal1.jpg',
      '/uploads/productos/hombre/camiseta/Camisa_Posterior1.jpg',
      '/uploads/productos/hombre/camiseta/Catalogo_Colorways_de_Camisetas1.png'
    ]
  },
  {
    _id: '680fe18a43f54cff5f642331',
    nombre: 'Pantaloneta Hombre',
    imagen: [
      '/uploads/productos/hombre/pantaloneta/pantaloneta_frontal1.jpg',
      '/uploads/productos/hombre/pantaloneta/pantaloneta_posterior1.jpg',
      '/uploads/productos/hombre/pantaloneta/Catalogo_Pantalonetas_deportivas1.png'
    ]
  },
  {
    _id: '680fe18a43f54cff5f642332',
    nombre: 'Short Mujer',
    imagen: [
      '/uploads/productos/mujer/short/Frontal_Short1.jpg',
      '/uploads/productos/mujer/short/Posterior_Short1.jpg'
    ]
  },
  {
    _id: '680fe18a43f54cff5f642333',
    nombre: 'Top Mujer',
    imagen: [
      '/uploads/productos/mujer/top_deportivo/Frontal_Top1.jpg',
      '/uploads/productos/mujer/top_deportivo/Posterior_Top1.jpg'
    ]
  },
  {
    _id: '680fe18a43f54cff5f642334',
    nombre: 'Leggins Mujer',
    imagen: [
      '/uploads/productos/mujer/leggings/legguins_Frontal1.jpg',
      '/uploads/productos/mujer/leggings/legguins_Posterior1.jpg',
      '/uploads/productos/mujer/leggings/Catalogo_legguins1.png'
    ]
  },
  {
    _id: '680fe18a43f54cff5f642336',
    nombre: 'Conjunto Camiseta y Pantaloneta',
    imagen: [
      '/uploads/productos/conjuntos/Conjunto_Hombre_Camisa_Pantaloneta.jpg'
    ]
  },
  {
    _id: '680fe18a43f54cff5f642335',
    nombre: 'Conjunto Top y Leggins',
    imagen: [
      `/uploads/productos/conjuntos/${conjuntoMujerFilename}`
    ]
  }
];

const validarArchivosFisicos = () => {
  console.log('[INFO] Validando existencia física de imágenes en disco...');
  let errorCount = 0;

  for (const item of imageMappings) {
    for (const imgUrl of item.imagen) {
      const relativePath = imgUrl.replace(/^\/uploads\//, '');
      const fullPath = path.resolve(__dirname, '..', 'uploads', relativePath);

      if (!fs.existsSync(fullPath)) {
        console.error(`[ERROR] ARCHIVO FALTANTE para "${item.nombre}": ${fullPath}`);
        errorCount++;
      } else {
        console.log(`[OK] ${imgUrl}`);
      }
    }
  }

  if (errorCount > 0) {
    throw new Error(`Se detectaron ${errorCount} archivos faltantes. Abortando actualización.`);
  }

  console.log('[OK] Todas las imágenes requeridas existen físicamente en disco.\n');
};

const ejecutarMigracionImagenes = async () => {
  try {
    // 1. Validar archivos en disco
    validarArchivosFisicos();

    // 2. Conectar a MongoDB Atlas
    console.log('[INFO] Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[OK] Conexión establecida a MongoDB.\n');

    // 3. Backup / Consulta de estado previo
    console.log('[BACKUP] Estado previo de imágenes en Base de Datos:');
    for (const item of imageMappings) {
      const actual = await Product.findById(item._id).lean();
      if (actual) {
        console.log(`- [${actual._id}] "${actual.nombre}": ${JSON.stringify(actual.imagen)}`);
      } else {
        console.warn(`[WARN] Producto con ID ${item._id} no encontrado en BD.`);
      }
    }
    console.log('');

    // 4. Actualización quirúrgica exclusiva de `imagen`
    console.log('[INFO] Aplicando actualización quirúrgica de imágenes...');
    for (const item of imageMappings) {
      const updated = await Product.findByIdAndUpdate(
        item._id,
        {
          $set: {
            imagen: item.imagen
          }
        },
        { new: true, runValidators: true }
      );

      if (updated) {
        console.log(`[OK] [${updated._id}] "${updated.nombre}" actualizado con ${updated.imagen.length} imágenes.`);
        console.log(`     Precio intacto: $${updated.precio} | Stock intacto: ${updated.stock}`);
      }
    }

    console.log('\n[OK] Migración de imágenes completada con éxito.');
  } catch (error) {
    console.error('[ERROR] Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('[INFO] Conexión a MongoDB cerrada.');
  }
};

if (require.main === module) {
  ejecutarMigracionImagenes();
}

module.exports = { imageMappings, validarArchivosFisicos, ejecutarMigracionImagenes };
