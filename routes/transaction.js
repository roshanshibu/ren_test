const { json } = require('express');
const express = require('express');
const auth = require("../middleware/auth");

//import controller functions
const {
    getTransactions,
    getTransaction,
    createTransaction,
    deleteTransaction,
    updateTransaction
} = require('../controllers/transactionController')


const router = express.Router();

//Call authorization middleware for all routes below
router.use(auth)

//GET all transactions
router.get('/:accountID', getTransactions)

//GET a single transaction
router.get('/:accountID/:id', getTransaction)

//POST a new transaction
router.post('/', createTransaction)

//DELETE a transaction
router.delete('/:accountID/:id', deleteTransaction)

//UPDATE a transaction
router.patch('/:accountID/:id', updateTransaction)

module.exports = router;