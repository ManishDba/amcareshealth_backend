const { models, sequelize } = require("../models/index")

sequelize.sync({ force: false, alter: true, })
.then(() => {
    console.log("All models were synchronized successfully.");
    process.exit(0);
})
.catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});

module.exports = models