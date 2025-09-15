const knex = require('knex');

const config = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'sunflowerland_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  },
  
  production: {
    client: 'postgresql',
    connection: {
      connectionString: 'postgresql://postgres:95o7YuloH9OrpgZ6@db.fzfegspgslnglxcegdbp.supabase.co:5432/postgres?sslmode=require',
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    },
    pool: {
      min: 2,
      max: 20
    }
  }
};

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

module.exports = db;
