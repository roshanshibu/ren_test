const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

//GET all Categories
const getCategories = async (req, res) => {
  const categories = await User.find({}).sort({ createdAt: -1 });

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

  res.status(200).json(category);
};

//POST a new Category
const createCategory = async (req, res) => {
  const { ctype, cname, userID, iconID, colorhex } = req.body;
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
    res.status(400).json({ error: error.msg }); //error messages not working
  }
};

//DELETE a Category
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such Category' });
  }

  const category = await Category.findOneAndDelete({ _id: id });

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
    { _id: id },
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
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,
};
