import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';

const CTA = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const handleDemo = () => {
    if (isSignedIn) {
      navigate('/cryptoflow/dashboard/');
    } else {
      openSignIn({ afterSignInUrl: '/cryptoflow/dashboard/' });
    }
  };

  return (
    <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_50%)]"></div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white tracking-tighter uppercase italic">
          Ready to Secure Your Network?
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto mb-12 font-light tracking-widest uppercase text-xs">
          Join the elite institutions leveraging ChainSight for advanced chain analysis
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-12 font-medium"
            onClick={() => navigate('/cryptoflow/upload/')}>
            GET STARTED NOW
          </Button>
          <Button variant="outline" size="lg" className="border-white/10 text-white hover:bg-white/5 rounded-none px-12 font-light"
            onClick={handleDemo}>
            VIEW LIVE DEMO
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
