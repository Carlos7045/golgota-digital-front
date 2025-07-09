# Comando Gólgota Backend

Backend API para a plataforma da comunidade Comando Gólgota.

## Configuração para Deploy no Railway

### 1. Pré-requisitos
- Conta no Railway (https://railway.app)
- Database PostgreSQL configurado (pode usar o próprio PostgreSQL do Railway)

### 2. Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no Railway:

```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secret-session-key-here
ASAAS_API_KEY=your-asaas-api-key-here
ASAAS_SANDBOX=false
NODE_ENV=production
PORT=5000
```

### 3. Deploy no Railway

1. Faça login no Railway
2. Crie um novo projeto
3. Conecte ao repositório GitHub
4. Configure o root directory como `railway-backend`
5. Adicione as variáveis de ambiente
6. Deploy será automático

### 4. Configuração do Database

Se usar PostgreSQL do Railway:
1. Adicione o PostgreSQL add-on
2. Use a DATABASE_URL fornecida pelo Railway
3. Execute as migrações: `npm run db:push`

### 5. Health Check

O backend inclui um endpoint de health check em `/health` para monitoramento.

## Comandos Disponíveis

- `npm start`: Inicia o servidor em produção
- `npm run dev`: Inicia em modo desenvolvimento
- `npm run build`: Compila o TypeScript
- `npm run db:push`: Executa migrações do banco