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

async function newTransfer({name, email, rut, comment, amount}, id_from) {
  try {
    const result = await pool.query(
      `SELECT * FROM usuarios WHERE name = '${name}' AND email = '${email}' AND rut = '${rut}'`
    );
      const destinatario = result.rows[0];
      const {id: id_to} = destinatario;
      await pool.query(`BEGIN`);
      await pool.query(
        `UPDATE usuarios SET balance = balance + ${Number(
          amount
        )} WHERE id = ${id_to}`
      );
      await pool.query(
        `UPDATE usuarios SET balance = balance -${Number(
          amount
        )} WHERE id = ${id_from}` 
      );
      await pool.query(
        `INSERT INTO transferencias (id_from, date, id_to, comment, amount)
         VALUES ($1, NOW(), $2, $3, $4)`,
         [id_from, id_to, comment, amount]
      );
      await pool.query(`COMMIT`);
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function getTransfers(id) {
  try {
    const result = await pool.query(
      `SELECT trs.id, date, id_from, name, comment, trs.amount
      FROM transferencias as trs inner join usuarios as u on trs.id_to = u.id
      WHERE trs.id_from = $1`,
      [id]
    );
    return result.rows;
  } catch (e) {
    console.log(e);
    return false;
  }
}





module.exports = {
  nuevoUsuario,
  getUsuario,
  newTransfer,
  getTransfers,
}