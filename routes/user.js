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

const cache = require('../routeCache');

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
 *         description: A Token object
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
 *         description : Error / Try Sign-In With Google
 */
//AUTHENTICATE a user - LOGIN
router.post('/auth', cache(300), authenticateUser)

//CREATE a user if not registered - on Oauth2 login
router.post('/oauthlogin', cache(300), authorizeOauth2User)

//Call authorization middleware for all routes below
router.use(auth)

//GET all users
router.get('/', cache(300), getUsers)

//Get users with pagination
router.get('/:page/:limit', cache(300), getUsersPagination)

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     description: Gets User Info for Profile Page
 *     tags:
 *       - Users
 *     parameters:
 *       - in: header
 *         name: jwt
 *         description: JWT Token
 *         type: string
 *     responses:
 *       '200':
 *         description: A User object
 *         contents:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *                 currency:
 *                   type: string 
 *                 _id:
 *                   type: string 
 *                 createdAt:
 *                   type: string 
 *                 updatedAt:
 *                   type: string 
 *               example:
 *                 firstname: tana
 *       '404':
 *         description : No such user
 *       '400':
 *         description : Error
 */
//GET a single user profile
router.get('/profile', cache(300), getUser)

//DELETE a user
router.delete('/:id', cache(300), deleteUser)

/**
 * @swagger
 * /api/users/:
 *   patch:
 *     description: Edit User Details From Profile Page
 *     tags:
 *       - Users
 *     parameters:
 *       - in: header
 *         name: jwt
 *         description: JWT Token
 *         type: string
 *       - in: body
 *         name: user
 *         description: Updated User Details
 *         schema:
 *           type: object
 *           properties:
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *             currency:
 *               type: string
 *     responses:
 *       '200':
 *         description: A User object with Updated Details
 *         contents:
 *           application/json:
 *             schema:
 *               type: object
 *       '404':
 *         description : No such user
 *       '400':
 *         description : Error
 */
//UPDATE a user
router.patch('/', cache(300), updateUser)

module.exports = router;