const Acctype = require('../models/acctypeModel');
const mongoose = require('mongoose');

//GET all Acc types
const getAcctypes = async (req, res) => {
  const acctypes = await Acctype.find({}).sort({ createdAt: -1 });

  res.status(200).json(acctypes);
};

//GET a single acctype
const getAcctype = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such acctype' });
  }

  const acctype = await Acctype.findById(id);
  if (!acctype) {
    return res.status(404).json({ error: 'No such acctype' });
  }

  res.status(200).json(acctype);
};

//PUT a new acctype
const createAcctype = async (req, res) => {
  const { type } = req.body;
  try {
    let acctype = await Acctype.findOne({ type });
    if (!acctype) {
      acctype = await Acctype.create({ type });
    }
    res.status(200).json(acctype);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//DELETE a acctype
const deleteAcctype = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such acctype' });
  }

  const acctype = await Acctype.findOneAndDelete({ _id: id });

  if (!acctype) {
    return res.status(400).json({ error: 'No such user' });
  }

  res.status(200).json(acctype);
};

//UPDATE a acctype
const updateAcctype = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such acctype' });
  }

  const acctype = await Acctype.findOneAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!acctype) {
    return res.status(400).json({ error: 'No such acctype' });
  }

  res.status(200).json(acctype);
};

module.exports = {
  getAcctypes,
  getAcctype,
  createAcctype,
  deleteAcctype,
  updateAcctype,
};
