import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { apiGet } from '@/lib/api';

const CommunityStats = () => {
  const [membersByRank, setMembersByRank] = useState<any[]>([]);
  const [membersByCompany, setMembersByCompany] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiGet('/api/stats');
      
      // Transform rank data with colors
      const rankColors = {
        'aluno': '#6b7280',
        'soldado': '#16a34a',
        'cabo': '#15803d',
        'sargento': '#2563eb',
        'tenente': '#1d4ed8',
        'capitao': '#9333ea',
        'major': '#7c3aed',
        'coronel': '#dc2626',
        'comandante': '#b91c1c',
        'admin': '#f59e0b'
      };

      const rankData = data.membersByRank?.map((item: any) => ({
        rank: item.rank.charAt(0).toUpperCase() + item.rank.slice(1),
        count: item.count,
        color: rankColors[item.rank as keyof typeof rankColors] || '#6b7280'
      })) || [];

      const companyData = data.membersByCompany?.map((item: any) => ({
        company: item.company,
        members: item.count
      })) || [];

      setMembersByRank(rankData);
      setMembersByCompany(companyData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder data for charts that require historical data
  const growthData = [
    { month: 'Jan', members: 0 },
    { month: 'Fev', members: 0 },
    { month: 'Mar', members: 0 },
    { month: 'Abr', members: 0 },
    { month: 'Mai', members: 1 },
    { month: 'Jun', members: 2 },
  ];

  const activityData = [
    { channel: 'Geral', messages: 1 },
    { channel: 'Treinamentos', messages: 0 },
    { channel: 'Acampamentos', messages: 0 },
    { channel: 'Eventos', messages: 0 },
    { channel: 'Oportunidades', messages: 0 },
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