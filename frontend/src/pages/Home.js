import Hero from '../components/Hero';
//import Collection from '../components/Collection';
import About from '../components/About';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import PromotionsCarousel from '../components/PromotionsCarousel';
import FeaturedCarousel from '../components/FeaturedCarousel';
import '../styles/buttons.css'
import '../styles/Home.css'

const Home = () => (
  <div className='home-container'>
    <Hero />
    <FeaturedCarousel />
    <PromotionsCarousel />
    <About />
    <CTA />
    <Footer />
  </div>
);

export default Home;
