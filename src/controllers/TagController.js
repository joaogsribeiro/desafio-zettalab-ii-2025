const { Tag } = require('../database');

module.exports = {
  // 1. LISTAR TAGS DO USUÁRIO
  async index(req, res) {
    try {
      // Busca tags onde o dono é o usuário logado
      const tags = await Tag.findAll({ where: { user_id: req.userId } });
      return res.json(tags);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tags' });
    }
  },

  // 2. CRIAR UMA TAG
  async create(req, res) {
    try {
      const { name, color } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Nome da tag é obrigatório' });
      }

      // findOrCreate evita duplicatas:
      // "Procure uma tag com esse nome E desse usuário. Se não achar, crie com essa cor."
      const [tag, created] = await Tag.findOrCreate({
        where: { name, user_id: req.userId },
        defaults: { color }
      });

      if (!created) {
        // Se já existia, podemos atualizar a cor se o usuário mandou uma nova (opcional)
        // Por enquanto, vamos apenas avisar ou retornar a tag existente.
        // Vamos retornar a tag existente normalmente.
      }

      return res.status(201).json(tag);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar tag' });
    }
  }
};