require("dotenv").config();

const PORT = process.env.PORT || 5000;

const PGHOST = process.env.PGHOST;
const PGUSER = process.env.PGUSER;
const PGDATABASE = process.env.PGDATABASE;
const PGPASSWORD = process.env.PGPASSWORD;
const PGPORT = process.env.PGPORT;
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

const SMS_COUNTRY_USER = process.env.SMS_COUNTRY_USER;
const SMS_COUNTRY_PASSWORD = process.env.SMS_COUNTRY_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL;





module.exports = {
    PORT,
    PGHOST,
    PGUSER,
    PGDATABASE,
    PGPASSWORD,
    PGPORT,
    DATABASE_URL,
    JWT_SECRET,
    SMS_COUNTRY_USER,
    SMS_COUNTRY_PASSWORD,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    FROM_EMAIL
}
