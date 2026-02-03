const yup = require('yup');

module.exports = {
  async validateCreate(req, res, next) {
    try {
      const schema = yup.object().shape({
        title: yup.string().required('O título da tarefa é obrigatório'),
        description: yup.string(), // Opcional, mas se vier tem que ser string
        tags: yup.array().of(yup.number()), // Opcional, mas deve ser array de números (IDs)
      });

      await schema.validate(req.body, { abortEarly: false });
      return next();
    } catch (error) {
      return res.status(400).json({ 
        error: 'Erro de validação', 
        messages: error.errors 
      });
    }
  }
};