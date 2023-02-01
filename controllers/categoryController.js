const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

//GET all Categories
const getCategories = async (req, res) => {

  const type = req.query.type;
  const name = req.query.name;

  const query = {};
  query.userID = req.headers.jwt.userId;
  if (type) query.type = type;
  if (name) query.name = name;

  const categories = await Category.find(query).sort({ createdAt: -1 });

  res.status(200).json(categories);
};

const getCategoriesPagination = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 10;

  const categories = await Category.find({
    userID: req.headers.jwt.userId,
  })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalCategories = await Category.countDocuments({
    userID: req.headers.jwt.userId,
  });

  const pagination = {
    currentPage: page,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalCategories / limit),
    totalItems: totalCategories,
  };

  res.status(200).json({ categories, pagination });
};

//GET Categories by type
const getCategoriesByType = async (req, res) => {
  const { type } = req.params;

  const categories = await Category.find({type: type});

  res.status(200).json(categories);
};

//GET a single Category
const getCategory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such Category' });
  }

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({ error: 'No such Category' });
  }

  if (category.userID != req.headers.jwt.userId)
    //if category does not belong to the user
    return res.status(404).json({ error: 'No such Category' });

  res.status(200).json(category);
};

//PUT a new Category
const createCategory = async (req, res) => {
  const { type, name, accountID, icon, color } = req.body;
  const userID = req.headers.jwt.userId;
  try {
    let category = await Category.findOne({
      name,
      userID,
    });
    if (!category) {
      category = await Category.create({
        type,
        name,
        accountID,
        userID,
        icon,
        color,
      });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//DELETE a Category
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such Category' });
  }

  const category = await Category.findOneAndDelete({
    _id: id,
    userID: req.headers.jwt.userId,
  });

  if (!category) {
    return res.status(400).json({ error: 'No such Category' });
  }

  res.status(200).json(category);
};

//UPDATE a Category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such Category' });
  }

  const user = await Category.findOneAndUpdate(
    { _id: id, userID: req.headers.jwt.userId },
    {
      ...req.body,
    }
  );

  if (!category) {
    return res.status(400).json({ error: 'No such Category' });
  }

  res.status(200).json(category);
};

module.exports = {
  getCategories,
  getCategoriesPagination,
  getCategoriesByType,
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,
};
