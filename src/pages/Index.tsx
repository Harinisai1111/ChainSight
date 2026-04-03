
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ChatBot from '@/components/ChatBot';
import ThreeBackground from '@/components/ThreeBackground';
import useScrollAnimation from '@/utils/useScrollAnimation';
import heroHands from '@/images/hero_hands.png';

const ParallaxHands = () => {
  const [yOffset, setYOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setYOffset(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const translateY = yOffset * 0.4; // Moves slower than content for depth

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
      <div 
        className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
        style={{ 
          transform: `translateY(${translateY}px)`,
          opacity: 0.25 
        }}
      >
        <img 
          src={heroHands} 
          alt="Adam Hands" 
          className="w-full h-full object-cover scale-150"
          style={{ 
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
          }}
        />
      </div>
    </div>
  );
};

const Index = () => {
  // Initialize scroll animations
  useScrollAnimation();

  // Set page title
  useEffect(() => {
    document.title = "ChainSight | AI-Powered Blockchain Money Laundering Detection";
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Global Parallax Hands */}
      <ParallaxHands />
      
      {/* 3D Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-grid-3d opacity-10"></div>
      
      <div className="relative z-10 w-full overflow-x-hidden">
        <Navbar />
        <main className="relative">
          <Hero />
          <div className="glass-section">
            <Features />
          </div>
          <div className="glass-section border-t border-white/5">
            <HowItWorks />
          </div>
          <div className="glass-section border-t border-white/5">
            <FAQ />
          </div>
          <div className="glass-section border-t border-white/5">
            <CTA />
          </div>
        </main>
        <Footer />
        <ScrollToTop />
        <ChatBot />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-section {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}} />
    </div>
  );
};

export default Index;

