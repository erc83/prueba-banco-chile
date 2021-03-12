require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.USER,
  host: "localhost",
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: 5432,
});

async function nuevoUsuario(name, email, rut, address, password) {
  try {
      const balance = 100000;
      const account = Math.floor(Math.random() * (999999 - 0)) + 0;
      const qryObject = {
          text: 
          `INSERT INTO usuarios (account, name, email, rut, address, password, balance) 
          VALUES ( '${account}','${name}','${email}','${rut}', '${address}','${password}', '${balance}' ) RETURNING *`,
         // values: [email,name, password].rows
      }
      const result = await pool.query(qryObject)
      return result.rows;
  } catch (err) {
      console.log(err);
    return err;
  }
}

async function getUsuario( rut, password) {
  try {
    const result = await pool.query(
      `SELECT * FROM usuarios WHERE rut = '${rut}' AND password = '${password}'`
    );
    return result.rows[0];
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = {
  nuevoUsuario,
  getUsuario,
}