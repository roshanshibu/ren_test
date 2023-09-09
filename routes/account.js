const { json } = require('express');
const express = require('express');
const auth = require("../middleware/auth");

//import controller functions
const {
    getAccounts,
    getAccount,
    getAccountsPagination,
    createAccount,
    deleteAccount,
    updateAccount
} = require('../controllers/accountController')

const cache = require('../routeCache');

const router = express.Router();

//Call authorization middleware for all routes below
router.use(auth)

/**
 * @swagger
 * /api/accounts/:
 *   get:
 *     description: Returns All Financial Accounts Of A User
 *     tags:
 *       - Accounts
 *     parameters:
 *       - in: header
 *         name: jwt
 *         description: JWT Token
 *         type: string
 *     responses:
 *       '200':
 *         description: Returns an array of accounts
 *         contents:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized
 */
//GET all accounts
router.get('/', cache(300), getAccounts)

//GET a single account
router.get('/:id', cache(300), getAccount)

//GET accounts with pagination
router.get('/:page/:limit', cache(300), getAccountsPagination)

/**
 * @swagger
 * /api/accounts/:
 *   put:
 *     description: Creates A New Financial Account For The User
 *     tags:
 *       - Accounts
 *     parameters:
 *       - in: header
 *         name: jwt
 *         description: JWT Token
 *         type: string
 *       - in: body
 *         name: account
 *         description: New account to be created
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - type
 *             - balance
 *             - color
 *           properties:
 *             name:
 *               type: string
 *             type:
 *               type: string
 *             balance:
 *               type: number
 *             color:
 *               type: string
 *     responses:
 *       '200':
 *         description: Returns account object which was created
 *         contents:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized
 *       '400':
 *         description: Error
 */
//PUT a new account (idempotent)
router.put('/', cache(300), createAccount)

//DELETE a account
router.delete('/:id', cache(300), deleteAccount)

//UPDATE a account
router.patch('/:id', cache(300), updateAccount)

module.exports = router;