import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import { apiFetch } from '../api';

const PRODUCTS = [
  {
    id: 1,
    name: 'Adopt Don\'t Shop Tee',
    price: 'KES 1,800',
    priceValue: 1800,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85',
    tag: 'Best Seller',
    tagColor: 'bg-coral-500',
    description: 'Soft 100% cotton tee with our signature paw print design. Runs true to size.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Teal', hex: '#0d9488' },
      { name: 'Black', hex: '#18181b' },
      { name: 'White', hex: '#f8fafc' },
    ],
  },
  {
    id: 2,
    name: 'RescueMePets Hoodie',
    price: 'KES 3,500',
    priceValue: 3500,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=85',
    tag: 'New',
    tagColor: 'bg-teal-500',
    description: 'Cozy pullover hoodie with a soft brushed interior — perfect for morning walks with your pet.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Teal', hex: '#0d9488' },
      { name: 'Charcoal', hex: '#374151' },
    ],
  },
  {
    id: 3,
    name: 'Paw Print Mug',
    price: 'KES 1,200',
    priceValue: 1200,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=85',
    tag: null,
    tagColor: '',
    description: '11oz ceramic mug with a teal paw print design. Dishwasher and microwave safe.',
    sizes: null,
    colors: [
      { name: 'Teal', hex: '#0d9488' },
      { name: 'White', hex: '#f8fafc' },
    ],
  },
  {
    id: 4,
    name: 'Pet Parent Tote Bag',
    price: 'KES 900',
    priceValue: 900,
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=85',
    tag: null,
    tagColor: '',
    description: 'Sturdy canvas tote — great for vet visits, groceries, or the beach.',
    sizes: null,
    colors: [
      { name: 'Natural', hex: '#e7dcc8' },
      { name: 'Teal', hex: '#0d9488' },
    ],
  },
  {
    id: 5,
    name: 'Rescue Hero Sticker Pack',
    price: 'KES 400',
    priceValue: 400,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85',
    tag: 'Fan Fave',
    tagColor: 'bg-teal-500',
    description: '6 vinyl stickers featuring our animal characters. Waterproof and fade-resistant.',
    sizes: null,
    colors: null,
  },
  {
    id: 6,
    name: 'Adopt A Pet Phone Case',
    price: 'KES 1,500',
    priceValue: 1500,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=85',
    tag: null,
    tagColor: '',
    description: 'Slim hard case with a teal paw design. Available for most popular models.',
    sizes: null,
    colors: [
      { name: 'Teal', hex: '#0d9488' },
      { name: 'Black', hex: '#18181b' },
    ],
  },
];

const CAUSES = [
  { icon: '🏥', label: '30% to rescue centers', desc: 'Every purchase directly funds partner rescue centers.' },
  { icon: '💉', label: 'Vet care fund', desc: 'Helps cover vaccinations and medical costs for animals.' },
  { icon: '🐾', label: 'Adoption drives', desc: 'Supports community adoption events across Kenya.' },
];

const CART_KEY = 'shop_cart';
const fmtKES = (n) => `KES ${n.toLocaleString()}`;

function cartLineId(productId, size, color) {
  return `${productId}::${size || ''}::${color || ''}`;
}

/* ── Product preview modal ─────────────────────────────────────────── */
function ProductPreview({ product, onClose, onAddToCart }) {
  const [size, setSize] = useState(product.sizes ? product.sizes[0] : null);
  const [color, setColor] = useState(product.colors ? product.colors[0].name : null);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const activeColorHex = product.colors?.find(c => c.name === color)?.hex || null;

  const handleAdd = () => {
    onAddToCart(product, size, color, qty);
    setJustAdded(true);
    setTimeout(() => onClose(), 700);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto border border-teal-50 modal-enter grid sm:grid-cols-2"
        onClick={e => e.stopPropagation()}>

        <div className="relative h-64 sm:h-full bg-gray-50 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover"
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85'} />
          {activeColorHex && (
            <div className="absolute inset-0 pointer-events-none transition-all duration-300"
              style={{ background: activeColorHex, mixBlendMode: 'color', opacity: 0.55 }} />
          )}
          {product.colors && (
            <span className="absolute bottom-3 left-3 bg-black/40 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              Color preview
            </span>
          )}
          {product.tag && (
            <span className={`absolute top-4 left-4 text-white text-xs font-black px-3 py-1 rounded-full ${product.tagColor}`}>
              {product.tag}
            </span>
          )}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white border-0 cursor-pointer font-bold shadow-sm sm:hidden">
            ✕
          </button>
        </div>

        <div className="p-6 sm:p-7 relative">
          <button onClick={onClose}
            className="hidden sm:flex absolute top-5 right-5 w-8 h-8 bg-gray-50 rounded-full items-center justify-center text-gray-500 hover:bg-gray-100 border-0 cursor-pointer font-bold">
            ✕
          </button>

          <h2 className="text-xl font-black text-gray-900 pr-8 mb-1">{product.name}</h2>
          <p className="text-2xl font-black text-teal-600 mb-3">{product.price}</p>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>

          {product.sizes && (
            <div className="mb-5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`w-11 h-11 rounded-xl text-sm font-bold border-2 cursor-pointer transition-all
                      ${size === s ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-200 text-gray-600 bg-white hover:border-teal-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors && (
            <div className="mb-5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Color{color ? <span className="text-gray-400 normal-case font-semibold"> — {color}</span> : null}
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {product.colors.map(c => (
                  <button key={c.name} onClick={() => setColor(c.name)} title={c.name}
                    aria-label={c.name}
                    className={`w-9 h-9 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center
                      ${color === c.name ? 'border-teal-600 scale-110' : 'border-gray-200'}`}>
                    <span className="w-6 h-6 rounded-full block ring-1 ring-black/10" style={{ background: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Quantity</p>
            <div className="inline-flex items-center gap-3 bg-gray-50 rounded-xl px-2 py-1.5">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold cursor-pointer hover:bg-gray-100">−</button>
              <span className="w-6 text-center font-bold text-gray-800">{qty}</span>
              <button onClick={() => setQty(q => Math.min(20, q + 1))}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold cursor-pointer hover:bg-gray-100">+</button>
            </div>
          </div>

          <button onClick={handleAdd} disabled={justAdded}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all border-0 cursor-pointer
              ${justAdded ? 'bg-teal-100 text-teal-700' : 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:shadow-lg hover:shadow-coral-200/50'}`}>
            {justAdded ? '✅ Added to Cart' : `🛒 Add to Cart — ${fmtKES(product.priceValue * qty)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Cart drawer ────────────────────────────────────────────────────── */
function CartDrawer({ cart, onClose, onUpdateQty, onRemove, onCheckout, checkingOut, error }) {
  const subtotal = cart.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">🛒 Your Cart {cart.length > 0 && <span className="text-gray-400 font-semibold">({cart.length})</span>}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-0 cursor-pointer font-bold">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🛍️</div>
              <p className="text-gray-400 font-semibold">Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map(item => (
                <div key={item.cartId} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85'} />
                    {item.colorHex && (
                      <div className="absolute inset-0 pointer-events-none" style={{ background: item.colorHex, mixBlendMode: 'color', opacity: 0.55 }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                    {(item.size || item.color) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[item.size && `Size ${item.size}`, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-1.5 py-1">
                        <button onClick={() => onUpdateQty(item.cartId, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 text-gray-600 font-bold text-xs cursor-pointer hover:bg-gray-100">−</button>
                        <span className="w-5 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.cartId, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 text-gray-600 font-bold text-xs cursor-pointer hover:bg-gray-100">+</button>
                      </div>
                      <span className="font-black text-teal-600 text-sm">{fmtKES(item.priceValue * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.cartId)} aria-label="Remove item"
                    className="text-gray-300 hover:text-coral-500 bg-transparent border-0 cursor-pointer text-lg flex-shrink-0 h-fit">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100">
            {error && (
              <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                ⚠️ {error}
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm font-semibold">Subtotal</span>
              <span className="text-xl font-black text-gray-900">{fmtKES(subtotal)}</span>
            </div>
            <button onClick={onCheckout} disabled={checkingOut}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all border-0 cursor-pointer
                ${checkingOut ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:shadow-lg hover:shadow-teal-200/50'}`}>
              {checkingOut ? 'Sending...' : 'Send Order Request'}
            </button>
            <p className="text-center text-gray-400 text-xs mt-2.5">We'll contact you to arrange payment &amp; delivery</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Shop page ──────────────────────────────────────────────────────── */
export default function Shop() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  const [previewProduct, setPreviewProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (Array.isArray(saved)) setCart(saved);
    } catch { /* ignore corrupt cart data */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size, color, qty) => {
    const cartId = cartLineId(product.id, size, color);
    const colorHex = product.colors?.find(c => c.name === color)?.hex || null;
    setCart(prev => {
      const existing = prev.find(item => item.cartId === cartId);
      if (existing) {
        return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, {
        cartId, productId: product.id, name: product.name, image: product.image,
        price: product.price, priceValue: product.priceValue, size, color, colorHex, quantity: qty,
      }];
    });
  };

  const updateQty = (cartId, quantity) => {
    if (quantity < 1) { removeFromCart(cartId); return; }
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity } : item));
  };

  const removeFromCart = (cartId) => setCart(prev => prev.filter(item => item.cartId !== cartId));

  const checkout = async () => {
    if (!userId) { navigate('/login'); return; }
    setCheckingOut(true);
    setError('');
    try {
      const items = cart.map(item => ({
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        variant: [item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(', ') || null,
      }));
      const res = await apiFetch(`${API_BASE_URL}/shop/orders/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        setCart([]);
        setCartOpen(false);
        setConfirmed(true);
        setTimeout(() => setConfirmed(false), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Could not send your order request. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const cartCount = cart.reduce((n, item) => n + item.quantity, 0);

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

      {confirmed && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold px-5 py-4 rounded-2xl flex items-center gap-2 animate-scale-in">
            ✅ Order request sent! We'll reach out to arrange payment and delivery.
          </div>
        </div>
      )}

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label mb-1">Merch</p>
            <h2 className="text-2xl font-black text-gray-800">Shop All Products</h2>
          </div>
          <span className="text-xs text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm hidden sm:inline-block">
            We'll contact you to arrange payment &amp; delivery
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map(product => (
            <div key={product.id}
              onClick={() => setPreviewProduct(product)}
              className="bg-white rounded-3xl overflow-hidden shadow-card border border-teal-50 hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-all bg-white/95 text-gray-800 text-xs font-black px-4 py-2 rounded-full shadow-lg -translate-y-1 group-hover:translate-y-0">
                    👁️ Quick View
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-gray-800 text-base mb-1">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{product.description}</p>
                <button
                  onClick={e => { e.stopPropagation(); setPreviewProduct(product); }}
                  className="w-full py-3 rounded-2xl text-sm font-bold transition-all border-0 cursor-pointer
                    bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:shadow-lg hover:shadow-coral-200/50 hover:scale-105">
                  🛒 Select Options
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

      {/* Floating cart button — kept on the opposite corner from the chat
          assistant button (also fixed bottom-6 right-6) to avoid overlap */}
      <button onClick={() => setCartOpen(true)} aria-label="Open cart"
        className="fixed bottom-6 left-6 z-[60] w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-teal-500 text-white shadow-2xl shadow-teal-500/30 border-0 cursor-pointer flex items-center justify-center text-2xl hover:scale-105 transition-all">
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-coral-500 text-white text-xs font-black flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {previewProduct && (
        <ProductPreview product={previewProduct} onClose={() => setPreviewProduct(null)} onAddToCart={addToCart} />
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onCheckout={checkout}
          checkingOut={checkingOut}
          error={error}
        />
      )}
    </div>
  );
}
