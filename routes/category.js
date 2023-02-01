const { json } = require('express');
const express = require('express');
const auth = require("../middleware/auth");

//import controller functions
const {
    getCategories,
    getCategoriesPagination,
    getCategoriesByType,
    getCategory,
    createCategory,
    deleteCategory,
    updateCategory
} = require('../controllers/categoryController')


const router = express.Router();

//Call authorization middleware for all routes below
router.use(auth)

//GET all categories
router.get('/', getCategories)

//GET categories with pagination
router.get('/:page/:limit', getCategoriesPagination)

//GET categories by type
router.get('/type/:type', getCategoriesByType)

//GET a single category
router.get('/:id', getCategory)

//PUT a new category (idempotent)
router.put('/', createCategory)

//DELETE a category
router.delete('/:id', deleteCategory)

//UPDATE a category
router.patch('/:id', updateCategory)

module.exports = router;