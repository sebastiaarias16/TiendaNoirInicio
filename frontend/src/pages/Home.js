import React from 'react';
import Hero from '../components/Hero';
import BrandStatement from '../components/BrandStatement';
import DropShowcase from '../components/DropShowcase';
import GenderSplit from '../components/GenderSplit';
import EditorialSection from '../components/EditorialSection';
import Manifesto from '../components/Manifesto';
import FeaturedCollection from '../components/FeaturedCollection';
import EarlyAccess from '../components/EarlyAccess';
import Footer from '../components/Footer';
import '../styles/Home.css';

const Home = () => {
  return (
    <main className="home-container" id="main-content">
      {/* 1 & 2: Campaign Hero */}
      <Hero />

      {/* 3: THE NEW STANDARD Brand Statement */}
      <BrandStatement />

      {/* 4: DROP 01 / Featured Products Showcase */}
      <DropShowcase />

      {/* 5: Men's & Women's Collection Split */}
      <GenderSplit />

      {/* 6: Editorial / Lifestyle Section */}
      <EditorialSection />

      {/* 7: EVOLUTION IS DISCIPLINE Manifesto */}
      <Manifesto />

      {/* 8: Featured Products / Sets Collection */}
      <FeaturedCollection />

      {/* 9: Early Access / Community Section */}
      <EarlyAccess />

      {/* 10: Premium Editorial Footer */}
      <Footer />
    </main>
  );
};

export default Home;
