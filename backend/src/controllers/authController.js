const authService = require('../services/authService');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  res.json(await authService.login(email, password));
};