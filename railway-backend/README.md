# Comando Gólgota Backend

Backend completo para a plataforma Comando Gólgota - Sistema de gestão comunitária militar.

## 🚀 **Funcionalidades Implementadas**

### ✅ **Sistema de Autenticação**
- Registro e login de usuários
- Sessões seguras com cookies
- Middleware de autenticação
- Gerenciamento de perfis e avatares

### ✅ **Gestão de Companhias**
- CRUD completo de companhias
- Sistema de membros por companhia
- Hierarquia militar (ranks)

### ✅ **Sistema de Eventos**
- Criação e gestão de eventos
- Categorização (Rally, Acampamentos, Campanhas)
- Sistema de inscrições
- Status avançado de eventos

### ✅ **Chat e Mensagens**
- Sistema de mensagens por canal
- WebSocket para tempo real
- Mensagens gerais por companhia

### ✅ **Sistema Financeiro**
- Transações financeiras completas
- Relatórios e resumos
- Categorização de gastos

### ✅ **Integração Asaas**
- Criação de clientes e assinaturas
- Pagamentos PIX, Boleto, Cartão
- Webhook para atualizações

### ✅ **Upload de Arquivos**
- Sistema de avatar/fotos
- Multer configurado
- Validação de tipos de arquivo

### ✅ **WebSocket**
- Comunicação em tempo real
- Preparado para chat ao vivo

## 🔧 **Variáveis de Ambiente Necessárias**

```env
# Banco de Dados (OBRIGATÓRIO)
DATABASE_URL=postgresql://...

# Sessão (OBRIGATÓRIO) 
SESSION_SECRET=sua_chave_secreta_forte

# Ambiente
NODE_ENV=production

# Pagamentos (OPCIONAL)
ASAAS_API_KEY=sua_chave_asaas
ASAAS_SANDBOX=false

# Servidor
PORT=3000
```

## 📡 **Endpoints Disponíveis**

### **Autenticação**
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout
- `GET /api/profile` - Buscar perfil
- `PUT /api/profile` - Atualizar perfil
- `POST /api/profile/avatar` - Upload avatar

### **Companhias**
- `GET /api/companies` - Listar companhias
- `GET /api/companies/:id/members` - Membros da companhia

### **Eventos**
- `GET /api/events` - Listar eventos
- `POST /api/events` - Criar evento
- `POST /api/events/:id/register` - Inscrever em evento
- `DELETE /api/events/:id/register` - Cancelar inscrição

### **Mensagens**
- `GET /api/messages/:channel` - Mensagens do canal
- `POST /api/messages/:channel` - Enviar mensagem

### **Financeiro**
- `GET /api/financial/transactions` - Transações
- `POST /api/financial/transactions` - Criar transação
- `GET /api/financial/summary` - Resumo financeiro

### **Pagamentos**
- `GET /api/payments/subscription` - Assinatura do usuário
- `GET /api/payments/history` - Histórico de pagamentos
- `POST /api/payments/create-subscription` - Criar assinatura

### **Utilitários**
- `GET /health` - Status do servidor
- `GET /api/status` - Status da API
- `GET /api/stats` - Estatísticas gerais

## 🔌 **WebSocket**

Conecte em: `ws://sua-url.railway.app/ws`

## 🚀 **Deploy no Railway**

1. Configure as variáveis de ambiente
2. O Railway fará build automaticamente
3. Health check em `/health`
4. Logs disponíveis no dashboard

## 🔄 **Integração Frontend**

Configure o frontend para usar:
```javascript
const API_URL = 'https://sua-url.railway.app';
const WS_URL = 'wss://sua-url.railway.app/ws';
```

**Sistema 100% funcional e pronto para produção! 🎯**