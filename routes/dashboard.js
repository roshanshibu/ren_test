const { json } = require('express');
const express = require('express');

//import controller functions
const {
    getDashboard
} = require('../controllers/dashboardController')


const router = express.Router();

//GET dashboard values
router.get('/', getDashboard)

module.exports = router;