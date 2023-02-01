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

const router = express.Router();

//Call authorization middleware for all routes below
router.use(auth);

//GET all transactions
router.get('/', getTransactions);

//GET specific transactions
router.get('/:year/:month', getSpecificTransactions);

//GET transactions with pagination
router.get('/:page/:limit', getTransactionsPagination);

//GET a single transaction
router.get('/:id', getTransaction);

//PUT a new transaction
router.put('/', checkTransactionCreation);

//DELETE a transaction
router.delete('/:id', deleteTransaction);

//UPDATE a transaction
router.patch('/:id', updateTransaction);

module.exports = router;
