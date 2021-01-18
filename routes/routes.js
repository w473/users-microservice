const express = require('express');
const authorization = require('../services/authorizationService');
const validator = require('../services/validationService');
const usersController = require('../controllers/usersController');
const swaggerUi = require('swagger-ui-express');
const openApiDocs = require('./openApiDocs.json');

const router = express.Router();

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(openApiDocs));

router.patch('/activate/:activationCode', usersController.activate);

router.post('/find', authorization.hasRole(['USER']), usersController.find);
router.post(
    '/findByEmail',
    authorization.hasRole(['SYS', 'ADMIN']),
    validator.validate('email'),
    usersController.findByEmail
);
router.post(
    '/findByEmailPassword',
    authorization.hasRole(['SYS', 'ADMIN']),
    validator.validate('emailAndPassword'),
    usersController.findByEmailPassword
);

router.patch('/setRoles/:usersId', authorization.hasRole(['ADMIN']), usersController.setRoles);

router.patch(':usersId', authorization.hasRole('ADMIN'), validator.validate('editUserSchema'), usersController.edit);
router.delete(':usersId', authorization.isUser(), usersController.delete);

router.post('', validator.validate('addUserSchema'), usersController.add);
router.get('', authorization.hasRole(), usersController.get);
router.patch('', authorization.isUser(), validator.validate('editUserSchema'), usersController.edit);
router.delete('', authorization.isUser(), usersController.delete);

module.exports = router;
