import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/promotions.css';

const PromotionsCarousel = () => {
  const promos = [
    { text: "🔥 20% OFF en toda la colección Noir", image: "../../public/Img/promocion1.jpg" },
    { text: "🖤 Nueva Línea Oversized", image: "../../public/Img/promo2.jpg" },
    { text: "💪 Envíos gratis por compras superiores a $150.000", image: "../../public/Img/promo3.jpg" }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {promos.map((promo, i) => (
          <div key={i} className="carousel-slide">
            <img src={promo.image} alt={`Promo ${i}`} />
            <h2>{promo.text}</h2>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default PromotionsCarousel;