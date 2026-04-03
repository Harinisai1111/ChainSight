import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import AuthButton from './AuthButton';
import { useTheme } from '@/contexts/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate('/dashboard/');
    } else {
      openSignIn({ afterSignInUrl: '/dashboard/' });
    }
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/5 py-3 shadow-2xl' : 'py-6'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tighter text-white uppercase">
            Chain<span className="text-white/30">Sight</span>
          </h1>
        </div>

        {/* Desktop menu */}
        <ul className="hidden lg:flex items-center space-x-8">
          <li>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
          </li>
          <li>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How it works
            </a>
          </li>

          <li>
            <a href="#faq" className="text-gray-300 hover:text-white transition-colors">
              FAQ
            </a>
          </li>
        </ul>

        <div className="hidden lg:flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-gray-300 hover:text-white rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <AuthButton />
          <Button 
            className="bg-white text-black hover:bg-gray-200 rounded-none px-6 font-medium tracking-tight"
            onClick={handleGetStarted}
          >
            GET STARTED
          </Button>
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-crypto-blue/95 backdrop-blur-lg absolute top-full left-0 w-full py-4 shadow-lg">
          <div className="container mx-auto px-4">
            <ul className="flex flex-col space-y-4">
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  How it works
                </a>
              </li>

              <li>
                <a href="#faq" className="text-gray-300 hover:text-white transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  FAQ
                </a>
              </li>
              <li className="pt-4 flex flex-col space-y-3">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white w-full justify-start"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    // AuthButton handles its own sign-in/user display
                  }}
                >
                  Account
                </Button>
                <Button 
                  className="bg-crypto-purple hover:bg-crypto-dark-purple text-white w-full"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleGetStarted();
                  }}
                >
                  Get Started
                </Button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

