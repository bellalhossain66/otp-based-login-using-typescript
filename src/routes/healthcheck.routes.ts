import express from 'express';
import { HealthCheck } from '../controllers/healthcheck.controller';

const router = express.Router();

router.get('/', HealthCheck);

export default router;