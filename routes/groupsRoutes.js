const express = require('express');
// const { check, body } = require('express-validator/check');

// const authController = require('../controllers/auth');
// const User = require('../models/user');

const router = express.Router();

router.get('', authController.getLogin);

router.post('', authController.getSignup);

router.patch('', authController.postLogout);

router.delete('', authController.postLogout);

router.put('{:groupId}/user/{userId}', authController.postLogout);

module.exports = router;
