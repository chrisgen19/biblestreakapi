/**
 * Type definitions for environment variables
 * Ensures type safety when accessing process.env
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * The secret key used for signing and verifying JWT tokens
       */
      JWT_SECRET: string;

      /**
       * PostgreSQL database connection URL
       * Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
       */
      DATABASE_URL: string;

      /**
       * The port number on which the server will listen
       * @default 3000
       */
      PORT?: string;

      /**
       * Node environment (development, production, test)
       */
      NODE_ENV?: 'development' | 'production' | 'test';
    }
  }
}

export {};
