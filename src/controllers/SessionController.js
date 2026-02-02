const jwt = require('jsonwebtoken');
const { User } = require('../database');
const authConfig = require('../config/auth');

module.exports = {
  async store(req, res) {
    const { email, password } = req.body;

    // 1. Verifica se o usuário existe
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // 2. Verifica se a senha bate (usando aquele método que criamos no Model)
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // 3. Se passou, gera o Token
    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      // Aqui a mágica acontece: assinamos o token com o ID do usuário
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
};