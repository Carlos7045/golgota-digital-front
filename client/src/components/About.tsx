
import { Shield, Target, Users, Award } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Missão',
      description: 'Capacitar missionários e líderes através de treinamentos transformadores'
    },
    {
      icon: Target,
      title: 'Disciplina',
      description: 'Formação baseada em princípios militares e valores cristãos'
    },
    {
      icon: Users,
      title: 'Humildade',
      description: 'Trabalho em equipe, submissão e serviço ao próximo'
    },
    {
      icon: Award,
      title: 'Bravura',
      description: 'Coragem para enfrentar desafios e superar limitações'
    }
  ];

  return (
    <section id="sobre" className="py-20 bg-section-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-divider mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sobre o <span className="text-military-gold">Comando Gólgota</span>
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Capacitamos missionários e líderes por meio de treinamentos como 
            <span className="text-military-gold font-semibold"> Rally Missionário, Acampamento Gólgota, CPLG e FEG</span>, 
            promovendo trabalho em equipe, superação e compromisso espiritual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div 
              key={value.title}
              className="military-badge bg-military-black-light border border-military-gold/20 rounded-lg p-6 text-center hover:border-military-gold/40 transition-all duration-300 hover:transform hover:scale-105"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-military-gold/20 rounded-full flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-military-gold" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
              <p className="text-gray-400 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a 
            href="#treinamentos" 
            className="inline-flex items-center text-military-gold hover:text-military-gold-light transition-colors duration-200 font-semibold"
          >
            Conheça nossos treinamentos
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;
