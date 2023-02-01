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


const router = express.Router();

//Call authorization middleware for all routes below
router.use(auth)

//GET all accounts
router.get('/', getAccounts)

//GET a single account
router.get('/:id', getAccount)

//GET accounts with pagination
router.get('/:page/:limit', getAccountsPagination)

//PUT a new account (idempotent)
router.put('/', createAccount)

//DELETE a account
router.delete('/:id', deleteAccount)

//UPDATE a account
router.patch('/:id', updateAccount)

module.exports = router;