const { QueryTypes, Op } = require("sequelize");
const { models } = require("../models");
const { errorHandler, successHandler, handlerWithMsg } = require("../utils/handler.utils");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const welcome = async (req, res) => {
  res.send("Hello programmer...");
};

const signup = async (req, res) => {
  try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const data = await models.users.create({ name, email, password: hashedPassword });
      handlerWithMsg(res, "User registered successfully")
      return

  } catch (error) {
    errorHandler(res, error);
  }
};

const sighin = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await  models.users.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '1h' });
        successHandler(res, {token})
        
    } catch (error) {
        errorHandler(res, error);
        
    }
    
}

module.exports = {
  welcome,
  signup,
  sighin
};
