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


const connectionTest = async () => {
    const maxRetries = 5;
    let retryCount = 0;
    while (retryCount < maxRetries) {
        try {
            console.log('🔍 Attempting DB connection...');
            await sequelize.authenticate();
            console.log('✅ Database connection established successfully.');

            console.log('🔄 Syncing models...');
            // Temporarily disabling alter:true to check for hangs
            await sequelize.sync();
            console.log('✅ Database models synchronized.');
            break;
        } catch (error) {
            retryCount++;
            console.error(`❌ Database connection attempt ${retryCount}/${maxRetries} failed:`, error.message);
            if (retryCount >= maxRetries) {
                console.error('❌ Max retries reached. Could not connect to database.');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}
connectionTest();

module.exports = sequelize;