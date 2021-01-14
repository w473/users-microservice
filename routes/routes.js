const express = require('express');
const authorization = require('../services/authorizationService');
const validator = require('../services/validationService');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get('', authorization.isUser(), usersController.get);

router.post('', validator.validate('addUserSchema'), usersController.add);

router.post('/find', authorization.hasRole(['USER']), usersController.find);
router.post('/findByEmail', authorization.hasRole(['SYS', 'ADMIN']), usersController.findByEmail);
router.post('/findByEmailPassword', authorization.hasRole(['ADMIN']), usersController.findByEmailPassword);

router.patch('', authorization.isUser(), validator.validate('editUserSchema'), usersController.edit);
router.patch(':usersId', authorization.hasRole('ADMIN'), validator.validate('editUserSchema'), usersController.edit);

router.delete('', authorization.isUser(), usersController.delete);
router.delete(':usersId', authorization.isUser(), usersController.delete);

router.patch('/activate/:activationCode', usersController.activate);

module.exports = router;
