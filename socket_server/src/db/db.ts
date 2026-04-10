import mysql from 'mysql2/promise';

const [host, port] = process.env.DB_HOST!.split(':');

const pool = mysql.createPool({
  host: host,
  port: parseInt(port),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
