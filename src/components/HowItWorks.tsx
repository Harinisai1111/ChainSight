
import { Button } from "@/components/ui/button";
import { steps } from "../data/howItWorks";


const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 bg-transparent relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24 animate-on-scroll">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter text-white uppercase italic leading-none">
            OPERATIONAL <span className="text-white/20">PROTOCOL</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-light tracking-[0.3em] uppercase text-[10px]">
            Seamless integration for complex network analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative glass-card p-12 transition-all duration-700 group hover:scale-[1.02] hover:-translate-y-2 border-white/5 hover:border-white/20 animate-on-scroll overflow-hidden"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
               {/* Step Number Glow */}
              <span className="absolute -top-4 -right-4 text-white/[0.03] group-hover:text-white/[0.08] font-black text-9xl tracking-tighter transition-all duration-700">
                {step.number}
              </span>
              
              <div className="w-14 h-14 flex items-center justify-center mb-10 text-white/30 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                {step.icon}
              </div>
              <h3 className="text-2xl font-medium mb-6 text-white tracking-tight uppercase italic">{step.title}</h3>
              <p className="text-gray-500 font-light leading-relaxed text-sm group-hover:text-gray-400 transition-colors duration-500">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-32 text-center animate-on-scroll">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-16 py-8 text-xl tracking-[0.2em] font-medium transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_60px_rgba(255,255,255,0.1)]">
            START PROTOCOL
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

