DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY, 
    account INT NOT NULL, 
    name VARCHAR(100) NOT NULL, 
    email VARCHAR(100) NOT NULL UNIQUE, 
    rut VARCHAR(12) NOT NULL UNIQUE, 
    address VARCHAR(100) NOT NULL, 
    password VARCHAR(20) NOT NULL, 
    balance FLOAT NOT NULL CHECK (balance >= 0)
);

-- psql -d bdchile  -a -f db/migrations/01-createTableUsuario_banco.sql 