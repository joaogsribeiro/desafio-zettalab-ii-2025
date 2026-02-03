const { Tag } = require('../database');
const { Op } = require('sequelize');

module.exports = {
  // 1. LISTAR TAGS DO USUÁRIO + TAGS DO SISTEMA
  async index(req, res) {
    try {
      // Busca tags do sistema (user_id = null) + tags do próprio usuário
      const tags = await Tag.findAll({ 
        where: { 
          [Op.or]: [
            { user_id: null },        // Tags do sistema
            { user_id: req.userId }   // Tags do usuário
          ]
        },
        order: [
          ['user_id', 'ASC'],  // Tags do sistema aparecem primeiro (NULL vem antes)
          ['name', 'ASC']
        ]
      });
      return res.json(tags);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tags' });
    }
  },

  // 2. CRIAR UMA TAG PERSONALIZADA DO USUÁRIO
  async create(req, res) {
    try {
      const { name, color } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Nome da tag é obrigatório' });
      }

      // Verifica se já existe tag do sistema com esse nome
      const systemTag = await Tag.findOne({ 
        where: { name, user_id: null } 
      });
      
      if (systemTag) {
        return res.status(400).json({ 
          error: 'Já existe uma tag do sistema com esse nome. Use a tag existente ou escolha outro nome.' 
        });
      }

      // findOrCreate evita duplicatas do próprio usuário
      const [tag, created] = await Tag.findOrCreate({
        where: { name, user_id: req.userId },
        defaults: { color: color || '#ddd' }
      });

      if (!created) {
        return res.status(200).json({ 
          msg: 'Você já possui uma tag com esse nome',
          tag 
        });
      }

      return res.status(201).json(tag);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar tag' });
    }
  }
};