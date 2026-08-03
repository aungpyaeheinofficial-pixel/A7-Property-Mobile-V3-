"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Eye, EyeOff, Globe2, Home, LockKeyhole, Loader2, Mail, Search, Tag } from "lucide-react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { A7Brand } from "@/components/brand/a7-brand";
import { useAuth, type AccountType } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

type Language = "en" | "my";
type AuthMode = "sign-in" | "create";
type AuthStep = "role" | "email" | "password" | "reset";

const copy = {
  en: {
    back: "Back to home",
    language: "English",
    welcome: "Welcome back",
    createTitle: "Create your account",
    subtitle: "Sign in to continue your home search.",
    createSubtitle: "Save homes, message owners, and manage viewings in one place.",
    roleTitle: "How would you like to use A7?",
    roleSubtitle: "Choose your account type. You can upgrade later.",
    seekerTitle: "I'm looking for a home",
    seekerDesc: "Search, save, and contact property owners.",
    listerTitle: "I want to list properties",
    listerDesc: "Post listings, manage inquiries, and track performance.",
    seeker: "Home seeker",
    lister: "Property lister",
    continueRole: "Continue",
    email: "Email address",
    fullName: "Full name",
    fullNamePlaceholder: "Enter your name",
    placeholder: "Enter your email",
    invalidEmail: "Enter a valid email address.",
    continue: "Continue",
    create: "Create account",
    password: "Password",
    confirmPassword: "Confirm password",
    passwordHint: "Use at least 8 characters.",
    invalidPassword: "Password must be at least 8 characters.",
    mismatch: "Passwords do not match.",
    forgot: "Forgot password?",
    resetTitle: "Reset your password",
    resetSubtitle: "We’ll send a secure reset link to your email.",
    sendReset: "Send reset link",
    backToSignIn: "Back to sign in",
    signInButton: "Sign in",
    or: "OR",
    google: "Continue with Google",
    apple: "Continue with Apple",
    facebook: "Continue with Facebook",
    noAccount: "Don’t have an account?",
    hasAccount: "Already have an account?",
    createAccount: "Create account",
    signIn: "Sign in",
    legalStart: "By continuing, you agree to our",
    terms: "Terms of Use",
    and: "and",
    privacy: "Privacy Policy.",
    imageEyebrow: "A7 PROPERTY",
    imageTitle: "Your next home starts here.",
    imageBody: "Explore verified homes and connect with trusted owners across Myanmar.",
    trust: "Verified listings · Clear prices · Direct contact",
  },
  my: {
    back: "ပင်မစာမျက်နှာသို့",
    language: "မြန်မာ",
    welcome: "ပြန်လည်ကြိုဆိုပါတယ်",
    createTitle: "အကောင့်ဖွင့်ပါ",
    subtitle: "အိမ်ရှာဖွေမှုကို ဆက်လုပ်ရန် အကောင့်ဝင်ပါ။",
    createSubtitle: "အိမ်များသိမ်းရန်၊ ပိုင်ရှင်များနှင့် ဆက်သွယ်ရန်နှင့် ကြည့်ရှုချိန်များ စီမံရန် အကောင့်ဖွင့်ပါ။",
    roleTitle: "A7 ကို ဘယ်လို အသုံးပြုချင်ပါသလဲ?",
    roleSubtitle: "အကောင့်အမျိုးအစား ရွေးချယ်ပါ။ နောက်မှ ပြောင်းလို့ရပါသည်။",
    seekerTitle: "အိမ်ရှာဖွေချင်ပါသည်",
    seekerDesc: "ရှာဖွေခြင်း၊ သိမ်းဆည်းခြင်း၊ ပိုင်ရှင်များနှင့် ဆက်သွယ်ခြင်း။",
    listerTitle: "အိမ်များ တင်ချင်ပါသည်",
    listerDesc: "အိမ်များတင်ခြင်း၊ မေးခွန်းများ စီမံခြင်း၊ စာရင်းအင်း ကြည့်ခြင်း။",
    seeker: "အိမ်ရှာသူ",
    lister: "အိမ်တင်သူ",
    continueRole: "ဆက်လုပ်မည်",
    email: "အီးမေးလ်လိပ်စာ",
    fullName: "အမည်",
    fullNamePlaceholder: "သင့်အမည် ရိုက်ထည့်ပါ",
    placeholder: "အီးမေးလ် ရိုက်ထည့်ပါ",
    invalidEmail: "မှန်ကန်သော အီးမေးလ်လိပ်စာ ရိုက်ထည့်ပါ။",
    continue: "ဆက်လုပ်မည်",
    create: "အကောင့်ဖွင့်မည်",
    password: "စကားဝှက်",
    confirmPassword: "စကားဝှက် အတည်ပြုပါ",
    passwordHint: "အနည်းဆုံး စာလုံး ၈ လုံး အသုံးပြုပါ။",
    invalidPassword: "စကားဝှက်သည် အနည်းဆုံး စာလုံး ၈ လုံး ရှိရမည်။",
    mismatch: "စကားဝှက်များ မတူညီပါ။",
    forgot: "စကားဝှက် မေ့နေပါသလား?",
    resetTitle: "စကားဝှက် ပြန်သတ်မှတ်ပါ",
    resetSubtitle: "လုံခြုံသော reset link ကို သင့်အီးမေးလ်သို့ ပို့ပါမည်။",
    sendReset: "Reset link ပို့မည်",
    backToSignIn: "အကောင့်ဝင်ရန် ပြန်သွားမည်",
    signInButton: "အကောင့်ဝင်မည်",
    or: "သို့မဟုတ်",
    google: "Google ဖြင့် ဆက်လုပ်မည်",
    apple: "Apple ဖြင့် ဆက်လုပ်မည်",
    facebook: "Facebook ဖြင့် ဆက်လုပ်မည်",
    noAccount: "အကောင့်မရှိသေးပါသလား?",
    hasAccount: "အကောင့်ရှိပြီးသားလား?",
    createAccount: "အကောင့်ဖွင့်ပါ",
    signIn: "အကောင့်ဝင်ပါ",
    legalStart: "ဆက်လုပ်ခြင်းဖြင့် ကျွန်ုပ်တို့၏",
    terms: "အသုံးပြုမှု စည်းမျဉ်းများ",
    and: "နှင့်",
    privacy: "ကိုယ်ရေးအချက်အလက် မူဝါဒကို သဘောတူပါသည်။",
    imageEyebrow: "A7 PROPERTY",
    imageTitle: "သင့်အိမ်အသစ်ကို ဒီနေရာက စတင်ရှာပါ။",
    imageBody: "မြန်မာနိုင်ငံအနှံ့ စစ်ဆေးအတည်ပြုထားသော အိမ်များကို ရှာဖွေပြီး ယုံကြည်ရသော ပိုင်ရှင်များနှင့် တိုက်ရိုက်ဆက်သွယ်ပါ။",
    trust: "စစ်ဆေးထားသောအိမ် · ရှင်းလင်းသောဈေးနှုန်း · တိုက်ရိုက်ဆက်သွယ်မှု",
  },
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SocialMark({ provider }: { provider: "Google" | "Apple" | "Facebook" }) {
  if (provider === "Google") {
    return <Icon icon="logos:google-icon" width={20} />;
  }
  if (provider === "Apple") {
    return <Icon icon="ph:apple-logo-fill" className="size-5 text-black" />;
  }
  return <Icon icon="logos:facebook" width={20} />;
}

function RoleOption({ selected, onSelect, icon, title, desc, label, reduceMotion }: { selected: boolean; onSelect: () => void; icon: React.ReactNode; title: string; desc: string; label: string; reduceMotion: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={false}
      animate={{ scale: selected ? 1.01 : 1 }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-[border-color,box-shadow,background-color] ${selected ? "border-[#0057D9] bg-[#F5F8FD] shadow-[0_0_0_4px_rgba(0, 87, 217,.08)]" : "border-[#E1E6ED] bg-white hover:border-[#B7C2D0]"}`}
      aria-pressed={selected}
    >
      <motion.span
        animate={{ rotate: selected ? 0 : 0, scale: selected ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`grid size-11 shrink-0 place-items-center rounded-xl transition-colors ${selected ? "bg-[#0057D9] text-white" : "bg-[#F1F6FF] text-[#0057D9]"}`}
      >{icon}</motion.span>
      <span className="min-w-0 flex-1">
        <strong className="block text-[14px] font-semibold text-[#172133]">{title}</strong>
        <span className="mt-1 block text-[12px] leading-5 text-[#687385]">{desc}</span>
        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${selected ? "bg-[#0057D9] text-white" : "bg-[#F1F6FF] text-[#59616A]"}`}>{label}</span>
      </span>
      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#0057D9]" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function SignInView() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const reduceMotion = useReducedMotion() ?? false;
  const [language, setLanguage] = useState<Language>("en");
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [step, setStep] = useState<AuthStep>("role");
  const [accountType, setAccountType] = useState<AccountType>("seeker");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [socialProvider, setSocialProvider] = useState<"Google" | "Apple" | "Facebook" | null>(null);
  const [notice, setNotice] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const text = copy[language];
  const hasError = touched && !emailPattern.test(email);
  const passwordError = touched && step === "password" && password.length < 8
    ? text.invalidPassword
    : touched && step === "password" && mode === "create" && password !== confirmPassword
      ? text.mismatch
      : "";

  function continueToDashboard(provider?: "Google" | "Apple" | "Facebook") {
    setSubmitting(true);
    if (mode === "create") {
      const name = fullName.trim() || email.split("@")[0] || "User";
      signUp(email, name, accountType);
    } else {
      signIn(email, accountType);
    }
    window.sessionStorage.setItem("a7-auth-preview-email", email);
    window.sessionStorage.setItem("a7-auth-preview-mode", mode);
    window.sessionStorage.setItem("a7-auth-preview-account-type", accountType);
    if (provider) window.sessionStorage.setItem("a7-auth-preview-provider", provider);
    window.setTimeout(() => {
      router.push(accountType === "lister" ? "/owner" : "/dashboard");
    }, 600);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (step === "reset") {
      setNotice(`Reset link sent to ${email}.`);
      setTouched(false);
      return;
    }
    if (step === "role") {
      setStep("email");
      setTouched(false);
      setNotice("");
      return;
    }
    if (!emailPattern.test(email)) return;
    if (step === "email") {
      setStep("password");
      setTouched(false);
      setNotice("");
      return;
    }
    if (password.length < 8 || (mode === "create" && password !== confirmPassword)) return;
    continueToDashboard();
  }

  function handleSocial(provider: "Google" | "Apple" | "Facebook") {
    setSocialProvider(provider);
    setNotice(`${provider} account ready to continue.`);
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setStep("role");
    setTouched(false);
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    setFullName("");
    setNotice("");
    setSocialProvider(null);
  }

  return (
    <main className="min-h-svh bg-[#F3F6FA] p-0 lg:p-3" lang={language === "my" ? "my" : "en"}>
      <div className="mx-auto grid min-h-svh max-w-[1720px] overflow-hidden bg-white shadow-[0_24px_80px_rgba(16,35,61,.12)] lg:min-h-[calc(100svh-24px)] lg:grid-cols-[minmax(430px,36%)_1fr] lg:rounded-[28px] lg:border lg:border-[#E3E8EF]">
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 order-2 -mt-7 flex min-h-[calc(100svh-165px)] flex-col rounded-t-[28px] bg-white px-5 pb-7 pt-6 sm:px-9 lg:order-1 lg:mt-0 lg:min-h-0 lg:rounded-none lg:px-[clamp(44px,5vw,86px)] lg:py-10"
        >
          <div className="flex items-center justify-between">
            <Link href="/" aria-label={text.back} className="rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0057D9]/20">
              <A7Brand />
            </Link>
            <Link href="/" className="grid size-10 place-items-center rounded-full border border-[#DCE2EA] text-[#596473] transition-colors hover:bg-[#FAF8F5] lg:hidden" aria-label={text.back}>
              <ArrowLeft className="size-[18px]" />
            </Link>
          </div>

          <div className="my-auto w-full max-w-[430px] self-center py-10 lg:py-12">
            <motion.div
              key={`${mode}-${language}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
            >
              <h1 className="text-[32px] font-semibold tracking-[-0.045em] text-[#172133] sm:text-[36px]">
                {step === "reset" ? text.resetTitle : step === "role" ? text.roleTitle : mode === "sign-in" ? text.welcome : text.createTitle}
              </h1>
              <p className="mt-2.5 max-w-[390px] text-[15px] leading-6 text-[#687385]">
                {step === "reset" ? text.resetSubtitle : step === "role" ? text.roleSubtitle : step === "password" ? email : mode === "sign-in" ? text.subtitle : text.createSubtitle}
              </p>
            </motion.div>

            <form className="mt-9" onSubmit={handleSubmit} noValidate>
              <AnimatePresence mode="wait">
              {step === "role" && (
                <motion.div key="role-step" initial={reduceMotion ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -20 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="space-y-3">
                  <RoleOption
                    selected={accountType === "seeker"}
                    onSelect={() => setAccountType("seeker")}
                    icon={<Search className="size-5" />}
                    title={text.seekerTitle}
                    desc={text.seekerDesc}
                    label={text.seeker}
                    reduceMotion={reduceMotion}
                  />
                  <RoleOption
                    selected={accountType === "lister"}
                    onSelect={() => setAccountType("lister")}
                    icon={<Tag className="size-5" />}
                    title={text.listerTitle}
                    desc={text.listerDesc}
                    label={text.lister}
                    reduceMotion={reduceMotion}
                  />
                  <Button type="submit" className="mt-4 h-[54px] w-full rounded-xl text-[15px] shadow-[0_10px_24px_rgba(0, 87, 217,.22)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0, 87, 217,.28)]">
                    {text.continueRole}
                    <ArrowRight className="size-[18px]" aria-hidden="true" />
                  </Button>
                </motion.div>
              )}

              {(step === "email" || step === "reset") && (
                <motion.div key="email-step" initial={reduceMotion ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -20 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                  <label htmlFor="email" className="text-[13px] font-semibold text-[#222B3A]">{text.email}</label>
                  <div className={`mt-2 flex h-[54px] items-center gap-3 rounded-xl border bg-white px-4 transition-[border-color,box-shadow] ${hasError ? "border-[#D92D20] shadow-[0_0_0_3px_rgba(217,45,32,.10)]" : "border-[#CCD4DE] focus-within:border-[#0057D9] focus-within:shadow-[0_0_0_4px_rgba(0, 87, 217,.12)]"}`}>
                    <Mail className={`size-5 shrink-0 ${hasError ? "text-[#D92D20]" : "text-[#7B8798]"}`} aria-hidden="true" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      data-focus-ring="parent"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => setTouched(true)}
                      placeholder={text.placeholder}
                      aria-invalid={hasError}
                      aria-describedby={hasError ? "email-error" : undefined}
                      className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-[15px] text-[#172133] outline-none ring-0 placeholder:text-[#9AA3B1] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="min-h-6 pt-1.5">
                    {hasError && <p id="email-error" className="text-xs text-[#C4322B]" role="alert">{text.invalidEmail}</p>}
                  </div>
                </motion.div>
              )}

              {step === "email" && mode === "create" && (
                <>
                  <label htmlFor="full-name" className="text-[13px] font-semibold text-[#222B3A]">{text.fullName || "Full name"}</label>
                  <div className="mt-2 mb-3 flex h-[54px] items-center gap-3 rounded-xl border border-[#CCD4DE] bg-white px-4 focus-within:border-[#0057D9] focus-within:shadow-[0_0_0_4px_rgba(0, 87, 217,.12)]">
                    <Home className="size-5 shrink-0 text-[#7B8798]" aria-hidden="true" />
                    <input
                      id="full-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder={text.fullNamePlaceholder || "Enter your name"}
                      className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-[15px] text-[#172133] outline-none ring-0 placeholder:text-[#9AA3B1] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {step === "password" && (
                <motion.div key="password-step" initial={reduceMotion ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -20 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                  <button type="button" onClick={() => { setStep("email"); setTouched(false); setNotice(""); }} className="mb-5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#0057D9]"><ArrowLeft className="size-4" />Change email</button>
                  <label htmlFor="password" className="text-[13px] font-semibold text-[#222B3A]">{text.password}</label>
                  <div className={`mt-2 flex h-[54px] items-center gap-3 rounded-xl border bg-white px-4 ${passwordError ? "border-[#D92D20]" : "border-[#CCD4DE] focus-within:border-[#0057D9] focus-within:shadow-[0_0_0_4px_rgba(0, 87, 217,.12)]"}`}>
                    <LockKeyhole className="size-5 shrink-0 text-[#7B8798]" />
                    <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "create" ? "new-password" : "current-password"} className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} className="grid size-9 place-items-center rounded-full text-[#7B8798] hover:bg-[#F3F5F8]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}</button>
                  </div>
                  {mode === "create" && (
                    <>
                      <label htmlFor="confirm-password" className="mt-4 block text-[13px] font-semibold text-[#222B3A]">{text.confirmPassword}</label>
                      <div className="mt-2 flex h-[54px] items-center gap-3 rounded-xl border border-[#CCD4DE] bg-white px-4 focus-within:border-[#0057D9] focus-within:shadow-[0_0_0_4px_rgba(0, 87, 217,.12)]">
                        <LockKeyhole className="size-5 shrink-0 text-[#7B8798]" />
                        <input id="confirm-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
                      </div>
                    </>
                  )}
                  <div className="flex min-h-9 items-start justify-between gap-3 pt-2">
                    <p className={`text-xs ${passwordError ? "text-[#C4322B]" : "text-[#8A93A1]"}`} role={passwordError ? "alert" : undefined}>{passwordError || text.passwordHint}</p>
                    {mode === "sign-in" && <button type="button" onClick={() => { setStep("reset"); setTouched(false); setNotice(""); }} className="shrink-0 text-xs font-semibold text-[#0057D9] hover:underline">{text.forgot}</button>}
                  </div>
                </motion.div>
              )}

              {notice && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-[#EEF5FC] px-4 py-3 text-xs text-[#27714D]"><CheckCircle2 className="size-4" />{notice}</div>}

              {step !== "role" && (
                <motion.div initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <Button type="submit" disabled={!email.trim() || submitting || (step === "password" && (password.length < 8 || (mode === "create" && password !== confirmPassword)))} className="h-[54px] w-full rounded-xl text-[15px] shadow-[0_10px_24px_rgba(0, 87, 217,.22)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0, 87, 217,.28)]">
                  {submitting ? <Loader2 className="size-[18px] animate-spin" aria-hidden="true" /> : <ArrowRight className="size-[18px]" aria-hidden="true" />}
                  {step === "reset" ? text.sendReset : step === "password" ? (mode === "sign-in" ? text.signInButton : text.create) : text.continue}
                </Button>
                </motion.div>
              )}
              {step === "reset" && <button type="button" onClick={() => { setStep("email"); setNotice(""); setTouched(false); }} className="mt-4 w-full text-center text-xs font-semibold text-[#0057D9]">{text.backToSignIn}</button>}
              </AnimatePresence>
            </form>

            {step === "email" && (
              <>
                <div className="my-6 flex items-center gap-4 text-[11px] font-medium text-[#8A93A1]" aria-hidden="true">
                  <span className="h-px flex-1 bg-[#E1E6ED]" />
                  {text.or}
                  <span className="h-px flex-1 bg-[#E1E6ED]" />
                </div>

                <div className="space-y-3">
                  {(["Google", "Apple", "Facebook"] as const).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => handleSocial(provider)}
                      className="relative flex h-[52px] w-full items-center justify-center rounded-xl border border-[#D6DDE6] bg-white px-5 text-[14px] font-medium text-[#202938] shadow-[0_1px_2px_rgba(16,35,61,.04)] transition-[background-color,border-color,transform,box-shadow] hover:-translate-y-px hover:border-[#B7C2D0] hover:bg-[#FAFBFD] hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0057D9]/15"
                    >
                      <span className="absolute left-5 grid size-6 place-items-center"><SocialMark provider={provider} /></span>
                      {provider === "Google" ? text.google : provider === "Apple" ? text.apple : text.facebook}
                    </button>
                  ))}
                </div>
                {socialProvider && (
                  <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="mt-4 rounded-2xl border border-[#BCD5FA] bg-[#F5F8FD] p-4">
                    <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white shadow-sm"><SocialMark provider={socialProvider} /></span><span><strong className="block text-xs">{socialProvider} connected</strong><small className="mt-1 block text-[10px] text-[#728091]">Continue to your private A7 home journey.</small></span></div>
                    <Button className="mt-4 w-full rounded-xl" onClick={() => continueToDashboard(socialProvider)}>Continue with {socialProvider}</Button>
                  </motion.div>
                )}
              </>
            )}

            {step === "email" && <p className="mt-8 text-center text-[13px] text-[#737E8E]">
              {mode === "sign-in" ? text.noAccount : text.hasAccount}{" "}
              <button type="button" onClick={() => changeMode(mode === "sign-in" ? "create" : "sign-in")} className="font-semibold text-[#0057D9] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0057D9]/25">
                {mode === "sign-in" ? text.createAccount : text.signIn}
              </button>
            </p>}
          </div>

          <p className="mx-auto max-w-[430px] text-center text-[11px] leading-5 text-[#838D9C]">
            {text.legalStart}{" "}
            <Link href="/terms" className="font-medium text-[#0057D9] hover:underline">{text.terms}</Link>{" "}
            {text.and}{" "}
            <Link href="/privacy" className="font-medium text-[#0057D9] hover:underline">{text.privacy}</Link>
          </p>
        </motion.section>

        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 h-[192px] overflow-hidden bg-[#D8E2E8] lg:order-2 lg:h-auto"
          aria-label="A warm, light-filled home interior"
        >
          <Image
            src="/images/properties/warm-living-room.jpg"
            alt="Warm, sunlit living room in a modern Myanmar home"
            fill
            priority
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="object-cover object-[50%_52%] lg:object-[48%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#132035]/45 via-transparent to-[#132035]/10 lg:from-[#132035]/52" />

          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "my" : "en")}
            className="absolute right-4 top-4 flex h-11 items-center gap-2.5 rounded-xl border border-white/60 bg-white/92 px-3.5 text-[12px] font-medium text-[#202938] shadow-[0_8px_24px_rgba(15,27,44,.14)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 lg:right-8 lg:top-8 lg:h-12 lg:px-4 lg:text-[13px]"
            aria-label={language === "en" ? "မြန်မာဘာသာသို့ ပြောင်းရန်" : "Switch to English"}
          >
            <Globe2 className="size-[18px]" aria-hidden="true" />
            {text.language}
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>

          <div className="absolute inset-x-6 bottom-6 hidden max-w-[540px] text-white lg:block lg:inset-x-10 lg:bottom-10 xl:left-14 xl:bottom-14">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/76">{text.imageEyebrow}</p>
            <h2 className="mt-3 text-[clamp(30px,3vw,52px)] font-semibold leading-[1.03] tracking-[-0.05em] text-white">{text.imageTitle}</h2>
            <p className="mt-4 max-w-[500px] text-[14px] leading-6 text-white/84">{text.imageBody}</p>
            <div className="mt-6 inline-flex rounded-full border border-white/22 bg-[#10233A]/28 px-4 py-2 text-[11px] font-medium text-white/90 backdrop-blur-md">{text.trust}</div>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}

export { SignInView };
