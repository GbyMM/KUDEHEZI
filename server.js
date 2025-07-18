import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoDb from 'mongodb';
import { ObjectId } from 'mongodb';
import session from 'express-session';
import bcrypt from 'bcrypt';

const PORT = 3000;
const app = express();

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carpeta estática
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear datos de formulario y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración sesión
app.use(
  session({
    secret: 'mi_clave_secreta',
    resave: false,
    saveUninitialized: false,
  })
);

// Función principal async para conectar a Mongo y arrancar el servidor
async function main() {
  const conn_str = 'mongodb://localhost:27017';
  const client = new mongoDb.MongoClient(conn_str);

  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    const db = client.db('kudehezi');

    // Guardar db en app.locals para usar en rutas
    app.locals.db = db;

    // Rutas

    app.get('/', (req, res) => {
      res.render('login', { error: null });
    });

    app.get('/formAnn', (req, res) => {
      res.render('formAnn'); 
    });

    app.get('/panel', async (req, res) => {
      if (!req.session.user) return res.redirect('/');
      const db = req.app.locals.db;
      const collection = db.collection('acciones');
      try {
        const acciones = await collection.find({}).toArray();
        res.render('panel', { acciones, user: req.session.user });
      } catch (error) {
        console.error(error);
        res.render('panel', { acciones: [], user: req.session.user });
      }
    });

    app.post('/register', async (req, res) => {
      const { email, password } = req.body;
      const db = req.app.locals.db;
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.collection('users').insertOne({ email, password: hashedPassword });
    res.json({msg: "El usuario ha sido creado con exito"})
    });

    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      const db = req.app.locals.db;
      const user = await db.collection('users').findOne({ email });

      if (!user) return res.render('login', { error: 'datos incorrectos' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.render('login', { error: 'datos incorrectos' });

      req.session.user = user;
      res.redirect('/panel');
    });

    app.get('/logout', (req, res) => {
      req.session.destroy(() => res.redirect('/'));
    });

    app.get('/api/acciones', async (req, res) => {
      if (!req.session.user) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      const db = req.app.locals.db;
      const collection = db.collection('acciones');
      try {
        const acciones = await collection.find({}).toArray();
        res.status(200).json(acciones);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las acciones' });
      }
    });

    app.delete('/api/eliminar', async (req, res) => {
      const { id } = req.body;
      const db = req.app.locals.db;
      const collection = db.collection('acciones');
      try {
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ message: 'Acción eliminada correctamente' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la acción' });
      }
    });

    app.post('/api/insertar', async (req, res) => {
      const { nombre, telefono, email, asociacionEntidad, tipoAccion } = req.body;
      const db = req.app.locals.db;
      const collection = db.collection('acciones');

      const nuevaAccion = {
        nombre,
        telefono,
        email,
        asociacionEntidad,
        tipoAccion,
        fechaInsercion: new Date(),
      };

      try {
        await collection.insertOne(nuevaAccion);
        res.redirect('/panel');
      } catch (error) {
        console.error(error);
        res.status(500).send('Error al insertar la acción');
      }
    });

    app.post('/api/actualizar', async (req, res) => {
      const { id, nombre, telefono, email, asociacionEntidad, tipoAccion, fechaInicio, fechaFin, horarios, responsableAccion, descripcion, web } = req.body;
      const db = req.app.locals.db;
      const collection = db.collection('acciones');

      try {
        await collection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              nombre,
              asociacionEntidad,
              email,
              telefono,
              fechaInicio,
              fechaFin,
              horarios,
              tipoAccion,
              responsableAccion,
              descripcion,
              web,
            },
          }
        );
        res.redirect('/panel');
      } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar la acción');
      }
    });

    app.get('/api/acciones/:id', async (req, res) => {
      if (!req.session.user) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      try {
        const db = req.app.locals.db;
        const id = req.params.id;
        const accion = await db.collection('acciones').findOne({ _id: new ObjectId(id) });
        if (!accion) return res.status(404).json({ error: 'No encontrada' });
        res.json(accion);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la acción' });
      }
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a MongoDB', err);
  }
}

main();
