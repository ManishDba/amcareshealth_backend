const express = require('express');
const router = express.Router();





// controllers
const usersController = require('../controllers/users.controller');


router.get("/", usersController.welcome)
router.post("/sign-up", usersController.signup)
router.post("/sign-in", usersController.sighin)


module.exports = router;