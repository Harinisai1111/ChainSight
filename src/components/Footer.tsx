
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-20 bg-black border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h1 className="text-2xl font-bold tracking-tighter text-white uppercase mb-6">
              Chain<span className="text-white/30">Sight</span>
            </h1>
            <p className="text-gray-500 font-light text-sm leading-relaxed mb-6">
              Intelligence-driven blockchain forensics. Eliminating complex money laundering topologies through Graph Neural Networks.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-widest">Products</h3>
            <ul className="space-y-2">
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Graph Analysis</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Pattern Detection</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">API Access</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Enterprise Solutions</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Compliance Reports</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-widest">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Documentation</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">API Reference</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Case Studies</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Research Papers</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-widest">Company</h3>
            <ul className="space-y-2">
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">About</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Press</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Legal & Privacy</a></li>
              <li><a href="#!" className="text-gray-500 hover:text-white transition-colors text-sm">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-xs tracking-widest uppercase">
            &copy; {new Date().getFullYear()} CHAINSIGHT ANALYTICS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-white text-xs tracking-widest uppercase transition-colors">Privacy Protocol</a>
            <a href="#" className="text-gray-600 hover:text-white text-xs tracking-widest uppercase transition-colors">Terms of Engagement</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
