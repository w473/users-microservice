import express from 'express';
import * as connectionsController from '../controllers/ConnectionsController';
import * as requestsController from '../controllers/RequestsController';
const router = express.Router();

router.post('/connections/requests/:userId', requestsController.createRequests);
router.patch('/connections/requests/:userId', requestsController.acceptRequests);

router.get('/connections', connectionsController.getConnections);
router.delete('/connections/:userId', connectionsController.removeConnection);

export default router;
