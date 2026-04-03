import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  BarChart3, 
  Network, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Share2,
  Grid3X3
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser, useClerk } from "@clerk/clerk-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Overview", href: "/cryptoflow/dashboard", icon: LayoutDashboard },
  { name: "Upload", href: "/cryptoflow/upload", icon: Upload },
  { name: "Analysis", href: "/cryptoflow/analysis", icon: BarChart3 },
  { name: "Visualizer", href: "/cryptoflow/graph", icon: Share2 },
  { name: "Patterns", href: "/cryptoflow/patterns", icon: Network },
  { name: "Reports", href: "/cryptoflow/reports", icon: FileText },
  { name: "Settings", href: "/cryptoflow/settings", icon: Settings },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/cryptoflow/");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 bg-fluid bg-fixed"></div>
      
      {/* Top Navigation Pill */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <header className={`
          w-full max-w-6xl flex items-center justify-between px-8 py-3 
          glass rounded-full transition-all duration-500 border-white/10
          ${isScrolled ? 'py-2 mt-[-10px] scale-95 opacity-90' : ''}
        `}>
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/cryptoflow/dashboard" className="text-xl font-bold tracking-tighter italic">
              ChainSight
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1 bg-white/5 rounded-full p-1 border border-white/5">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      px-6 py-2 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 rounded-full
                      ${isActive 
                        ? 'bg-white text-black' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>

            <Link to="/cryptoflow/settings">
              <Avatar className="w-10 h-10 border-2 border-white/10 hover:border-white/40 transition-all duration-500">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-white/5 text-[10px]">{user?.firstName?.[0]}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 pt-32 pb-20 px-4 max-w-[1400px] mx-auto">
        <div className="animate-on-scroll show">
          {children}
        </div>
      </main>

      {/* Mobile Nav Fix */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
        <nav className="glass rounded-full p-2 flex justify-around border-white/10">
          {navigation.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`p-3 rounded-full transition-all ${isActive ? 'bg-white text-black' : 'text-gray-400'}`}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
