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

// const newUser = async (usuario) => {
//   const account = Math.floor(Math.random() * (999999 - 0)) + 0;
//   const result = await pool.query(
//     `INSERT INTO usuarios (account, name, rut, email, address, password, amount) values ('${account}', $1, $2, $3, $4, $5,  100000) RETURNING *`,
//     usuario
//   );
//   return result.rows[0];
// };

module.exports = {
  nuevoUsuario,
}