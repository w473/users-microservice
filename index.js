const app = require('express')();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const config = require('./config');
const { ValidationError } = require('express-json-validator-middleware');

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(routes);

app.use((req, res) => {
    res.status(404).json({ message: 'Page you are looking for does not exist' });
});

app.use((error, req, res, next) => {
    if (error instanceof ValidationError) {
        return res.status(400).json({ message: 'Validation error', data: error.validationErrors });
    }
    console.log(error);
    if (!res.headersSent) {
        res.status(500).json({ message: 'Unexpected error occured' });
    }
});

mongoose
    .connect(
        config.db.url,
        { useNewUrlParser: true }
    )
    .then(result => {
        app.listen(config.port);
    })
    .catch(err => {
        console.log("ERROR 1", err);
    });
