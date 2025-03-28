const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexão com o banco estabelecida!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco:', err);
    process.exit(1);
  });

module.exports = pool;