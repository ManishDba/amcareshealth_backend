const { Sequelize } = require("sequelize");
const { PGHOST, PGUSER, PGDATABASE, PGPASSWORD } = require("../../env");

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
    host: PGHOST,
    dialect: "postgres",
    operatorsAliases: 0,
    logging: false,
    pool: {
        max: 999,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
})

const connectionTest = async () => {
    const maxRetries = 100;
    let retryCount = 0;
    while (retryCount < maxRetries) {
        try {
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
            break;
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            retryCount++;
            console.log(`Retrying connection attempt ${retryCount}...`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
        }
    }
}
connectionTest()

module.exports = sequelize