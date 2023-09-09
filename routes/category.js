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

const cache = require('../routeCache');

const router = express.Router();

//Call authorization middleware for all routes below
router.use(auth)

//GET all categories
router.get('/', cache(300), getCategories)

/**
 * @swagger
 * /api/categories/type/{type}:
 *   get:
 *     description: |
 *       Gets All Categories According to "type" Specified In Path
 *       type should be 'income' OR 'expense'
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         description: Transaction type. Value should be 'income' OR 'expense'
 *         schema:
 *           type: string
 *       - in: header
 *         name: jwt
 *         description: JWT Token
 *         type: string
 *     responses:
 *       '200':
 *         description: Returns an array of category objects of the specified type
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
//GET categories by type
router.get('/type/:type', cache(300), getCategoriesByType)

//GET categories with pagination
router.get('/:page/:limit', cache(300), getCategoriesPagination)

//GET a single category
router.get('/:id', cache(300), getCategory)

//PUT a new category (idempotent)
router.put('/', cache(300), createCategory)

//DELETE a category
router.delete('/:id', cache(300), deleteCategory)

//UPDATE a category
router.patch('/:id', cache(300), updateCategory)

module.exports = router;