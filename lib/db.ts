import sql, { config, ConnectionPool } from "mssql";

// declare the config for  database
const configDb: config = {
  user: process.env.SQL_SERVER_USER,
  password: process.env.SQL_SERVER_PASSWORD,
  server: process.env.SQL_SERVER_HOST as string,
  database: process.env.SQL_SERVER_DB,
  options: {
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbort: true,
  },
  port: 1433,
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    if (!pool) {
      pool = await sql.connect(configDb);
      console.log("Database connection successful!");
    }
    return pool;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export { sql };