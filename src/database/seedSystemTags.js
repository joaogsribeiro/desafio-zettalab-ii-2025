const { Tag } = require('./index');

// Tags padrões do sistema que estarão disponíveis para todos os usuários
const systemTags = [
  { name: 'Urgente', color: '#DC2626' },      // Vermelho
  { name: 'Importante', color: '#EA580C' },   // Laranja
  { name: 'Trabalho', color: '#2563EB' },     // Azul
  { name: 'Pessoal', color: '#7C3AED' },      // Roxo
  { name: 'Estudo', color: '#059669' },       // Verde
  { name: 'Lazer', color: '#DB2777' },        // Rosa
  { name: 'Saúde', color: '#0891B2' },        // Ciano
  { name: 'Financeiro', color: '#CA8A04' },   // Amarelo escuro
];

async function seedSystemTags() {
  try {
    console.log('🌱 Inicializando tags do sistema...');
    
    for (const tagData of systemTags) {
      // Cria tag do sistema (user_id = null)
      const [tag, created] = await Tag.findOrCreate({
        where: { name: tagData.name, user_id: null },
        defaults: { color: tagData.color }
      });

      if (created) {
        console.log(`✅ Tag criada: ${tag.name}`);
      } else {
        console.log(`ℹ️  Tag já existe: ${tag.name}`);
      }
    }

    console.log('✨ Tags do sistema inicializadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar tags do sistema:', error);
  }
}

module.exports = seedSystemTags;
