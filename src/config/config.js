const { PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT, DATABASE_URL } = require("../../env");

const config = {
  username: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  host: PGHOST,
  port: PGPORT || 5432,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

module.exports = {
  development: config,
  test: config,
  production: config
};

