
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Trainings from '@/components/Trainings';
import Camps from '@/components/Camps';
import Schedule from '@/components/Schedule';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-military-black">
      <Header />
      <Hero />
      <About />
      <Trainings />
      <Camps />
      <Schedule />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
