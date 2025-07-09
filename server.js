import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import  mongoDb from 'mongodb';


const PORT=3000;
const app= express();

// Estas líneas son necesarias para obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de la carpeta estática para servir archivos estáticos como si estuvieran en la raíz del servidor
app.use(express.static(path.join(__dirname, 'public')))


// Middleware para procesar datos del formulario
// y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de EJS como motor de plantillasapp.set('view engine', 'ejs');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración de la conexión a MongoDB
// Asegúrate de tener MongoDB corriendo en tu máquina
const conn_str = 'mongodb://localhost:27017';
const client = new mongoDb.MongoClient(conn_str);


//connectar a la base de datos
// y manejar errores de conexión

let conn;

try {
  conn = await client.connect();
  console.log('Conectado a MongoDB');
} catch (err) {
  console.log(err);
  console.log('No se pudo conectar a MongoDB');
}

let db = conn.db('kudehezi'); // Cambia 'mi-base-de-datos' por el nombre de tu base de datos

 app.get('/', (req, res) => {
  res.render('login');  
});
app.get('/formAnn', (req, res) => {
  res.render('formAnn');
});

app.get('/panel', async (req, res) => {
  const collection = db.collection('acciones');
  try {
    const acciones = await collection.find({}).toArray();
    res.render('panel', { acciones });
  } catch (error) {
    console.error(error);
    res.render('panel', { acciones: [] });
  }
});
app.post('/api/insertar', async (req, res) => {
    const nuevaAccion = req.body;
    const collection = db.collection('acciones');
    try {
        await collection.insertOne(nuevaAccion);
        res.redirect('/panel'); // Redirige a /panel tras guardar
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al añadir la acción");
    }
});
app.get('/api/acciones', async (req, res) => { 
    const collection = db.collection('acciones');
    try{  
        const acciones = await collection.find({}).toArray();
        res.status(200).json(acciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las acciones" });
    }
}); 
 

app.listen( PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
