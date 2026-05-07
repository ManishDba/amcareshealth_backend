require("dotenv").config();

const PORT = process.env.PORT;
const PGHOST = process.env.PGHOST;
const PGUSER = process.env.PGUSER;
const PGDATABASE = process.env.PGDATABASE;
const PGPASSWORD = process.env.PGPASSWORD;
const PGPORT = process.env.PGPORT;
const JWT_SECRET = process.env.JWT_SECRET;

const SMS_COUNTRY_USER = process.env.SMS_COUNTRY_USER;
const SMS_COUNTRY_PASSWORD = process.env.SMS_COUNTRY_PASSWORD;


console.log(PORT, PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT, JWT_SECRET, SMS_COUNTRY_USER, SMS_COUNTRY_PASSWORD)


module.exports = {
    PORT,
    PGHOST,
    PGUSER,
    PGDATABASE,
    PGPASSWORD,
    PGPORT,
    JWT_SECRET,
    SMS_COUNTRY_USER,
    SMS_COUNTRY_PASSWORD
}
