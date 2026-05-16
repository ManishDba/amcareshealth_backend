const { Sequelize } = require("sequelize");
const { PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT, DATABASE_URL } = require("../../env");

const sequelize = DATABASE_URL 
    ? new Sequelize(DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },

        define: {
            underscored: false,
            freezeTableName: false,
        },
    })
    : new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
        host: PGHOST,
        port: PGPORT || 5432,
        dialect: "postgres",
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 20,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            underscored: false,
            freezeTableName: false,
        },
    });


// Connection test removed from top-level to prevent redundant syncs during migrations.
// It should be called explicitly in the main entry point (index.js).
const authenticate = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established.');
        await sequelize.sync();
        console.log('✅ Database models synchronized.');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

module.exports = sequelize;
module.exports.authenticateApp = authenticate;