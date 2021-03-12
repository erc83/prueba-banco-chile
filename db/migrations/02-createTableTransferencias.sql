DROP TABLE IF EXISTS tranferencias;

CREATE TABLE transferencias (
    id SERIAL PRIMARY KEY, 
    date TIMESTAMP NOT NULL, 
    id_from INT NOT NULL, 
    id_to INT NOT NULL, 
    comment VARCHAR(50) NOT NULL, 
    amount FLOAT NOT NULL, 
    FOREIGN KEY (id_from) REFERENCES usuarios(id),
    FOREIGN KEY (id_to) REFERENCES usuarios(id)
);

-- psql -d bdchile  -a -f db/migrations/02-createTableTransferencias.sql