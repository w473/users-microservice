const app = require('express')();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authorization = require('./services/authorizationService');
const routes = require('./routes/routes');
const config = require('./config');

app.use(bodyParser.json());

app.use(authorization.jwtVerifyMiddleware);

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

app.use((req, res, next) => {
    console.log(res)
    next();
});

mongoose
    .connect(
        config.db.url,
        { useNewUrlParser: true }

    )
    .then(result => {
        result.connection.useDb(config.db.name);
        app.listen(config.port);
    })
    .catch(err => {
        console.log("ERROR 1", err);
    });
