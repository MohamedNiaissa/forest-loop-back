const express = require('express')

const app = express();
const testRoutes = require('./routes/test')

app.use(express.json()); // intercepte requête avec un content type json et les mets à dispositions dans req.body

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/test', testRoutes)

module.exports = app; // rendre accessible ds les autres fichier
