"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  ChevronDown,
  CircleUserRound,
  Heart,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { A7Brand } from "@/components/brand/a7-brand";
import { PropertyCard } from "@/components/property/property-card";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import properties from "@/public/data/properties.json";

type Purpose = "rent" | "sale";

const townships = [
  { name: "Bahan", note: "Quiet & central", icon: "BH" },
  { name: "Sanchaung", note: "Lively & local", icon: "SC" },
  { name: "Yankin", note: "Modern living", icon: "YK" },
  { name: "Kamayut", note: "Close to everything", icon: "KM" },
  { name: "Mayangone", note: "Space to grow", icon: "MY" },
  { name: "Hlaing", note: "Easy commute", icon: "HL" },
  { name: "Dagon", note: "Heritage heart", icon: "DG" },
];

const featuredProperties = [properties[0], properties[1], properties[2], properties[4]];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function HomePage() {
  const router = useRouter();
  const [purpose, setPurpose] = useState<Purpose>("rent");
  const [location, setLocation] = useState("Yangon");
  const [budget, setBudget] = useState("Any budget");
  const [propertyType, setPropertyType] = useState("Any home");
  const [saved, setSaved] = useState<string[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantReply, setAssistantReply] = useState(
    "Tell me what matters most—your commute, budget, or the feeling you want at home.",
  );

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved);
    if (stored.length) queueMicrotask(() => setSaved(stored));
  }, []);

  const budgetOptions = useMemo(
    () =>
      purpose === "rent"
        ? ["Any budget", "Up to 500,000 MMK", "Up to 800,000 MMK", "Up to 1,500,000 MMK"]
        : ["Any budget", "Up to 200M MMK", "Up to 500M MMK", "500M MMK+"] ,
    [purpose],
  );

  function changePurpose(next: Purpose) {
    setPurpose(next);
    setBudget("Any budget");
  }

  function toggleSaved(id: string) {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      writeStoredIds(STORAGE_KEYS.saved, next);
      return next;
    });
  }

  function runSearch() {
    const params = new URLSearchParams({ purpose, location });
    if (propertyType !== "Any home") params.set("type", propertyType.toLowerCase());
    const maxPrice = budget.match(/[\d,.]+/)?.[0]?.replaceAll(",", "");
    if (maxPrice) {
      const multiplier = budget.includes("M MMK") ? 1_000_000 : 1;
      params.set("maxPrice", String(Number(maxPrice) * multiplier));
    }
    router.push(`/search?${params.toString()}`);
  }

  function askAssistant(event?: FormEvent) {
    event?.preventDefault();
    const question = assistantInput.trim();
    if (!question) return;
    const reply = question.toLowerCase().includes("family")
      ? "I’d start with Yankin and Mayangone: more 3-bedroom options, calmer streets, and verified family homes from 800,000 MMK/month."
      : question.toLowerCase().includes("work") || question.toLowerCase().includes("commute")
        ? "Kamayut, Sanchaung, and Hlaing are strong commute-friendly matches. I’ll prioritize homes near main roads without putting you on a noisy street."
        : "I found a good starting point: verified homes in Yankin and Bahan with natural light, clear terms, and responsive owners. You can refine this anytime.";
    setAssistantReply(reply);
    setAssistantInput("");
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="A7 Property home"><A7Brand showMyanmar /></Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/search">Search</Link>
          <Link href="/search?purpose=rent">Rent</Link>
          <Link href="/search?purpose=sale">Buy</Link>
          <Link href="/dashboard?section=saved">Saved{saved.length ? <span className="saved-count">{saved.length}</span> : null}</Link>
        </nav>

        <div className="nav-actions">
          <Link className="list-property" href="/owner">List your property</Link>
          <Link className="profile-button" href="/dashboard" aria-label="Open profile"><Menu size={18} /><CircleUserRound size={26} /></Link>
          <button className="mobile-menu-button" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu size={22} /></button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div className="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mobile-menu-panel" initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }}>
              <button className="close-menu" aria-label="Close menu" onClick={() => setMobileMenu(false)}><X /></button>
              <Link className="brand" href="/" onClick={() => setMobileMenu(false)}><A7Brand /></Link>
              <Link href="/search" onClick={() => setMobileMenu(false)}>Find a home</Link>
              <a href="#featured" onClick={() => setMobileMenu(false)}>Featured homes</a>
              <a href="#verified" onClick={() => setMobileMenu(false)}>How verification works</a>
              <Link href="/assistant" onClick={() => setMobileMenu(false)}>Ask the AI assistant</Link>
              <Link className="primary-button" href="/owner" onClick={() => setMobileMenu(false)}>List your property</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="top">
        <section className="hero-section">
          <div className="hero-image-wrap">
            <Image src="/images/properties/hero-yangon-home.jpg" alt="Warm contemporary home in Yangon surrounded by a tropical garden" className="hero-image" fill priority sizes="100vw" />
            <div className="hero-scrim" />
            <div className="hero-content">
              <div className="eyebrow light"><span /> A better way to find home</div>
              <h1>Find a place<br />you can call <em>home.</em></h1>
              <p>Verified homes, clear details, and people you can trust—made for life in Myanmar.</p>
            </div>
            <div className="hero-property-pill">
              <span className="verified-dot"><ShieldCheck size={16} /></span>
              <span><strong>Verified home</strong><small>Bahan, Yangon · For sale</small></span>
              <ArrowRight size={18} />
            </div>
          </div>

          <div className="search-panel" id="search">
            <div className="purpose-tabs" role="tablist" aria-label="Search purpose">
              <button role="tab" aria-selected={purpose === "rent"} className={purpose === "rent" ? "selected" : ""} onClick={() => changePurpose("rent")}>Rent a home</button>
              <button role="tab" aria-selected={purpose === "sale"} className={purpose === "sale" ? "selected" : ""} onClick={() => changePurpose("sale")}>Buy a home</button>
            </div>
            <div className="search-fields">
              <label className="search-field">
                <span><MapPin size={17} /> Location</span>
                <select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Location">
                  <option>Yangon</option><option>Mandalay</option><option>Bahan</option><option>Kamayut</option><option>Yankin</option><option>Sanchaung</option><option>Mayangone</option>
                </select>
                <ChevronDown size={16} />
              </label>
              <label className="search-field">
                <span><Building2 size={17} /> Property type</span>
                <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)} aria-label="Property type">
                  <option>Any home</option><option>Apartment</option><option>Condo</option><option>House</option><option>Villa</option>
                </select>
                <ChevronDown size={16} />
              </label>
              <label className="search-field">
                <span><span className="mmk-icon">K</span> Budget</span>
                <select value={budget} onChange={(event) => setBudget(event.target.value)} aria-label="Budget">
                  {budgetOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
                <ChevronDown size={16} />
              </label>
              <button className="search-button" onClick={runSearch}><Search size={20} /><span>Search homes</span></button>
            </div>
            <div className="search-hint"><Sparkles size={15} /> Not sure where to begin? <a href="#assistant">Ask our home assistant</a></div>
          </div>
        </section>

        <motion.section className="section location-section" {...fadeUp}>
          <div className="section-heading-row">
            <div><div className="eyebrow"><span /> Explore Yangon</div><h2>Find your neighbourhood</h2></div>
            <a className="text-link" href="#featured">View all locations <ArrowRight size={17} /></a>
          </div>
          <div className="township-scroll">
            {townships.map((township, index) => (
              <button className="township-card" key={township.name} onClick={() => { setLocation(township.name); document.querySelector("#search")?.scrollIntoView({ behavior: "smooth" }); }}>
                <span className={`township-monogram tone-${(index % 4) + 1}`}>{township.icon}</span>
                <span><strong>{township.name}</strong><small>{township.note}</small></span>
                <ArrowRight size={17} />
              </button>
            ))}
          </div>
        </motion.section>

        <section className="section featured-section" id="featured">
          <motion.div className="section-heading-row" {...fadeUp}>
            <div><div className="eyebrow"><span /> Handpicked for you</div><h2>Homes worth seeing</h2><p className="section-subtitle">Fresh, complete listings from responsive owners.</p></div>
            <a className="text-link desktop-only" href="#search">Explore all homes <ArrowRight size={17} /></a>
          </motion.div>
          <div className="property-grid" aria-live="polite">
            {featuredProperties.map((property, index) => {
              const isSaved = saved.includes(property.id);
              return (
                <motion.div className="property-card-slot" key={property.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.06 }}>
                  <PropertyCard
                    property={property}
                    href={`/properties/${property.id}`}
                    isFavorite={isSaved}
                    onFavoriteToggle={(selectedProperty) => toggleSaved(selectedProperty.id)}
                  />
                </motion.div>
              );
            })}
          </div>
          <a className="mobile-view-all" href="#search">Explore all homes <ArrowRight size={17} /></a>
        </section>

        <section className="trust-section" id="verified">
          <motion.div className="trust-story" {...fadeUp}>
            <div className="trust-seal"><ShieldCheck size={33} /><span>A7<br /><small>verified</small></span></div>
            <div className="eyebrow light"><span /> Trust, built in</div>
            <h2>Homes you can<br /><em>believe in.</em></h2>
            <p>Finding a home is a big decision. We check the details that matter before a listing earns our verified mark.</p>
            <a href="#featured" className="light-link">Explore verified homes <ArrowRight size={17} /></a>
          </motion.div>
          <motion.div className="trust-checks" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <div className="trust-check"><span><Check /></span><div><strong>Identity checked</strong><p>Owners and agents confirm their phone number and identity.</p></div></div>
            <div className="trust-check"><span><Check /></span><div><strong>Details reviewed</strong><p>Prices, photos, key facts, and locations are checked for completeness.</p></div></div>
            <div className="trust-check"><span><Check /></span><div><strong>Availability refreshed</strong><p>We regularly ask listers to confirm that a home is still available.</p></div></div>
            <div className="trust-note"><ShieldCheck size={18} /><span><strong>See something wrong?</strong> Report it in one tap. Our team reviews every concern.</span></div>
          </motion.div>
        </section>

        <section className="section assistant-section" id="assistant">
          <motion.div className="assistant-copy" {...fadeUp}>
            <div className="ai-orb"><Sparkles size={25} /></div>
            <div className="eyebrow"><span /> Your personal guide</div>
            <h2>Describe your life.<br />We’ll help find the home.</h2>
            <p>Skip the complicated filters. Tell A7 what matters and get a small set of homes with clear reasons for every match.</p>
            <div className="assistant-prompts">
              {["Near work, but quiet", "A family home under 800k", "Bright apartment in Yankin"].map((prompt) => (
                <button key={prompt} onClick={() => setAssistantInput(prompt)}>{prompt} <ArrowRight size={14} /></button>
              ))}
            </div>
          </motion.div>
          <motion.div className="assistant-demo" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <div className="assistant-window-top"><span className="assistant-avatar"><Bot size={20} /></span><span><strong>A7 home assistant</strong><small>Usually replies instantly</small></span><span className="online-dot" /></div>
            <div className="assistant-chat">
              <div className="assistant-message"><Sparkles size={16} /><p>{assistantReply}</p></div>
              <div className="match-preview">
                <Image src="/images/properties/warm-living-room.jpg" alt="Recommended bright apartment in Yankin" width={200} height={152} />
                <div><small>98% match · Verified</small><strong>Bright 2-bed in Yankin</strong><span>800,000 MMK / month</span></div>
              </div>
            </div>
            <form className="assistant-input" onSubmit={askAssistant}>
              <input value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} placeholder="Tell me what home feels right..." aria-label="Ask the home assistant" />
              <button aria-label="Send message" type="submit"><Send size={18} /></button>
            </form>
          </motion.div>
        </section>

        <section className="owner-banner section">
          <div><span className="owner-icon"><Home size={24} /></span><div><h2>Have a place to call someone’s home?</h2><p>List with clear guidance, reach serious seekers, and stay in control.</p></div></div>
          <Link className="primary-button" href="/owner">List your property <ArrowRight size={17} /></Link>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand"><a className="brand inverted" href="#top"><A7Brand inverted /></a><p>A simpler, safer way to find home in Myanmar.</p><button className="language-button">English <span>·</span> မြန်မာ <ChevronDown size={15} /></button></div>
          <div><strong>Discover</strong><Link href="/search?purpose=rent">Rent a home</Link><Link href="/search?purpose=sale">Buy a home</Link><a href="#featured">Popular locations</a><Link href="/assistant">AI home assistant</Link></div>
          <div><strong>List with us</strong><Link href="/owner">List a property</Link><Link href="/owner">Owner guide</Link><Link href="/agent">Agent tools</Link><a href="#verified">Verification</a></div>
          <div><strong>Company</strong><a href="#top">About A7 Property</a><a href="#top">Trust & safety</a><a href="#top">Help centre</a><a href="#top">Contact</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 A7 Property. Built with care in Myanmar.</span><span><a href="#top">Privacy</a><a href="#top">Terms</a><a href="#top">Community standards</a></span></div>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <a href="#top" className="active"><Home size={20} /><span>Home</span></a>
        <Link href="/search"><Search size={20} /><span>Search</span></Link>
        <Link href="/dashboard?section=saved" className="mobile-saved"><Heart size={20} /><span>Saved</span>{saved.length ? <b>{saved.length}</b> : null}</Link>
        <Link href="/assistant"><MessageCircle size={20} /><span>Assistant</span></Link>
      </nav>
    </div>
  );
}
