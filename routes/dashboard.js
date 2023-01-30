const { json } = require('express');
const express = require('express');
const auth = require("../middleware/auth");

//import controller functions
const {
    getDashboard
} = require('../controllers/dashboardController')


const router = express.Router();

//Call authorization middleware for all routes below
router.use(auth)

//GET dashboard values
router.get('/', getDashboard)

module.exports = router;