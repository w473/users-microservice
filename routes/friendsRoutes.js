const express = require('express');
// const { check, body } = require('express-validator/check');

// const authController = require('../controllers/auth');
// const User = require('../models/user');

const router = express.Router();

router.get('', authController.getLogin);

router.patch('/invitations/:userId', authController.postLogout);

router.delete('/invitations/:userId', authController.postLogout);

router.put('/invitations/:userId', authController.postLogout);

module.exports = router;
