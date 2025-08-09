import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-900">
              <span className="text-blue-600">Secura</span> Protect
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Accueil</a>
            <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">À propos</a>
            <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">Témoignages</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
          </nav>

          <div className="hidden md:flex space-x-4">
            <a href="#contact" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Demander un devis
            </a>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-blue-600">Accueil</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600">Services</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600">À propos</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600">Témoignages</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600">Contact</a>
              <a href="#contact" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-center">
                Demander un devis
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1485230405346-71acb9518d9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMGd1YXJkfGVufDB8fHx8MTc1NDY3MDI2M3ww&ixlib=rb-4.1.0&q=85')`
        }}
      ></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Votre sécurité, notre priorité
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Secura Protect vous accompagne avec des solutions de sécurité sur mesure. 
          Protection, surveillance et tranquillité d'esprit pour votre entreprise.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a href="#contact" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Demander un devis
          </a>
          <a href="#services" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors">
            Nos services
          </a>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">24/7</div>
            <div className="text-lg">Surveillance</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">5min</div>
            <div className="text-lg">Intervention</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">500+</div>
            <div className="text-lg">Clients</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">15ans</div>
            <div className="text-lg">Expérience</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Services Section
const ServicesSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/services`);
        setServices(response.data.services);
      } catch (error) {
        console.error("Erreur lors de la récupération des services:", error);
      }
    };

    fetchServices();
  }, []);

  const serviceImages = {
    'private_security': 'https://images.unsplash.com/photo-1581568736305-49a04e012c13?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxzZWN1cml0eSUyMGd1YXJkfGVufDB8fHx8MTc1NDY3MDI2M3ww&ixlib=rb-4.1.0&q=85',
    'video_surveillance': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxzdXJ2ZWlsbGFuY2V8ZW58MHx8fHwxNzU0NjcwMjY5fDA&ixlib=rb-4.1.0&q=85',
    'access_control': 'https://images.unsplash.com/photo-1528312635006-8ea0bc49ec63?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHw0fHxzdXJ2ZWlsbGFuY2V8ZW58MHx8fHwxNzU0NjcwMjY5fDA&ixlib=rb-4.1.0&q=85',
    'intrusion_detection': 'https://images.pexels.com/photos/96612/pexels-photo-96612.jpeg'
  };

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Des solutions complètes adaptées à vos besoins spécifiques pour assurer une protection optimale
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-200">
                <img 
                  src={serviceImages[service.id]} 
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// About Section
const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              15 ans d'expertise à votre service
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Secura Protect est un leader reconnu dans le domaine de la sécurité privée en France. 
              Notre équipe d'experts certifiés vous accompagne avec des solutions personnalisées et innovantes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Certifications</h4>
                <p className="text-gray-600">Agents agréés et formés aux dernières normes</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Disponibilité</h4>
                <p className="text-gray-600">Service client et intervention 24h/24, 7j/7</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Clients satisfaits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-gray-600">Taux de satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">15</div>
                <div className="text-gray-600">Années d'expérience</div>
              </div>
            </div>
          </div>

          <div>
            <img 
              src="https://images.unsplash.com/photo-1566245024852-04fbf7842ce9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxzZWN1cml0eSUyMGd1YXJkfGVufDB8fHx8MTc1NDY3MDI2M3ww&ixlib=rb-4.1.0&q=85"
              alt="Équipe Secura Protect"
              className="rounded-lg shadow-lg"
            />
            
            <div className="mt-8 bg-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Pourquoi nous choisir ?</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Intervention rapide sous 5 minutes
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Équipements de dernière génération
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Personnel formé et certifié
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tarifs transparents et compétitifs
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Support technique 24h/24
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Marie Dubois",
      title: "Directrice, Retail Pro",
      text: "Secura Protect a transformé la sécurité de nos magasins. Service irréprochable et équipe très professionnelle.",
      rating: 5
    },
    {
      name: "Pierre Martin", 
      title: "Gérant, Entreprise Marseille",
      text: "Intervention rapide, matériel de qualité et suivi excellent. Je recommande sans hésitation.",
      rating: 5
    },
    {
      name: "Sophie Laurent",
      title: "Responsable Sécurité, Tech Corp",
      text: "Partenaire de confiance depuis 3 ans. Leur expertise nous permet de nous concentrer sur notre cœur de métier.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ce que disent nos clients</h2>
          <p className="text-xl text-gray-600">La satisfaction de nos clients est notre meilleure référence</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6">"{testimonial.text}"</p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function App() {
  return (
    <div className="App">
      <Header />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default App;