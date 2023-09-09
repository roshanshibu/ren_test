const { json } = require('express');
const express = require('express');
const auth = require('../middleware/auth');

//import controller functions
const {
  getSpecificTransactions,
  getTransactions,
  getTransaction,
  getTransactionsPagination,
  checkTransactionCreation,
  deleteTransaction,
  updateTransaction,
} = require('../controllers/transactionController');

const cache = require('../routeCache');

const router = express.Router();

//Call authorization middleware for all routes below
router.use(auth);

//GET all transactions
router.get('/', cache(300), getTransactions);

/**
 * @swagger
 * /api/transactions/{year}/{month}:
 *   get:
 *     description: Gets All Transactions Of User, In The Year And Month Specified In Path
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: Numeric value of Year in 'yyyy' format
 *         schema:
 *           type: integer
 *       - in: path 
 *         name: month
 *         required: true
 *         description: Numeric value of Month in 'mm' format
 *         schema:
 *           type: integer
 *       - in: header
 *         name: jwt
 *         description: JWT Token
 *         type: string
 *     responses:
 *       '200':
 *         description: Returns an object which details of all transactions in specified month
 *         contents:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized
 *       '400':
 *         description: Error
 *       '404':
 *         description: Account not found
 */
//GET specific transactions
router.get('/:year/:month', cache(300), getSpecificTransactions);

//GET transactions with pagination
router.get('/:page/:limit', cache(300), getTransactionsPagination);

//GET a single transaction
router.get('/:id', cache(300), getTransaction);

/**
 * @swagger
 * /api/transactions/:
 *   put:
 *     description: |
 *       Creates A New Transaction For The User
 *       This could be Income, Expense or Transfer between accounts
 *       Incase of Transfer, the Request body should :
 *       1. Contain another parameter called fromAccountID
 *       1. Have the type property's value to be "Transfer"
 *       1. Remove the propert called categoryID
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: header
 *         name: jwt
 *         description: JWT Token
 *         type: string
 *       - in: body
 *         name: transaction
 *         description: Transaction to be created
 *         schema:
 *           type: object
 *           required:
 *             - accountID
 *             - description
 *             - amount
 *             - date
 *             - type
 *           properties:
 *             accountID:
 *               type: string
 *             description:
 *               type: string
 *             amount:
 *               type: number
 *             date:
 *               type: string
 *             categoryID:
 *               type: string
 *             type:
 *               type: string
 *     responses:
 *       '200':
 *         description: Returns a transaction object which was created
 *         contents:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized
 *       '400':
 *         description: Error
 *       '404':
 *         description: Account not found
 */
//PUT a new transaction
router.put('/', cache(300), checkTransactionCreation);

//DELETE a transaction
router.delete('/:id', cache(300), deleteTransaction);

//UPDATE a transaction
router.patch('/:id', cache(300), updateTransaction);

module.exports = router;
