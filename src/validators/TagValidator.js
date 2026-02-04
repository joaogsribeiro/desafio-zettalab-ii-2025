const yup = require('yup');

module.exports = {
  async validateCreate(req, res, next) {
    try {
      const schema = yup.object().shape({
        name: yup.string().required('O nome da tag é obrigatório'),
        color: yup.string().matches(
          /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          'Cor inválida. Use formato hexadecimal (#RRGGBB ou #RGB)'
        ).optional()
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
