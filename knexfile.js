module.exports = {

    development: {
        client: 'pg',
        connection: {
            host: 'localhost',
            port: '5433',
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
    },

    staging: {
        client: 'pg',
        connection: {
            host: 'localhost',
            port: '5433',
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
    },

    production: {
        client: 'pg',
        connection: {
            host: 'localhost',
            port: '5433',
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

};
