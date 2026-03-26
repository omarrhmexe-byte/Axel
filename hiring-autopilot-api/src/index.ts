import { env } from './config/env';
import app from './app';
import { logger } from './utils/logger';

app.listen(env.port, () => {
  logger.info(`Hiring Autopilot API running`, {
    port: env.port,
    env: env.nodeEnv,
  });
});
