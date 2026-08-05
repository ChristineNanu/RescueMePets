import React, { useState, useRef, useEffect } from 'react';

const FAQS = [
  {
    patterns: ['hi', 'hello', 'hey', 'hiya', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening'],
    answer: "Hey there! 👋 I'm **Paws**, your adoption assistant.\n\nAsk me about adoption fees, animal health, foster-to-adopt, joining a waitlist, or anything else — happy to help! 🐾",
  },
  {
    patterns: ['thank', 'thanks', 'thx', 'appreciate'],
    answer: "You're so welcome! 🐾 Let me know if there's anything else I can help with.",
  },
  {
    patterns: ['bye', 'goodbye', 'see you', 'later'],
    answer: "Bye for now! 👋 Come back anytime you have questions. Good luck with your adoption journey! 🐾",
  },
  {
    patterns: ['how long', 'how much time', 'process take', 'how does adoption work', 'steps'],
    answer: "Our adoption process usually takes **3–7 days**. Here's how it works:\n1. Browse animals and click 'Adopt Me!'\n2. Fill out the adoption application\n3. The rescue center reviews your application\n4. If approved, you'll be contacted to arrange a meet & greet\n5. Complete the adoption paperwork and bring your new friend home! 🏠",
  },
  {
    patterns: ['cost', 'fee', 'price', 'how much', 'free', 'pay'],
    answer: "Submitting an adoption application on RescueMePets is completely **free**! 🎉\n\nOnce approved, rescue centers charge an adoption fee to cover vaccinations, neutering, and microchipping — paid securely via **M-Pesa** right in the app. The exact amount depends on the animal and center.",
  },
  {
    patterns: ['vaccin', 'neutered', 'microchip', 'health', 'medical'],
    answer: "Each animal's profile shows their health status with badges:\n\n💉 **Vaccinated** — up to date on core vaccines\n✂️ **Neutered/Spayed** — already done\n📡 **Microchipped** — registered and traceable\n\nOpen any animal's profile to see their full **Medical History** — vaccinations, treatments, and checkups logged by our vets. Animals not yet vaccinated will be handled before adoption is finalised.",
  },
  {
    patterns: ['ticket', 'sick', 'behavior', 'behaviour', 'not eating', 'get help', 'contact vet', 'message vet', 'message my vet'],
    answer: "Something wrong with your adopted pet? Go to **My Profile → Applications**, find the animal, and open a support request — a vet from the rescue center will message you directly, and you'll be notified the moment they reply. 🩺",
  },
  {
    patterns: ['vet', 'veterinarian', 'find a vet', 'see a vet', 'talk to a vet', 'ask a vet'],
    answer: "You can meet our vets directly! 🩺 Open the **Centers** tab, pick a center, and scroll to **'Our Veterinary Team'** — you'll see each vet's specialty, a phone number to call, and a form to send them a message.\n\nAlready adopted? You can message your assigned vet anytime through a support request in **My Profile → Applications**.",
  },
  {
    patterns: ['quiz', 'find my match', 'which pet', 'right pet', 'best match', 'personality match'],
    answer: "Not sure which pet is right for you? Try our **Find My Match** quiz! 🧩\n\nAnswer a few quick questions about your lifestyle and home, and we'll match you with animals that fit best. Look for the '✨ Find My Match' button on your Dashboard.",
  },
  {
    patterns: ['foster', 'fostering', 'foster to adopt', 'trial', 'not ready'],
    answer: "Not ready to fully commit? Choose **Foster-to-Adopt** on the application form! 🐣\n\nTake the animal home on a trial basis with no fee, log how it's going in your **Foster Journal**, and finalize the adoption anytime once you're sure — right from **My Profile → Applications**.",
  },
  {
    patterns: ['shop', 'merch', 'merchandise', 'hoodie', 'tote'],
    answer: "Check out the **Shop** tab for RescueMePets merch — tees, hoodies, mugs, and tote bags. 🛍️ 30% of every sale goes directly to our rescue centers!",
  },
  {
    patterns: ['edit profile', 'edit my profile', 'change username', 'change my username', 'change email', 'change my email', 'update profile', 'update my profile', 'change password', 'change my password'],
    answer: "You can update your username, email, and avatar anytime from **My Profile → Edit Profile**. ✏️",
  },
  {
    patterns: ['what is this', 'what is rescuemepets', 'about this app', 'what do you do', 'tell me about'],
    answer: "**RescueMePets** connects you with animals from 4 partner rescue centers looking for their forever homes. 🐾\n\nBrowse animals, apply to adopt or foster, get matched with our quiz, and stay connected with vets even after you adopt — all in one place.",
  },
  {
    patterns: ['waitlist', 'wait list'],
    answer: "If an animal shows as **Pending**, someone's application is already being reviewed — but you can join the **waitlist**! 🔔\n\nIf that application falls through, you'll be next in line. Just open the animal's profile and click 'Join Waitlist'.",
  },
  {
    patterns: ['rent', 'apartment', 'landlord', 'lease'],
    answer: "You can still apply if you rent! 🏢\n\nWe recommend:\n• Getting written permission from your landlord first\n• Checking your lease for pet clauses\n• Mentioning your living situation in your adoption message\n\nMany animals are perfectly suited to apartment living.",
  },
  {
    patterns: ['kids', 'children', 'baby', 'toddler', 'family'],
    answer: "Absolutely! Many of our animals are great with children 👨👩👧\n\nLook for the **'Good w/ Kids'** badge on animal profiles. We recommend a meet & greet with the whole family before finalising the adoption.",
  },
  {
    patterns: ['other pet', 'dog and cat', 'already have', 'existing pet', 'good with pets'],
    answer: "Many of our animals get along great with other pets! 🐾\n\nLook for the **'Good w/ Pets'** badge on animal profiles. When you apply, mention your existing pets — the rescue center will help match you with a compatible animal.",
  },
  {
    patterns: ['cancel', 'withdraw', 'change mind', 'cancel application'],
    answer: "You can contact the rescue center directly to withdraw your application at any time before approval.\n\nView all your applications in **My Profile → Applications**.",
  },
  {
    patterns: ['favorite', 'favourite', 'save', 'saved', 'wishlist', 'heart'],
    answer: "Save animals by clicking the **❤️ heart icon** on any animal card!\n\nAll your saved animals are in **My Profile → Saved Animals** — even after you log out and back in. 💛",
  },
  {
    patterns: ['login', 'account', 'register', 'sign up', 'password'],
    answer: "To get started:\n• Click **Sign Up** to create a free account\n• Or **Login** if you already have one\n\nAll your applications, favourites, and history are saved to your account.",
  },
  {
    patterns: ['notification', 'notify', 'alert'],
    answer: "Want updates even when you're not on this tab? Turn on **Push Notifications** in **My Profile** — you'll be notified about new messages and application decisions the instant they happen. You can toggle it on or off anytime.",
  },
  {
    patterns: ['center', 'shelter', 'location', 'where', 'address', 'visit'],
    answer: "We have **4 partner rescue centers**:\n\n🏥 Happy Tails Shelter — New York, NY\n🏥 Paws Rescue — Los Angeles, CA\n🏥 Second Chance Animal Shelter — Chicago, IL\n🏥 Forever Home Rescue — Austin, TX\n\nVisit the **Centers** tab to explore each one!",
  },
  {
    patterns: ['dog', 'cat', 'rabbit', 'bird', 'species', 'what animals'],
    answer: "We currently have:\n\n🐕 **Dogs** — Golden Retrievers, Huskies, Bulldogs\n🐈 **Cats** — Siamese, Maine Coons, Bengals\n🐇 **Rabbits** — Holland Lops, Angoras\n🦜 **Birds** — Budgerigars, Cockatiels\n\nUse the filter buttons on the **Animals** page to browse by species!",
  },
  {
    patterns: ['approved', 'rejected', 'status', 'application status', 'hear back'],
    answer: "Track your application in **My Profile → Applications**.\n\nStatuses:\n⏳ **Pending** — under review\n✅ **Approved** — the center will contact you\n❌ **Not Approved** — don't give up, apply for another animal!\n\nMost centers respond within 2–5 business days.",
  },
];

const QUICK_QUESTIONS = [
  'How does adoption work?',
  'Is it free to adopt?',
  'What is foster-to-adopt?',
  'Can I adopt if I rent?',
  'What animals are available?',
];

function tokenize(text) {
  return text.toLowerCase().match(/[a-z']+/g) || [];
}

// Very short patterns need exact-token matching, not prefix — "hi" as a
// prefix would match "his"/"history"/"hint"/"hide", all common in ordinary
// sentences ("does he get along with his siblings?").
const EXACT_ONLY_PATTERNS = new Set(['hi']);

// Multi-word phrases are matched as substrings (low collision risk). Single
// words are matched against whole tokens (exact or prefix, e.g. "rent" also
// catches "renting") so short patterns like "cat" or "fee" can't falsely
// trigger on unrelated words that merely contain those letters in the middle
// — e.g. "vacation", "education", "coffee".
function matchesPattern(lowerText, tokens, pattern) {
  if (pattern.includes(' ')) return lowerText.includes(pattern);
  if (EXACT_ONLY_PATTERNS.has(pattern)) return tokens.includes(pattern);
  return tokens.some(t => t === pattern || t.startsWith(pattern));
}

function getBotResponse(input) {
  const lower = input.toLowerCase();
  const tokens = tokenize(input);
  for (const faq of FAQS) {
    if (faq.patterns.some(p => matchesPattern(lower, tokens, p))) return faq.answer;
  }
  return "I'm not sure about that one! 🤔\n\nTry asking about:\n• Adoption process & fees\n• Foster-to-adopt or joining a waitlist\n• Animal health & medical history\n• Getting help after adoption\n• Application status";
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMessage(text) {
  return text.split('\n').map((line, i) => {
    // Escape HTML first so raw user input can never inject markup, then
    // apply the bold-markdown transform on the now-safe text.
    const bold = escapeHtml(line).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: bold }} />;
  });
}

export default function Chatbot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi there! 👋 I'm **Paws**, your adoption assistant!\n\nI can help with questions about adopting, animal health, fees, and more. What would you like to know?" }
  ]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
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
          aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-teal-200/50 hover:shadow-glow-teal hover:scale-105 transition-all border-0 cursor-pointer">
          <span className="text-xl">{open ? '✕' : '🐾'}</span>
          {!open && <span className="text-sm font-bold">Ask me anything!</span>}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-teal-50 flex flex-col overflow-hidden animate-scale-in"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl shadow-sm">🐾</div>
            <div className="flex-1">
              <p className="font-black text-white text-sm">Paws</p>
              <p className="text-teal-100 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-teal-300 rounded-full inline-block animate-pulse" /> Adoption Assistant
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat assistant"
              className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 border-0 cursor-pointer text-sm font-bold transition-all">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-teal-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.from === 'bot' && (
                  <div className="w-7 h-7 bg-teal-100 rounded-xl flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🐾</div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.from === 'user'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-sm shadow-sm'
                    : 'bg-white text-gray-700 shadow-sm border border-teal-100 rounded-bl-sm'}`}>
                  {formatMessage(msg.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-teal-100 rounded-xl flex items-center justify-center text-sm mr-2 flex-shrink-0">🐾</div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-teal-100 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 py-2 bg-white border-t border-teal-50 flex gap-1.5 overflow-x-auto">
            {QUICK_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => send(q)}
                className="flex-shrink-0 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors cursor-pointer font-medium whitespace-nowrap">
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
              aria-label="Type your question"
              className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-teal-100 focus:border-teal-400 focus:outline-none text-sm text-gray-700 bg-teal-50/30 focus:bg-white transition-colors"
            />
            <button onClick={() => send()} aria-label="Send message"
              className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white border-0 cursor-pointer hover:shadow-md hover:shadow-teal-200 transition-all flex-shrink-0">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
