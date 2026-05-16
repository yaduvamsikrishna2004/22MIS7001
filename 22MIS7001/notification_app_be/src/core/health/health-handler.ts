import type { Request, Response } from 'express';

import { logBackend } from '../../integrations/logging/backend-log.js';
import { buildHealthSnapshot } from './health-service.js';

export const getHealthStatus = async (req: Request, res: Response): Promise<void> => {
  const data = await buildHealthSnapshot();

  await logBackend('info', 'handler', 'health status requested', {
    requestId: req.requestId
  });

  res.status(200).json({
    data,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    }
  });
};
