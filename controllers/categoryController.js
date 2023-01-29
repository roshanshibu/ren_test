const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

//GET all Categories
const getCategories = async (req, res) => {
  const categories = await Category.find({userID: req.headers.jwt.userId}).sort({ createdAt: -1 });

  res.status(200).json(categories);
};

//GET Categories by ctype
const getCategoriesByType = async (req, res) => {
  const { ctype } = req.params;

  const categories = await Category.find({type: ctype});

  res.status(200).json(categories);
}

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

  if(category.userID != req.headers.jwt.userId) //if category does not belong to the user
  return res.status(404).json({ error: 'No such Category' });

  res.status(200).json(category);
};

//POST a new Category
const createCategory = async (req, res) => {
  const { ctype, cname, iconID, colorhex } = req.body;
  const userID = req.headers.jwt.userId;
  try {
    const category = await Category.create({
      ctype,
      cname,
      userID,
      iconID,
      colorhex,
    });
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

  const category = await Category.findOneAndDelete({ _id: id, userID: req.headers.jwt.userId });

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
  getCategoriesByType,
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,
};
