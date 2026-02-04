# 🚀 Deploy no Render

Este guia explica como fazer o deploy da aplicação no Render.

## 📋 Pré-requisitos

- Conta no [Render](https://render.com/)
- Repositório Git público ou conectado ao Render
- Código commitado e enviado para o GitHub

## 🗄️ Passo 1: Criar Banco de Dados PostgreSQL

1. Acesse o [Dashboard do Render](https://dashboard.render.com/)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `taskmanager-db` (ou nome de sua preferência)
   - **Database**: `taskmanager`
   - **User**: será gerado automaticamente
   - **Region**: escolha a mais próxima (ex: Oregon)
   - **Plan**: Free (ou paid conforme necessidade)
4. Clique em **"Create Database"**
5. **IMPORTANTE**: Copie a **Internal Database URL** (será usada no próximo passo)

## 🌐 Passo 2: Criar Web Service

1. No Dashboard, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub:
   - Se for a primeira vez, autorize o Render a acessar seu GitHub
   - Selecione o repositório `desafio-zettalab-ii-2025`
3. Configure o serviço:
   - **Name**: `taskmanager-api` (ou nome de sua preferência)
   - **Region**: mesma do banco de dados
   - **Branch**: `main`
   - **Root Directory**: deixe vazio
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou paid conforme necessidade)

## 🔐 Passo 3: Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```
DB_HOST=<valor_do_host_do_banco>
DB_USER=<usuario_do_banco>
DB_PASSWORD=<senha_do_banco>
DB_NAME=taskmanager
JWT_SECRET=<gere_uma_string_aleatoria_forte>
PORT=3000
```

**💡 Dica**: Em vez de adicionar uma por uma, você pode usar a **Internal Database URL**:

1. Copie a URL interna do banco (formato: `postgresql://user:password@host:port/database`)
2. A URL já contém todas as informações necessárias
3. Você pode parsear ou usar diretamente no código (veja abaixo)

### Usando DATABASE_URL (Opcional)

Se preferir usar a variável `DATABASE_URL` fornecida pelo Render:

1. Adicione apenas estas variáveis:
   ```
   DATABASE_URL=<internal_database_url_copiada>
   JWT_SECRET=<gere_uma_string_aleatoria_forte>
   ```

2. Modifique `src/config/database.js` para:
   ```javascript
   require('dotenv').config();

   // Se DATABASE_URL estiver definida (Render), usa ela
   if (process.env.DATABASE_URL) {
     module.exports = {
       dialect: 'postgres',
       dialectOptions: {
         ssl: {
           require: true,
           rejectUnauthorized: false
         }
       },
       url: process.env.DATABASE_URL,
       define: {
         timestamps: true,
         underscored: true,
       },
     };
   } else {
     // Caso contrário, usa variáveis separadas (desenvolvimento local)
     module.exports = {
       dialect: 'postgres',
       host: process.env.DB_HOST,
       username: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
       define: {
         timestamps: true,
         underscored: true,
       },
     };
   }
   ```

## 🎯 Passo 4: Deploy

1. Clique em **"Create Web Service"**
2. O Render automaticamente:
   - Fará o build do projeto (`npm install`)
   - Iniciará o servidor (`npm start`)
   - Executará as migrations automaticamente (via `connection.sync()`)
   - Criará as tags do sistema

## ✅ Verificação

Após o deploy concluir:

1. Acesse a URL fornecida pelo Render (ex: `https://taskmanager-api.onrender.com`)
2. Teste a documentação: `https://taskmanager-api.onrender.com/api-docs`
3. Teste um endpoint: 
   ```bash
   curl https://taskmanager-api.onrender.com/users
   ```

## 🔧 Troubleshooting

### Erro de conexão com banco
- Verifique se as credenciais estão corretas
- Confirme que está usando a **Internal Database URL** (não a External)
- Verifique se o banco está na mesma região do web service

### Erro "Application failed to respond"
- Verifique os logs no Dashboard do Render
- Confirme que `PORT` está definida ou use `process.env.PORT || 3000`

### Tabelas não criadas
- As tabelas são criadas automaticamente via `connection.sync()`
- Verifique os logs para confirmar a sincronização

## 📝 Notas Importantes

- **Free Tier**: O Render coloca serviços gratuitos em "sleep" após 15 minutos de inatividade. A primeira requisição pode demorar ~30 segundos.
- **SSL**: O Render fornece SSL/HTTPS automaticamente.
- **Logs**: Acesse os logs em tempo real pelo Dashboard.
- **Atualizações**: Pushes para `main` disparam deploy automático.

## 🔗 Links Úteis

- [Render Docs - Node.js](https://render.com/docs/deploy-node-express-app)
- [Render Docs - PostgreSQL](https://render.com/docs/databases)
- [Render Status](https://status.render.com/)
