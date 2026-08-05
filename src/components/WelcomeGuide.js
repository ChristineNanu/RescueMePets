import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const ADOPTER_STEPS = [
  { icon: '👋', title: 'Welcome to RescueMePets!', text: "Here's a 30-second look around before you dive in." },
  { icon: '🐾', title: 'Browse & Favorite', text: 'Explore animals on the Animals page. Tap the heart on any card to save your favorites for later.' },
  { icon: '📝', title: 'Apply or Foster', text: "Found the one? Apply to adopt them — or choose Foster-to-Adopt to try it out first, no fee." },
  { icon: '🔔', title: 'Stay in the Loop', text: 'Track every application in My Profile, message vets directly, and turn on notifications so you never miss an update.' },
  { icon: '💬', title: 'Need Help?', text: 'Tap Paws in the bottom-right corner anytime — our chat assistant can answer most questions instantly.' },
];

const VET_STEPS = [
  { icon: '👋', title: 'Welcome to the Vet Portal!', text: "Here's a quick look around before you get started." },
  { icon: '📋', title: 'Active Tickets', text: 'Adopters needing help show up here. Message them directly and mark issues resolved once handled.' },
  { icon: '🩺', title: 'Medical Records', text: 'Open any animal under Center Animals to log vaccinations, treatments, checkups, and weight over time.' },
  { icon: '🔔', title: 'Notifications', text: "Turn on push notifications so you know the moment a new message comes in — even if this tab isn't open." },
];

export function shouldShowWelcomeGuide(role) {
  return !localStorage.getItem(`tour_seen_${role}`);
}

export default function WelcomeGuide({ role, onClose }) {
  const steps = role === 'vet' ? VET_STEPS : ADOPTER_STEPS;
  const [i, setI] = useState(0);
  const step = steps[i];
  const last = i === steps.length - 1;

  const finish = () => {
    localStorage.setItem(`tour_seen_${role}`, '1');
    onClose();
  };

  // Rendered via portal straight into <body>: Navbar has backdrop-blur (a CSS filter),
  // and any filtered ancestor creates a new containing block for `fixed` descendants —
  // without the portal this modal mispositions instead of centering on the viewport.
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 pt-8 pb-10 text-center relative">
          <button onClick={finish} aria-label="Skip tour"
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-bold border-0 cursor-pointer transition-all">
            ✕
          </button>
          <div className="text-5xl mb-2">{step.icon}</div>
          <h2 className="text-xl font-black text-white">{step.title}</h2>
        </div>

        <div className="px-6 py-6 text-center">
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{step.text}</p>

          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((_, idx) => (
              <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-6 bg-teal-600' : 'w-1.5 bg-teal-100'}`} />
            ))}
          </div>

          <div className="flex gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)}
                className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 bg-transparent cursor-pointer hover:bg-gray-50 transition-all">
                ← Back
              </button>
            )}
            <button onClick={() => last ? finish() : setI(i + 1)}
              className="flex-[2] py-3 rounded-xl font-bold text-sm btn-primary border-0 cursor-pointer">
              {last ? "Let's go! 🐾" : 'Next →'}
            </button>
          </div>
          {!last && (
            <button onClick={finish}
              className="mt-3 text-xs text-gray-400 font-semibold bg-transparent border-0 cursor-pointer hover:text-gray-600">
              Skip tour
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
