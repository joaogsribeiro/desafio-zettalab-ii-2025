const { Task } = require('../database');

module.exports = {
  // 1. LISTAR TAREFAS (Com filtro opcional de status)
  async index(req, res) {
    try {
      const { status } = req.query; // Pega o ?status=PENDING da URL se existir
      const where = { user_id: req.userId }; // Filtro base: só tarefas do usuário logado

      // Se o usuário mandou um status, adiciona ao filtro
      if (status) {
        where.status = status;
      }

      const tasks = await Task.findAll({ where });
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tarefas' });
    }
  },

  // 2. CRIAR TAREFA
  async create(req, res) {
    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'O título é obrigatório' });
      }

      const task = await Task.create({
        user_id: req.userId, // Pega o ID do token (Segurança!)
        title,
        description,
      });

      return res.status(201).json(task);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
  },

  // 3. ATUALIZAR TAREFA
  async update(req, res) {
    try {
      const { id } = req.params; // Pega o ID da URL (/tasks/1)
      const { title, description, status } = req.body;

      // Busca a tarefa garantindo que ela pertence ao usuário logado
      const task = await Task.findOne({ where: { id, user_id: req.userId } });

      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      // Atualiza os campos
      await task.update({ title, description, status });

      return res.json(task);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
  },

  // 4. DELETAR TAREFA
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Busca a tarefa garantindo que ela pertence ao usuário logado
      const task = await Task.findOne({ where: { id, user_id: req.userId } });

      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      await task.destroy();

      return res.status(204).send(); // 204 = No Content (Sucesso sem corpo)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
  }
};