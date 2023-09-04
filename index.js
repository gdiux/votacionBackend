//Env
require('dotenv').config();
const path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//Conection DB
const { dbConection } = require('./database/config');


/*
? INIT EXPRESS SERVER
`const app = express();` is creating an instance of the Express application. This instance will be
used to define routes, middleware, and start the server. */
const app = express();


/* 
? CORS
`app.use(cors());` is a middleware function in Express that enables Cross-Origin Resource Sharing
(CORS) for all routes in the application. */
app.use(cors());

// READ BODY
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

/* 
? DataBase 
`dbConection();` is a function that establishes a connection to the database. It is likely defined
in the `./database/config` file and is called to connect to the database before starting the server. */
dbConection();

/* 
? DIRECTORIO PUBLICO
`app.use(express.static('public'));` is a middleware function in Express that serves static files
from the specified directory. In this case, it is serving files from the 'public' directory. */
app.use(express.static('public'));

// RUTAS
app.use('/api/login', require('./routes/auth.route'));
app.use('/api/candidates', require('./routes/candidates.route'));
app.use('/api/centers', require('./routes/centers.route'));
app.use('/api/mesas', require('./routes/mesas.route'));
app.use('/api/search', require('./routes/search.route'));
app.use('/api/tasks', require('./routes/tasks.route'));
app.use('/api/uploads', require('./routes/uploads.route'));
app.use('/api/users', require('./routes/users.route'));
app.use('/api/votos', require('./routes/votos.route'));

/* The `app.get('*', (req, res) => { ... })` code block is a route handler that is used to handle all
GET requests that do not match any of the defined routes. */
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

/* `app.listen(process.env.PORT, () => { ... })` is a method in Express that starts a UNIX socket and
listens for connections on the specified `PORT`. The `process.env.PORT` is an environment variable
that holds the port number on which the server should listen. */
app.listen(process.env.PORT, () => {
    console.log('Servidor Corriendo en el Puerto', process.env.PORT);
});