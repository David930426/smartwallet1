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

let pool: ConnectionPool | undefined;

export const DbConnect = async(): Promise<ConnectionPool> => {
    try {
        // check if there is any connection
        if(pool instanceof ConnectionPool && pool.connected) {
            return pool;
        }
        // if there is a fail connection, then close it
        if(pool) {
            console.log("\x1b[38;5;33mConnection has been found, but disconnected, try to close it...\x1b[37m")
            await pool.close();
        }
        // make a new connection and return it for the promise
        console.log("\x1b[38;5;226mMaking new connection...\x1b[37m")
        pool = await sql.connect(configDb);

        console.log("\x1b[38;5;46mSuccess connect to database\x1b[37m")
        return pool;
    }
    //catch the error
    catch(err) {
        const error = err as Error
        console.error("\x1b[38;5;1mConnection to database is fail: \x1b[37m", error.message);

        throw new Error(`\x1b[38;5;1mFailed to connect database ${error.message}\x1b[37m`)
    }
}

// make a const async funct to let database connection can be closed
export const DbClose = async(): Promise<void> => {
    if (pool) {
        try {
            pool.close();
            pool = undefined;
            console.log("\x1b[38;5;46mConnection has been closed\x1b[37m")
        }
        catch(err) {
            const error = err as Error;
            console.error("\x1b[38;5;1mSQL can not be closed: \x1b[37m", error.message);
        }
    }
}