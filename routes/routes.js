const express = require('express');
const authorization = require('../services/authorizationService');
const validator = require('../services/validationService');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get('', authorization.isUser(), usersController.get);

router.post('', authorization.isUser(), validator.validate('addUserSchema'), usersController.add);

router.post('/fetchByEmail/:email', authorization.hasRole(['SYS', 'ADMIN']), usersController.fetchByEmail);
router.post('/fetchByEmail/:email/:validate', authorization.hasRole(['ADMIN']), usersController.fetchByEmail);

router.patch('', authorization.isUser(), validator.validate('editUserSchema'), usersController.edit);
router.patch(':usersId', authorization.hasRole('ADMIN'), validator.validate('editUserSchema'), usersController.edit);

router.delete('', authorization.isUser(), usersController.remove);
router.delete(':usersId', authorization.hasRole('ADMIN'), usersController.remove);

module.exports = router;
