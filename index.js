const app = require('express')();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authorization = require('./services/authorizationService');
const usersRoutes = require('./routes/usersRoutes');
// const groupsRoutes = require('./routes/groupsRoutes');
// const friendsRoutes = require('./routes/friendsRoutes');

app.use(bodyParser.json());


app.use(authorization.entry);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    console.log(req.originalUrl)
    next();
});

app.use(usersRoutes);
// app.use('/groups', adminRoutes);
// app.use('/friends', adminRoutes);

app.use((req, res, next) => {
    console.log(res)
    next();
});

mongoose
    .connect(
        'mongodb://user:pass@localhost/test?retryWrites=true&authSource=admin',
        { useNewUrlParser: true }

    )
    .then(result => {
        result.connection.useDb('users');
        app.listen(3000);
    })
    .catch(err => {
        console.log("ERROR 1", err);
    });
