import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    icon: '🐾',
    color: 'border-gray-200',
    badge: null,
    features: [
      'List up to 5 animals',
      'Basic center profile',
      'Standard search visibility',
      'Email support',
    ],
    missing: ['Sponsored listings', 'Priority placement', 'Analytics dashboard', 'Featured badge'],
    cta: 'Get Started Free',
    ctaClass: 'btn-ghost',
  },
  {
    name: 'Pro',
    price: 2999,
    period: 'month',
    icon: '⭐',
    color: 'border-teal-400',
    badge: 'Most Popular',
    features: [
      'Unlimited animal listings',
      'Enhanced center profile',
      '3 sponsored animal slots',
      'Priority search placement',
      'Analytics dashboard',
      'Email & chat support',
    ],
    missing: ['Dedicated account manager', 'Custom branding'],
    cta: 'Start Pro — KES 2,999/mo',
    ctaClass: 'btn-primary',
  },
  {
    name: 'Premium',
    price: 7999,
    period: 'month',
    icon: '👑',
    color: 'border-coral-400',
    badge: 'Best Value',
    features: [
      'Everything in Pro',
      'Unlimited sponsored slots',
      'Featured center on homepage',
      'Custom branding & banner',
      'Dedicated account manager',
      'Priority phone support',
      'Monthly performance report',
    ],
    missing: [],
    cta: 'Go Premium — KES 7,999/mo',
    ctaClass: 'btn-coral',
  },
];

const FAQ = [
  { q: 'What is a sponsored listing?', a: 'Sponsored animals appear at the top of search results and animal listings with a ⭐ badge, giving them maximum visibility to potential adopters.' },
  { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time. Your plan stays active until the end of the billing period.' },
  { q: 'How do I upgrade my center?', a: 'Contact us via the button below and our team will set up your subscription and activate your features within 24 hours.' },
  { q: 'Is there a free trial?', a: 'Pro and Premium plans come with a 14-day free trial. No credit card required to start.' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="page-bg min-h-screen">

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10">
          <p className="section-label text-teal-200 mb-3">For Rescue Centers</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-teal-100 text-lg max-w-xl mx-auto">
            Grow your center's reach, get more adoptions, and manage everything in one place.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, i) => (
            <div key={i}
              className={`bg-white rounded-3xl p-8 shadow-card border-2 ${plan.color} relative
                ${plan.badge ? 'md:-translate-y-4 shadow-card-hover' : ''} transition-all hover:-translate-y-1`}>
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className={`text-xs font-black px-4 py-1.5 rounded-full text-white
                    ${plan.name === 'Pro' ? 'bg-gradient-to-r from-teal-500 to-teal-600' : 'bg-gradient-to-r from-coral-500 to-coral-600'}`}>
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="text-4xl mb-4">{plan.icon}</div>
              <h3 className="text-xl font-black text-gray-800 mb-1">{plan.name}</h3>
              <div className="mb-6">
                {plan.price === 0 ? (
                  <span className="text-4xl font-black text-gray-800">Free</span>
                ) : (
                  <>
                    <span className="text-4xl font-black text-gray-800">KES {plan.price.toLocaleString()}</span>
                    <span className="text-gray-400 text-sm font-medium">/{plan.period}</span>
                  </>
                )}
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="text-teal-500 font-black mt-0.5 flex-shrink-0">✓</span> {f}
                  </li>
                ))}
                {plan.missing.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="font-black mt-0.5 flex-shrink-0">✕</span> {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@rescuemepets.com?subject=Subscription Inquiry"
                className={`block w-full py-3 rounded-2xl text-sm font-bold text-center no-underline transition-all
                  ${plan.ctaClass === 'btn-primary' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-glow-teal' :
                    plan.ctaClass === 'btn-coral' ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:shadow-glow-coral' :
                    'border-2 border-teal-200 text-teal-700 hover:bg-teal-50'}`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Feature comparison note */}
        <p className="text-center text-gray-400 text-sm mt-8">
          All plans include access to the RescueMePets admin dashboard · 14-day free trial on paid plans
        </p>
      </div>

      {/* Sponsored listings explainer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
          <div className="relative z-10 grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <p className="section-label text-teal-200 mb-2">Sponsored Listings</p>
              <h2 className="text-3xl font-black text-white mb-3">Get Your Animals Seen First</h2>
              <p className="text-teal-100 text-sm leading-relaxed">
                Sponsored animals appear at the top of every search result and browse page with a prominent ⭐ badge.
                Centers on Pro and Premium plans see up to <strong className="text-white">3× more adoption inquiries</strong> for sponsored animals.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {['Top placement in all search results', 'Prominent ⭐ Sponsored badge', 'Featured in rescue center profile', 'Included in homepage highlights'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                  <span className="text-teal-300 font-black">✓</span>
                  <span className="text-white text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-black text-gray-800 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-teal-50 shadow-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-gray-800 text-sm bg-transparent border-0 cursor-pointer hover:bg-teal-50/50 transition-all">
                {item.q}
                <span className={`text-teal-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-3xl p-8 shadow-card border border-teal-50 text-center">
          <h3 className="text-2xl font-black text-gray-800 mb-2">Are you a rescue center?</h3>
          <p className="text-gray-400 text-sm mb-6">Get in touch and we'll set up your account within 24 hours.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:hello@rescuemepets.com?subject=Rescue Center Subscription"
              className="btn-primary px-8 py-3 text-sm no-underline">
              📧 Contact Us
            </a>
            <button onClick={() => navigate(-1)}
              className="btn-ghost px-8 py-3 text-sm">
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
