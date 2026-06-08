const mysql = require("mysql2");

const dbHost = process.env.DBHOST || "mysql.railway.internal";
const dbPort = parseInt(process.env.DBPORT) || 3306;
console.log(`DB connecting to: ${dbHost}:${dbPort} db=${process.env.DBNAME} user=${process.env.DBUSER}`);

const con = mysql.createPool({
  connectionLimit: 200,
  host: dbHost,
  port: dbPort,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
  charset: "utf8mb4",
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Handle connection errors
con.on("connection", function (connection) {
  // console.log("Database connection established as id " + connection.threadId);
});

con.on("error", function (err) {
  console.error("Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("Database connection lost, reconnecting...");
  }
});

con.getConnection((err, connection) => {
  if (err) {
    console.log({
      err: err,
      msg: "Database connected error",
    });
    return;
  } else {
    console.log("Database has been connected");
    connection.release();
  }
});

module.exports = con;
