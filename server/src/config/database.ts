import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

/**
 * Database Configuration
 * Supports PostgreSQL (recommended) and Microsoft SQL Server
 * Using Sequelize ORM for database operations
 */

// Determine dialect from environment or default to postgres
const dialect = (process.env.DB_DIALECT || "postgres") as "postgres" | "mssql";

// Base configuration
const baseConfig: any = {
  dialect,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Add dialect-specific options
if (dialect === "postgres") {
  console.log("DIALECT", process.env.DB_USER);
  baseConfig.port = parseInt(process.env.DB_PORT || "5432");

  // Handle SSL configuration for PostgreSQL
  const useSSL = process.env.DB_SSL !== "false" && process.env.DB_SSL !== "0";

  if (useSSL) {
    baseConfig.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    };
  } else {
    // For local development without SSL, we still need to allow the connection
    baseConfig.dialectOptions = {
      // This tells pg not to use SSL
      ssl: false,
    };
  }
} else if (dialect === "mssql") {
  baseConfig.port = parseInt(process.env.DB_PORT || "1433");
  baseConfig.dialectOptions = {
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  };
}

const sequelize = new Sequelize(baseConfig);

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    return false;
  }
}

/**
 * Sync database models
 */
export async function syncDatabase(): Promise<void> {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("✅ Database models synchronized.");
  } catch (error) {
    console.error("❌ Error synchronizing database:", error);
  }
}

export default sequelize;
