const yup = require('yup');

module.exports = {
  // Validação para CADASTRO DE USUÁRIO
  async validateCreate(req, res, next) {
    try {
      // Define as regras
      const schema = yup.object().shape({
        name: yup.string().required('O nome é obrigatório'),
        email: yup.string().email('Insira um email válido').required('O email é obrigatório'),
        password: yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres').required('A senha é obrigatória'),
      });

      // Valida o corpo da requisição
      await schema.validate(req.body, { abortEarly: false });

      return next(); // Se passou, segue para o Controller
    } catch (error) {
      // Se falhar, retorna erro 400 (Bad Request) com as mensagens
      return res.status(400).json({ 
        error: 'Erro de validação', 
        messages: error.errors 
      });
    }
  }
};