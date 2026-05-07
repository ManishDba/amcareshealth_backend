const { models, sequelize } = require("../models/index")

sequelize.sync({ force: false, alter: true, })
.then(() => console.log("All models were synchronized successfully."))

module.exports = models