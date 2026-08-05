import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';

const PRODUCTS = [
  {
    id: 1,
    name: 'Adopt Don\'t Shop Tee',
    price: 'KES 1,800',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    tag: 'Best Seller',
    tagColor: 'bg-coral-500',
    description: 'Soft 100% cotton tee with our signature paw print design.',
  },
  {
    id: 2,
    name: 'RescueMePets Hoodie',
    price: 'KES 3,500',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
    tag: 'New',
    tagColor: 'bg-teal-500',
    description: 'Cozy pullover hoodie — perfect for morning walks with your pet.',
  },
  {
    id: 3,
    name: 'Paw Print Mug',
    price: 'KES 1,200',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    tag: null,
    tagColor: '',
    description: '11oz ceramic mug with teal paw print design. Dishwasher safe.',
  },
  {
    id: 4,
    name: 'Pet Parent Tote Bag',
    price: 'KES 900',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80',
    tag: null,
    tagColor: '',
    description: 'Sturdy canvas tote — great for vet visits, groceries, or the beach.',
  },
  {
    id: 5,
    name: 'Rescue Hero Sticker Pack',
    price: 'KES 400',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    tag: 'Fan Fave',
    tagColor: 'bg-teal-500',
    description: '6 vinyl stickers featuring our animal characters. Waterproof.',
  },
  {
    id: 6,
    name: 'Adopt A Pet Phone Case',
    price: 'KES 1,500',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80',
    tag: null,
    tagColor: '',
    description: 'Slim hard case with teal paw design. Available for most models.',
  },
];

const CAUSES = [
  { icon: '🏥', label: '30% to rescue centers', desc: 'Every purchase directly funds partner rescue centers.' },
  { icon: '💉', label: 'Vet care fund', desc: 'Helps cover vaccinations and medical costs for animals.' },
  { icon: '🐾', label: 'Adoption drives', desc: 'Supports community adoption events across Kenya.' },
];

export default function Shop() {
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(null);
  const [ordered, setOrdered] = useState(() => new Set());
  const [error, setError] = useState('');
  const userId = localStorage.getItem('user_id');

  const handleBuy = async (product) => {
    if (!userId) { navigate('/login'); return; }
    setOrdering(product.id);
    setError('');
    try {
      const res = await apiFetch(`${API_BASE_URL}/shop/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: product.name, product_price: product.price, quantity: 1 }),
      });
      if (res.ok) {
        setOrdered(prev => new Set(prev).add(product.id));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Could not send your order request. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setOrdering(null);
    }
  };

  return (
    <div className="page-bg min-h-screen">

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="section-label text-teal-200 mb-3">Wear Your Love</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">RescueMePets Shop 🐾</h1>
          <p className="text-teal-100 text-lg max-w-xl mx-auto">
            Every purchase supports rescue centers and helps animals find their forever homes.
          </p>
        </div>
      </div>

      {/* Impact bar */}
      <div className="bg-white border-b border-teal-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {CAUSES.map((c, i) => (
              <div key={i} className="py-5 px-4 text-center">
                <div className="text-2xl mb-1">{c.icon}</div>
                <p className="text-sm font-black text-gray-800">{c.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label mb-1">Merch</p>
            <h2 className="text-2xl font-black text-gray-800">Shop All Products</h2>
          </div>
          <span className="text-xs text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
            We'll contact you to arrange payment &amp; delivery
          </span>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map(product => (
            <div key={product.id}
              className="bg-white rounded-3xl overflow-hidden shadow-card border border-teal-50 hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 group">
              <div className="relative h-56 overflow-hidden bg-gray-50">
                <img src={product.image} alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'} />
                {product.tag && (
                  <span className={`absolute top-3 left-3 text-white text-xs font-black px-3 py-1 rounded-full ${product.tagColor}`}>
                    {product.tag}
                  </span>
                )}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <span className="text-xs font-black text-gray-700">{product.price}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-gray-800 text-base mb-1">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{product.description}</p>
                <button
                  onClick={() => handleBuy(product)}
                  disabled={ordering === product.id || ordered.has(product.id)}
                  className={`w-full py-3 rounded-2xl text-sm font-bold transition-all border-0 cursor-pointer
                    ${ordered.has(product.id)
                      ? 'bg-teal-100 text-teal-700 cursor-default'
                      : ordering === product.id
                        ? 'bg-gray-100 text-gray-400 cursor-wait'
                        : 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:shadow-lg hover:shadow-coral-200/50 hover:scale-105'}`}>
                  {ordered.has(product.id) ? '✅ Request Sent' : ordering === product.id ? 'Sending...' : '🛒 Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom order CTA */}
        <div className="mt-12 bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white mb-1">Want custom merch for your rescue center?</h3>
            <p className="text-teal-100 text-sm">We can create branded merchandise for your center. Get in touch!</p>
          </div>
          <a href="mailto:hello@rescuemepets.com?subject=Custom Merch"
            className="relative z-10 bg-white text-teal-700 font-bold px-7 py-3 rounded-2xl text-sm hover:shadow-xl transition-all border-0 cursor-pointer flex-shrink-0 no-underline">
            📧 Contact Us
          </a>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => navigate(-1)} className="btn-ghost px-6 py-2.5 text-sm">← Back</button>
        </div>
      </div>
    </div>
  );
}
