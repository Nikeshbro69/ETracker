import morgan from "morgan";
import { envConfig } from "../config/env.config.js";

export const requestLogger = morgan(
  envConfig.NODE_ENV === "development" ? "dev" : "combined"
);
