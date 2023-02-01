const { json } = require('express');
const express = require('express');
const auth = require("../middleware/auth");

//import controller functions
const {
    getUsers,
    getUser,
    getUsersPagination,
    createUser,
    authorizeOauth2User,
    authenticateUser,
    deleteUser,
    updateUser
} = require('../controllers/userController')


const router = express.Router();

/**
 * @swagger
 * /api/users/:
 *   post:
 *     description: Creates a new user - User Registration
 *     tags:
 *       - Users
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user to create.
 *         schema:
 *           type: object
 *           required:
 *             - firstname
 *             - lastname
 *             - email
 *             - password
 *             - currency
 *           properties:
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *             currency:
 *               type: string
 *     responses:
 *       '200':
 *         description: A User object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               currency:
 *                 type: string 
 *               _id:
 *                 type: string 
 *               createdAt:
 *                 type: string 
 *               updatedAt:
 *                 type: string 
 *       '400':
 *         description : Error
 */
//CREATE a user - SIGN UP
router.put('/', createUser)

/**
 * @swagger
 * /api/users/auth:
 *   post:
 *     description: User Authenitaction
 *     tags:
 *       - Users
 *     parameters:
 *       - in: body
 *         name: user
 *         description: User to authenticate
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       '200':
 *         description: A JWT Token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             properties:
 *               token:
 *                 type: string
 *       '401':
 *         description : Authentication Failed
 *       '404':
 *         description : User Not Found
 *       '400':
 *         description : Error
 */
//AUTHENTICATE a user - LOGIN
router.post('/auth', authenticateUser)

//CREATE a user if not registered - on Oauth2 login
router.post('/oauthlogin', authorizeOauth2User)

//Call authorization middleware for all routes below
router.use(auth)

//GET all users
router.get('/', getUsers)

//Get users with pagination
router.get('/:page/:limit', getUsersPagination)

//GET a single user profile
router.get('/profile', getUser)

//DELETE a user
router.delete('/:id', deleteUser)

//UPDATE a user
router.patch('/', updateUser)

module.exports = router;