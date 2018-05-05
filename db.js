'use strict'

const knex = require('knex')

const dbConfig = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || 'pg-db',
        port: process.env.DB_PORT || '5432',
        user: process.env.DB_USER || 'username',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'db_name',
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }
}

//exports.tryToConnect = () => knex(dbConfig)
module.exports = knex(dbConfig)