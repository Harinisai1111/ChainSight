import { ArrowUpRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';

const Hero = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const handleAction = (path: string) => {
    if (isSignedIn) {
      navigate(path + '/');
    } else {
      openSignIn({ afterSignInUrl: path + '/' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20">
      {/* Content Overlay */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="inline-block glass px-6 py-2 rounded-full mb-10 animate-fade-in border-white/10">
          <span className="text-xs tracking-[0.3em] font-light text-white/70 uppercase">Institutional Grade Blockchain Analysis</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-10 leading-tight tracking-tighter text-white">
          CHAIN<span className="text-white/20">SIGHT</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto font-light leading-relaxed">
          The new standard for eliminating Smurfing & Layering through 
          <span className="text-white mx-2 font-medium">Graph Neural Networks</span> 
          at global scale. 
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-12 py-8 rounded-none text-xl font-medium transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            onClick={() => handleAction('/upload')}>
            ANALYZE TRANSACTIONS
          </Button>
          <Button variant="ghost" size="lg" className="text-white hover:bg-white/5 px-12 py-8 rounded-none text-xl font-light tracking-wide border border-white/10 backdrop-blur-md"
            onClick={() => handleAction('/dashboard')}>
            LIVE DASHBOARD
            <ArrowUpRight className="ml-2 h-6 w-6 opacity-30" />
          </Button>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto opacity-40">
           <div className="text-center group cursor-default">
              <p className="text-5xl font-extralight text-white mb-3">99.2%</p>
              <p className="text-[10px] tracking-[0.4em] text-gray-500 uppercase">Precision Rate</p>
           </div>
           <div className="text-center group cursor-default">
              <p className="text-5xl font-extralight text-white mb-3">10M+</p>
              <p className="text-[10px] tracking-[0.4em] text-gray-500 uppercase">Graphs Scanned</p>
           </div>
           <div className="text-center group cursor-default">
              <p className="text-5xl font-extralight text-white mb-3">REAL-TIME</p>
              <p className="text-[10px] tracking-[0.4em] text-gray-500 uppercase">Real-Time Detection</p>
           </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-10">
        <div className="w-px h-16 bg-white"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
      `}} />
    </section>
  );
};

export default Hero;
