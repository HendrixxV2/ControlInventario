const userModel = require('../models/userModel');

exports.list = async (req, res) => {
  res.json(await userModel.list());
};
