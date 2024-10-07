CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    _id uuid DEFAULT uuid_generate_v4() NOT NULL,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT
);