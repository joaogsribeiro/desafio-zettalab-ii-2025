const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const authConfig = require('../config/auth');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verifica se o token foi enviado
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // O header vem assim: "Bearer eyJhbGci..."
  // Dividimos pelo espaço para pegar só a segunda parte (o token em si)
  const [, token] = authHeader.split(' ');

  try {
    // 2. Decodifica e valida o token
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // 3. Salva o ID do usuário dentro da requisição
    // Isso é MUITO importante: todas as rotas que vierem depois
    // vão saber automaticamente qual usuário está logado!
    req.userId = decoded.id;

    return next(); // Pode passar!
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};