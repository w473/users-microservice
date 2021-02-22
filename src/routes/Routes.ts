import express from 'express';
import { hasRole, isUser } from '../services/AuthorizationService';
import validate from '../services/ValidationService';
import * as usersController from '../controllers/UsersController';
import swaggerUi from 'swagger-ui-express';
import openApiDocs from './openApiDocs.json';

const router = express.Router();

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(openApiDocs));

router.patch('/activate/:activationCode', usersController.activate);

router.get('/find', hasRole(['USER']), usersController.find);
router.post(
  '/findByEmail',
  hasRole(['SYS', 'ADMIN']),
  validate('email'),
  usersController.findByEmail
);
router.post(
  '/findByEmailPassword',
  hasRole(['SYS', 'ADMIN']),
  validate('emailAndPassword'),
  usersController.findByEmailPassword
);

router.patch(
  '/setRoles/:usersId',
  hasRole(['ADMIN']),
  usersController.setRoles
);

router.patch(
  ':usersId',
  hasRole('ADMIN'),
  validate('editUserSchema'),
  usersController.edit
);
router.delete(':usersId', isUser(), usersController.deleteUser);

router.post('', validate('addUserSchema'), usersController.add);
router.get('', isUser(), usersController.get);
router.get(
  '/:username',
  isUser(),
  usersController.findByUsername
);

router.patch(
  '',
  isUser(),
  validate('editUserSchema'),
  usersController.edit
);
router.patch(
  '/password',
  isUser(),
  validate('passwordChangeSchema'),
  usersController.passwordChange
);
router.delete('', isUser(), usersController.deleteUser);

export default router;
