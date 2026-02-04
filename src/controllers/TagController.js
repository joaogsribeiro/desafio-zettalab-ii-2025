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

      // Retorna 201 tanto para criação quanto para tag existente (idempotente)
      return res.status(201).json({
        msg: created ? 'Tag criada com sucesso' : 'Tag já existe',
        tag,
        created
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar tag' });
    }
  },

  // 3. ATUALIZAR UMA TAG PERSONALIZADA
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, color } = req.body;

      // Busca a tag
      const tag = await Tag.findByPk(id);

      if (!tag) {
        return res.status(404).json({ error: 'Tag não encontrada' });
      }

      // Verifica se é uma tag do sistema
      if (tag.user_id === null) {
        return res.status(403).json({ error: 'Tags do sistema não podem ser editadas' });
      }

      // Verifica se a tag pertence ao usuário
      if (tag.user_id !== req.userId) {
        return res.status(403).json({ error: 'Você não tem permissão para editar esta tag' });
      }

      // Se está alterando o nome, verifica conflitos
      if (name && name !== tag.name) {
        // Verifica se já existe tag do sistema com o novo nome
        const systemTag = await Tag.findOne({ 
          where: { name, user_id: null } 
        });
        
        if (systemTag) {
          return res.status(400).json({ 
            error: 'Já existe uma tag do sistema com esse nome. Escolha outro nome.' 
          });
        }

        // Verifica se o usuário já tem outra tag com esse nome
        const duplicateTag = await Tag.findOne({ 
          where: { name, user_id: req.userId, id: { [Op.ne]: id } } 
        });
        
        if (duplicateTag) {
          return res.status(400).json({ 
            error: 'Você já possui uma tag com esse nome' 
          });
        }
      }

      // Atualiza a tag
      await tag.update({ 
        name: name || tag.name, 
        color: color || tag.color 
      });

      return res.json({ 
        msg: 'Tag atualizada com sucesso', 
        tag 
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar tag' });
    }
  },

  // 4. DELETAR UMA TAG PERSONALIZADA
  async destroy(req, res) {
    try {
      const { id } = req.params;

      // Busca a tag
      const tag = await Tag.findByPk(id);

      if (!tag) {
        return res.status(404).json({ error: 'Tag não encontrada' });
      }

      // Verifica se é uma tag do sistema
      if (tag.user_id === null) {
        return res.status(403).json({ error: 'Tags do sistema não podem ser deletadas' });
      }

      // Verifica se a tag pertence ao usuário
      if (tag.user_id !== req.userId) {
        return res.status(403).json({ error: 'Você não tem permissão para deletar esta tag' });
      }

      // Deleta a tag (o Sequelize remove automaticamente as relações N:N)
      await tag.destroy();

      return res.json({ msg: 'Tag deletada com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deletar tag' });
    }
  }
};