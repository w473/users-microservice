const app = require('express')();
const mongoose = require('mongoose');

const usersRoutes = require('./routes/usersRoutes');
// const groupsRoutes = require('./routes/groupsRoutes');
// const friendsRoutes = require('./routes/friendsRoutes');

app.use('/users', adminRoutes);
// app.use('/groups', adminRoutes);
// app.use('/friends', adminRoutes);

app.listen(3000);