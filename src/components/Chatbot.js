import React, { useState, useRef, useEffect } from 'react';

const FAQS = [
  {
    patterns: ['how long', 'how much time', 'process take', 'how does adoption work', 'steps'],
    answer: "Our adoption process usually takes **3–7 days**. Here's how it works:\n1. Browse animals and click 'Adopt Me!'\n2. Fill out the adoption application\n3. The rescue center reviews your application\n4. If approved, you'll be contacted to arrange a meet & greet\n5. Complete the adoption paperwork and bring your new friend home! 🏠",
  },
  {
    patterns: ['cost', 'fee', 'price', 'how much', 'free', 'pay'],
    answer: "Submitting an adoption application on RescueMePets is completely **free**! 🎉\n\nHowever, individual rescue centers may charge an adoption fee (typically $50–$200) to cover vaccinations, neutering, and microchipping. Check with the specific center for their fee structure.",
  },
  {
    patterns: ['vaccin', 'neutered', 'microchip', 'health', 'medical', 'vet'],
    answer: "Great question! Each animal's profile shows their health status with badges:\n\n💉 **Vaccinated** — up to date on core vaccines\n✂️ **Neutered/Spayed** — already done\n📡 **Microchipped** — registered and traceable\n\nYou can see these badges by clicking on any animal card. Animals not yet vaccinated will be handled before adoption is finalised.",
  },
  {
    patterns: ['rent', 'apartment', 'landlord', 'no pets', 'lease'],
    answer: "You can still apply if you rent! 🏢\n\nWe recommend:\n• Getting written permission from your landlord first\n• Checking your lease for pet clauses\n• Mentioning your living situation in your adoption message\n\nRescue centers understand apartment living — many animals are perfectly suited to it (especially cats, small dogs, and rabbits).",
  },
  {
    patterns: ['kids', 'children', 'baby', 'toddler', 'family'],
    answer: "Absolutely! Many of our animals are great with children 👨‍👩‍👧\n\nLook for the **'Good w/ Kids'** badge on animal profiles. Animals like Golden Retrievers, Beagles, Ragdoll cats, and Holland Lop rabbits are especially family-friendly.\n\nWe recommend a meet & greet with the whole family before finalising the adoption.",
  },
  {
    patterns: ['other pet', 'dog and cat', 'already have', 'existing pet', 'good with pets'],
    answer: "Many of our animals get along great with other pets! 🐾\n\nLook for the **'Good w/ Pets'** badge on animal profiles. When you apply, mention your existing pets in the application — the rescue center will help match you with a compatible animal.\n\nA supervised introduction meeting is always recommended.",
  },
  {
    patterns: ['cancel', 'withdraw', 'change mind', 'cancel application'],
    answer: "You can contact the rescue center directly to withdraw your application at any time before approval.\n\nYou can view all your applications in **My Profile → Applications**. If you need help, reach out to the center listed on the animal's profile.",
  },
  {
    patterns: ['favorite', 'save', 'saved', 'wishlist', 'heart'],
    answer: "You can save animals by clicking the **❤️ heart icon** on any animal card!\n\nAll your saved animals are stored in your account and accessible from **My Profile → Saved Animals** — even after you log out and log back in. Your favourites are never lost! 💛",
  },
  {
    patterns: ['login', 'account', 'register', 'sign up', 'password', 'forgot'],
    answer: "To get started:\n• Click **Sign Up** to create a free account\n• Or **Login** if you already have one\n\nAll your applications, favourites, and history are saved to your account — so everything is there when you log back in. If you forgot your password, please contact support.",
  },
  {
    patterns: ['center', 'shelter', 'location', 'where', 'address', 'visit'],
    answer: "We have **4 partner rescue centers** across the US:\n\n🏥 Happy Tails Shelter — New York, NY\n🏥 Paws Rescue — Los Angeles, CA\n🏥 Second Chance Animal Shelter — Chicago, IL\n🏥 Forever Home Rescue — Austin, TX\n\nVisit the **Centers** tab to explore each one and see the animals available there!",
  },
  {
    patterns: ['dog', 'cat', 'rabbit', 'bird', 'species', 'type of animal', 'what animals'],
    answer: "We currently have these animals available for adoption:\n\n🐕 **Dogs** — Golden Retrievers, Huskies, Bulldogs, and more\n🐈 **Cats** — Siamese, Maine Coons, Bengals, and more\n🐇 **Rabbits** — Holland Lops, Angoras\n🦜 **Birds** — Budgerigars, Cockatiels\n\nUse the filter buttons on the **Animals** page to browse by species!",
  },
  {
    patterns: ['approved', 'rejected', 'status', 'application status', 'hear back', 'response'],
    answer: "You can track your application status anytime in **My Profile → Applications**.\n\nStatuses:\n⏳ **Pending** — under review by the center\n✅ **Approved** — congratulations! The center will contact you\n❌ **Not Approved** — don't give up, apply for another animal!\n\nMost centers respond within 2–5 business days.",
  },
];

const QUICK_QUESTIONS = [
  'How does adoption work?',
  'Is it free to adopt?',
  'Can I adopt if I rent?',
  'What health checks do animals have?',
  'Good with kids?',
];

function getBotResponse(input) {
  const lower = input.toLowerCase();
  for (const faq of FAQS) {
    if (faq.patterns.some(p => lower.includes(p))) {
      return faq.answer;
    }
  }
  return "I'm not sure about that one! 🤔\n\nTry asking about:\n• Adoption process & fees\n• Animal health & vaccinations\n• Renting with pets\n• Kids & other pets\n• Application status\n\nOr browse our **Animals** and **Centers** tabs to explore!";
}

function formatMessage(text) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: bold }} />;
  });
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi there! 👋 I'm **Paws**, your adoption assistant!\n\nI can help with questions about adopting, animal health, fees, and more. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text: getBotResponse(msg) }]);
    }, 700);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-0 cursor-pointer"
          title="Chat with Paws"
        >
          <span className="text-xl">{open ? '✕' : '🐾'}</span>
          {!open && <span className="text-sm font-bold">Ask me anything!</span>}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🐾</div>
            <div>
              <p className="font-bold text-white text-sm">Paws</p>
              <p className="text-amber-100 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Adoption Assistant
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.from === 'bot' && (
                  <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🐾</div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.from === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-sm'}`}>
                  {formatMessage(msg.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0">🐾</div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto">
            {QUICK_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => send(q)}
                className="flex-shrink-0 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer border-0 font-medium whitespace-nowrap">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 bg-white flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm text-gray-700 bg-gray-50 focus:bg-white transition-colors"
            />
            <button onClick={() => send()}
              className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white border-0 cursor-pointer hover:shadow-md transition-all flex-shrink-0">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
