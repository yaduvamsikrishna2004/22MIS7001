import type { Request, Response } from 'express';

import { logBackend } from '../../integrations/logging/backend-log.js';
import { sendSuccess } from '../../shared/transport/http-response.js';
import { buildHealthSnapshot } from './health-service.js';

export const getHealthStatus = async (req: Request, res: Response): Promise<void> => {
  const snapshot = await buildHealthSnapshot();

  await logBackend('debug', 'service', 'health snapshot generated', {
    requestId: req.requestId,
    uptimeSeconds: snapshot.uptimeSeconds
  });

  sendSuccess(res, 200, req.requestId, snapshot);
};
