const express = require('express');
// const { check, body } = require('express-validator/check');

const usersController = require('../controllers/usersController');
// const User = require('../models/user');

const router = express.Router();

router.get('', usersController.get);

router.post('', usersController.add);

router.patch('', usersController.edit);

router.delete('', usersController.remove);

module.exports = router;
