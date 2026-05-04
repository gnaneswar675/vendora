import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tighter text-white mb-4 block">
              VEND<span className="text-blue-500">ORA</span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              The next-generation marketplace connecting visionary sellers with future-forward buyers.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/shop" className="hover:text-blue-400 transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=electronics" className="hover:text-blue-400 transition-colors">Electronics</Link></li>
              <li><Link href="/shop?category=cyber-wear" className="hover:text-blue-400 transition-colors">Cyber-Wear</Link></li>
              <li><Link href="/shop?category=gaming" className="hover:text-blue-400 transition-colors">Gaming</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Returns</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Vendora Marketplace. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Social Icons Placeholders */}
            <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 cursor-pointer transition-colors"></div>
            <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 cursor-pointer transition-colors"></div>
            <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 cursor-pointer transition-colors"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
