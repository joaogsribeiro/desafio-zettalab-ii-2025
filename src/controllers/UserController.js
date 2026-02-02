const { User }= require('../database'); // Importa o modelo que acabamos de criar

module.exports = {
  // Função para criar um novo usuário
  async create(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validação básica (depois podemos melhorar)
      if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Preencha todos os campos obrigatórios' });
      }

      // Verifica se já existe usuário com este email
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ msg: 'Email já cadastrado' });
      }

      // Cria o usuário no banco
      // O Hook do User.js vai rodar aqui automaticamente e criptografar a senha!
      const user = await User.create({
        name,
        email,
        password_hash: password, // Passamos a senha, o hook converte para hash
      });

      // Retorna sucesso (201 = Created) e os dados (exceto a senha!)
      return res.status(201).json({
        msg: 'Usuário criado com sucesso!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      });

    } catch (error) {
      console.error(error);
      // Retorna erro interno (500)
      return res.status(500).json({ msg: 'Erro ao criar usuário' });
    }
  }
};