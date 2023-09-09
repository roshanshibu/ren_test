const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

//GET all Categories
const getCategories = async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 });

  const categoriesWithLinks = categories.map(category => {
    return {
      ...category.toObject(),
      links: [
        {
          rel: "self",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`
        },
        {
          rel: "delete",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
          method: "DELETE"
        },
        {
          rel: "update",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
          method: "PATCH"
        }
      ]
    };
  });

  res.status(200).json(categoriesWithLinks);
};

const getCategoriesPagination = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 10;

  const categories = await Category.find({})
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalCategories = await Category.countDocuments({});

  const pagination = {
    currentPage: page,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalCategories / limit),
    totalItems: totalCategories,
  };

  const categoriesWithLinks = categories.map(category => {
    return {
      ...category.toObject(),
      links: [
        {
          rel: "self",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`
        },
        {
          rel: "delete",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
          method: "DELETE"
        },
        {
          rel: "update",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
          method: "PATCH"
        }
      ]
    };
  });

  res.status(200).json(categoriesWithLinks, pagination);
};

//GET Categories by type
const getCategoriesByType = async (req, res) => {
  const { type } = req.params;

  const categories = await Category.find({ type: type });

  const categoriesWithLinks = categories.map(category => {
    return {
      ...category.toObject(),
      links: [
        {
          rel: "self",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`
        },
        {
          rel: "delete",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
          method: "DELETE"
        },
        {
          rel: "update",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
          method: "PATCH"
        }
      ]
    };
  });

  res.status(200).json(categoriesWithLinks);
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

  const categoryWithLinks = {
    ...category.toObject(),
    links: [
      {
        rel: "self",
        href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`
      },
      {
        rel: "delete",
        href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
        method: "DELETE"
      },
      {
        rel: "update",
        href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
        method: "PATCH"
      }
    ]
  };
  res.status(200).json(categoryWithLinks);
};

//PUT a new Category
const createCategory = async (req, res) => {
  const { type, name, icon, color } = req.body;
  try {
    let category = await Category.findOne({
      name,
    });
    if (!category) {
      category = await Category.create({
        type,
        name,
        icon,
        color,
      });
    }
    const categoryWithLinks = {
      ...category.toObject(),
      links: [
        {
          rel: "self",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`
        },
        {
          rel: "delete",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
          method: "DELETE"
        },
        {
          rel: "update",
          href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
          method: "PATCH"
        }
      ]
    };
    res.status(200).json(categoryWithLinks);
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

  const categoryWithLinks = {
    ...category.toObject(),
    links: [
      {
        rel: "self",
        href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`
      },
      {
        rel: "delete",
        href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
        method: "DELETE"
      },
      {
        rel: "update",
        href: `${req.protocol}://${req.get("host")}/api/categories/${category._id}`,
        method: "PATCH"
      }
    ]
  };
  res.status(200).json(categoryWithLinks);
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
