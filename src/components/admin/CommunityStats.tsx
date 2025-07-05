import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CommunityStats = () => {
  const membersByRank = [
    { rank: 'Aluno', count: 45, color: '#6b7280' },
    { rank: 'Soldado', count: 89, color: '#16a34a' },
    { rank: 'Cabo', count: 34, color: '#15803d' },
    { rank: 'Sargento', count: 28, color: '#2563eb' },
    { rank: 'Tenente', count: 21, color: '#1d4ed8' },
    { rank: 'Capitão', count: 15, color: '#9333ea' },
    { rank: 'Major', count: 8, color: '#7c3aed' },
    { rank: 'Coronel', count: 5, color: '#dc2626' },
    { rank: 'Comandante', count: 2, color: '#b91c1c' },
  ];

  const membersByCompany = [
    { company: 'Cia A', members: 68 },
    { company: 'Cia B', members: 72 },
    { company: 'Cia C', members: 54 },
    { company: 'Cia D', members: 53 },
  ];

  const growthData = [
    { month: 'Jan', members: 180 },
    { month: 'Fev', members: 195 },
    { month: 'Mar', members: 210 },
    { month: 'Abr', members: 225 },
    { month: 'Mai', members: 232 },
    { month: 'Jun', members: 247 },
  ];

  const activityData = [
    { channel: 'Geral', messages: 234 },
    { channel: 'Treinamentos', messages: 189 },
    { channel: 'Acampamentos', messages: 156 },
    { channel: 'Eventos', messages: 98 },
    { channel: 'Oportunidades', messages: 67 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Estatísticas da Comunidade</h2>
          <p className="text-gray-400">Métricas e análises detalhadas</p>
        </div>

        {/* Growth Chart */}
        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold">Crescimento de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #d4af37',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <Line type="monotone" dataKey="members" stroke="#d4af37" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Members by Rank */}
          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader>
              <CardTitle className="text-military-gold">Distribuição por Patente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={membersByRank}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ rank, count }) => `${rank}: ${count}`}
                  >
                    {membersByRank.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #d4af37',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Members by Company */}
          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader>
              <CardTitle className="text-military-gold">Membros por Companhia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={membersByCompany}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="company" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #d4af37',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Bar dataKey="members" fill="#d4af37" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity by Channel */}
        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold">Atividade por Canal (Últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="channel" type="category" stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #d4af37',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <Bar dataKey="messages" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Taxa de Retenção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">87.5%</div>
              <p className="text-xs text-green-400">+2.1% este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Membros Ativos (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">189</div>
              <p className="text-xs text-green-400">76.5% do total</p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Avg. Tempo Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2h 34m</div>
              <p className="text-xs text-green-400">+15min este mês</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;