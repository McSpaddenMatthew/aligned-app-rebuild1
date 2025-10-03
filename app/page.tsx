import Header from '../components/marketing/Header';
import Hero from '../components/marketing/Hero';
import WhyExists from '../components/marketing/WhyExists';
import HowItWorks from '../components/marketing/HowItWorks';
import TwoColumns from '../components/marketing/TwoColumns';
import Proof from '../components/marketing/Proof';
import Footer from '../components/marketing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <WhyExists />
      <HowItWorks />
      <TwoColumns />
      <Proof />
      <Footer />
    </main>
  );
}


