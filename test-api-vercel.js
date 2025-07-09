// Teste rápido da API Vercel
import { VercelStorage } from './api/db-vercel.js';

async function testDatabase() {
  console.log('🧪 Testando conexão com banco...');
  
  const storage = new VercelStorage();
  
  try {
    // Teste 1: Buscar usuário por email
    console.log('Teste 1: Buscar admin por email...');
    const admin = await storage.getUserByEmail('chpsalgado@hotmail.com');
    console.log('Admin encontrado:', admin ? '✅' : '❌');
    
    if (admin) {
      console.log('- ID:', admin.id);
      console.log('- Nome:', admin.name);
      console.log('- Email:', admin.email);
      
      // Teste 2: Buscar perfil do admin
      console.log('\nTeste 2: Buscar perfil do admin...');
      const profile = await storage.getUserProfile(admin.id);
      console.log('Perfil encontrado:', profile ? '✅' : '❌');
      
      if (profile) {
        console.log('- Nome:', profile.name);
        console.log('- Rank:', profile.rank);
        console.log('- Company:', profile.company);
      }
    }
    
    // Teste 3: Buscar usuários por rank
    console.log('\nTeste 3: Buscar todos os usuários...');
    const users = await storage.getUsersByRank();
    console.log('Usuários encontrados:', users.length);
    
    console.log('\n✅ Todos os testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

testDatabase();