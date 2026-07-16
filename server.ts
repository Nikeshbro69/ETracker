import app from "./src/app.js";
import { envConfig } from "./src/config/env.config.js";

function startServer() {
  const port = envConfig.PORT ?? 4000;
  app.listen(port, () => {
    console.log(`✅  FMS API running on http://localhost:${port}`);
    console.log(`    Environment : ${envConfig.NODE_ENV}`);
    console.log(`    Health check: http://localhost:${port}/health`);
  });
}

startServer();
