const { Task, Tag } = require('../database');

module.exports = {
  // 1. LISTAR TAREFAS (Com filtro de Status E Tag)
  async index(req, res) {
    try {
      const { status, tag_id } = req.query; // Agora pegamos o tag_id da URL
      const where = { user_id: req.userId };

      if (status) {
        where.status = status;
      }

      // Configuração da busca de Tags
      const includeOptions = {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name', 'color'],
        through: { attributes: [] }
      };

      // SE tiver filtro de tag, adicionamos a regra dentro do include
      if (tag_id) {
        includeOptions.where = { id: tag_id };
        // Isso força um "INNER JOIN". Ou seja:
        // Se a tarefa não tiver essa tag, ela nem aparece na lista.
        includeOptions.required = true; 
      }

      const tasks = await Task.findAll({
        where,
        include: [includeOptions]
      });

      return res.json(tasks);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar tarefas' });
    }
  },

  // 2. CRIAR TAREFA (Com suporte a Tags)
  async create(req, res) {
    try {
      const { title, description, tags } = req.body; // Recebe o array de tags

      if (!title) {
        return res.status(400).json({ error: 'O título é obrigatório' });
      }

      // 1. Cria a tarefa
      const task = await Task.create({
        user_id: req.userId,
        title,
        description,
      });

      // 2. Se vieram tags, associa elas à tarefa
      if (tags && tags.length > 0) {
        // A mágica do Sequelize: ele insere na tabela 'task_tags' automaticamente
        await task.setTags(tags);
      }

      // 3. Recarrega a tarefa para devolver o JSON já com as tags dentro
      const taskWithTags = await Task.findByPk(task.id, {
        include: [
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'color'],
            through: { attributes: [] }
          }
        ]
      });

      return res.status(201).json(taskWithTags);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
  },

  // 3. ATUALIZAR TAREFA (Também pode atualizar tags se quiser)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, status, tags } = req.body;

      const task = await Task.findOne({ where: { id, user_id: req.userId } });

      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      // Atualiza dados básicos
      await task.update({ title, description, status });

      // Se mandou tags novas, atualiza os vínculos (substitui as antigas pelas novas)
      if (tags) {
        await task.setTags(tags);
      }

      // Recarrega a tarefa com as tags atualizadas
      const taskWithTags = await Task.findByPk(task.id, {
        include: [
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'color'],
            through: { attributes: [] }
          }
        ]
      });

      return res.status(200).json({
        msg: 'Tarefa atualizada com sucesso',
        task: taskWithTags
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
  },

  // 4. DELETAR TAREFA (Igual ao anterior)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findOne({ where: { id, user_id: req.userId } });

      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      await task.destroy();
      return res.status(200).json({ msg: 'Tarefa deletada com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
  }
};