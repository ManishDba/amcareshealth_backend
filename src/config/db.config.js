const { Sequelize } = require("sequelize");
const { PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT, DATABASE_URL } = require("../../env");

// Neon pooler-specific settings
const isNeon = DATABASE_URL && DATABASE_URL.includes('neon.tech');
const NODE_ENV = process.env.NODE_ENV || 'development';

const sequelize = DATABASE_URL 
    ? new Sequelize(DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            connectTimeout: 30000,  // 30s connection timeout
        },
        logging: NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: isNeon ? 20 : 10,  // Neon handles more concurrent connections
            min: isNeon ? 2 : 0,     // Keep some warm for Neon
            acquire: 60000,          // 60s for slow networks
            idle: isNeon ? 240000 : 10000,  // Neon: 4min (before idle timeout), Local: 10s
            evict: 60000,            // Evict idle connections every 60s
            validate: (conn) => {
                // Validate connection is still alive
                return conn.query('SELECT 1').then(() => conn).catch(() => false);
            },
        },
        retry: {
            max: 3,  // Retry failed connections up to 3 times
            timeout: 5000,  // Wait 5s between retries
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeInvalidConnectionError/,
                /Connection timeout/,
            ],
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
        logging: NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 20,
            min: 2,
            acquire: 60000,
            idle: 240000,
            evict: 60000,
            validate: (conn) => {
                return conn.query('SELECT 1').then(() => conn).catch(() => false);
            },
        },
        retry: {
            max: 3,
            timeout: 5000,
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeInvalidConnectionError/,
            ],
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
        console.log(`[DB] Connecting to ${isNeon ? 'Neon' : 'Local'} PostgreSQL...`);
        await sequelize.authenticate();
        console.log('✅ Database connection established.');
        console.log(`[DB] Pool config: max=${sequelize.options.pool.max}, min=${sequelize.options.pool.min}, acquire=${sequelize.options.pool.acquire}ms, idle=${sequelize.options.pool.idle}ms`);
        await sequelize.sync();
        console.log('✅ Database models synchronized.');
    } catch (error) {
        console.error('❌ Database connection failed!');
        console.error('Error Details:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('→ Connection refused. Check if database server is running.');
        } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
            console.error('→ Connection timeout. Check network connectivity and DATABASE_URL.');
        } else if (error.message.includes('password authentication failed')) {
            console.error('→ Authentication failed. Check PGUSER/PGPASSWORD or DATABASE_URL credentials.');
        }
        if (!DATABASE_URL && !PGHOST) {
            console.error('CRITICAL: No database connection parameters found in environment variables.');
        }
        // Don't exit immediately; allow retry logic to kick in
        console.error('Retrying connection in 5 seconds...');
        setTimeout(() => authenticate(), 5000);
    }

}

module.exports = sequelize;
module.exports.authenticateApp = authenticate;
