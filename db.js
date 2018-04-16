'use strict'

const knex = require('knex')

const dbConfig = {
    client: 'pg',
    connection: {
        host: 'pg-db',
        port: '5432',
        user: 'username',
        password: 'password',
        database: 'db_name',
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