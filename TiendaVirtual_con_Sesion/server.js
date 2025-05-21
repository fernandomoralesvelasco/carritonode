const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const port = 3000;

// Configurar middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configurar el middleware de sesiones en Express.js
// Usar paquete express-session 
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-12345', // En producción usar: process.env.SESSION_SECRET
    resave: false, // Evita que la sesión se guarde en el almacenamiento si no hubo cambios.
    saveUninitialized: true, // Crea una sesión nueva incluso si no se le agregan datos.
    cookie: { 
        // La cookie se envía sobre HTTP (para desarrollo)
        secure: false, // Cambiar a true en producción con HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 1 día
        // maxAge: 30 * 60 * 1000, // 30 minutos en milisegundos
    }
}));

// Middleware de seguridad para cabeceras
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

// Ruta alternativa para index
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

// Ruta de contacto
app.get('/contacto.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contacto.html'));
})

// Ruta para productos 
app.get('/productos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'productos.html'));
})

// Ruta para productos 
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
})

// Ruta para productos 
app.get('/registrar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registrar.html'));
})

// Función auxiliar para leer archivos JSON
async function readJsonFile(filename) {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', filename));
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Función auxiliar para escribir en archivos JSON
async function writeJsonFile(filename, data) {
    try {
        await fs.writeFile(
            path.join(__dirname, 'data', filename),
            JSON.stringify(data, null, 2)
        );
        return true;
    } catch (err) {
        console.error('Error escribiendo archivo:', err);
        return false;
    }
}

// Ruta para lista de productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await readJsonFile('productos.json');
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error al leer los productos' });
    }
})

// API de Usuarios
app.post('/api/registrar', async (req, res) => {
    try{
        const usuarios = await readJsonFile('usuarios.json');
        const { nombre, email, password } = req.body; 

        // Verificar si el usuario ya existe
        const existeEmail = usuarios.some(u => u.email.toLowerCase() === email.trim().toLowerCase());

        if(existeEmail) {
            return res.status(409).json({
                error: 'El correo electrónico ya está registrado' // Mensaje exacto
            });
        }
        
        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = {
            id: Date.now().toString(),
            nombre: nombre.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            rol: 'usuario',
        };

        usuarios.push(nuevoUsuario);
        await writeJsonFile('usuarios.json', usuarios);

        res.status(201).json({ 
            success: true,
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.name,
                email: nuevoUsuario.email
            }
        });

    } catch(err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/usuario', (req, res) => {
    if (req.session.user) {
        res.json({ usuario: req.session.user });
    } else {
        res.status(401).json({ error: 'No autenticado' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', 'usuarios.json'));
        const usuarios = JSON.parse(data);
        
        const usuario = usuarios.find(u => u.email === req.body.email);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const passwordValido = await bcrypt.compare(req.body.password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Crea un objeto req.session único para cada usuario
        req.session.user = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };
        
        res.json({ 
            success: true, 
            usuario: {
                nombre: usuario.nombre,
                rol: usuario.rol 
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Nueva ruta para verificar sesión
app.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ autentificado: true, usuario: req.session.user });
    } else {
        res.status(401).json({ autentificado: false });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error interno al cerrar sesión'
            });
        }
    });

    res.json({ 
        success: true,
        mensaje: 'Sesion cerrada correctamente' 
    });
});

// Middleware para verificar autenticación solo en rutas privadas
app.use((req, res, next) => {
    const rutasPublicas = ['/', '/index.html', '/contacto.html', '/productos.html', '/login.html', '/registro.html'];
    
    if (rutasPublicas.includes(req.path)) {
        return next();
    }
    
    // Verificar autenticación para rutas privadas
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    
    next();
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
})

// Iniciar el servidor
app.listen(port, () =>{
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log('Recursos estáticos en /public');
})