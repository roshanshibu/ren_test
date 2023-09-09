const { json } = require('express');
const express = require('express');
const auth = require("../middleware/auth");

//import controller functions
const {
    getDashboard
} = require('../controllers/dashboardController')

const cache = require('../routeCache');

const router = express.Router();

//Call authorization middleware for all routes below
router.use(auth)

/**
 * @swagger
 * /api/dashboard/:
 *   get:
 *     description: Calculates and Returns User's Dashboard Data
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - in: header
 *         name: jwt
 *         description: JWT Token
 *         type: string
 *     responses:
 *       '200':
 *         description: Returns Object with Dashboard Details
 *         contents:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized
 */
//GET dashboard values
router.get('/', cache(300), getDashboard)

module.exports = router;