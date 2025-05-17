import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { LibSQLStore } from '@mastra/libsql';

import { codeReviewAgent } from './agents/codeReview';

export const mastra = new Mastra({
  agents: { codeReviewAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new CloudflareDeployer({
    scope: 'e79f0ee042d7704594ac39d671ae2135',
    projectName: 'mastra-app',
    auth: {
      apiToken: process.env.CLOUDFLARE_API_TOKEN || 'your-api-token',
    },
  }),
});
