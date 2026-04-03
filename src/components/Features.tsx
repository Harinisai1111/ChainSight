
import { Activity, Lock, Zap, Compass, LineChart, Shield } from 'lucide-react';
import { features } from '../data/featuresData';


const Features = () => {
  return (
    <section id="features" className="py-32 bg-transparent relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24 animate-on-scroll">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter text-white uppercase italic leading-none">
            ENGINEERED FOR <span className="text-white/20">PRECISION</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-light tracking-[0.3em] uppercase text-[10px]">
            Advanced detection vectors for the modern regulatory landscape
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card p-12 group animate-on-scroll relative overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2 border-white/5 hover:border-white/20"
              style={{ 
                animationDelay: `${index * 0.15}s`,
                perspective: '1000px'
              }}
            >
              {/* Internal Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="w-12 h-12 flex items-center justify-center mb-10 text-white/30 group-hover:text-white group-hover:scale-110 transition-all duration-500 transform-gpu">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-medium mb-6 text-white tracking-tight group-hover:tracking-normal transition-all duration-500 uppercase italic">
                {feature.title}
              </h3>
              <p className="text-gray-500 font-light leading-relaxed text-sm group-hover:text-gray-400 transition-colors duration-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

