const { json } = require('express');
const express = require('express');
const auth = require("../middleware/auth");

//import controller functions
const {
    getCategories,
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

//GET categories by type
router.get('/type/:type', getCategoriesByType)

//GET a single category
router.get('/:id', getCategory)

//POST a new category
router.post('/', createCategory)

//DELETE a category
router.delete('/:id', deleteCategory)

//UPDATE a category
router.patch('/:id', updateCategory)

module.exports = router;