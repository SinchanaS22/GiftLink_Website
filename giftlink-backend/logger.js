import pino from 'pino';

let logger;

if (process.env.NODE_ENV !== 'production') {
  // In non-production environments, log to the console
  logger = pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  });
} else {
  // production
  logger = pino();
}

// Export the logger instance
export default logger;