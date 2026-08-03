import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";

interface InformationSection {
  title: string;
  body: string;
  points?: string[];
}

interface InformationPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  sections: InformationSection[];
  helpMode?: boolean;
}

function InformationPage({ eyebrow, title, intro, updated = "Updated 29 July 2026", sections, helpMode = false }: InformationPageProps) {
  return (
    <div className="min-h-screen bg-[#F7F7F4] text-[#17263A]">
      <AppHeader compact />
      <main className="mx-auto max-w-[1120px] px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#0057D9]"><ArrowLeft className="size-4" />Back to A7 Property</Link>
        <section className="mt-8 overflow-hidden rounded-[32px] bg-[#17304A] px-6 py-10 text-white shadow-[0_18px_55px_rgba(23,48,74,.18)] sm:px-10 sm:py-14 lg:px-14">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#BFD8FF]">{helpMode ? <HelpCircle className="size-6" /> : <ShieldCheck className="size-6" />}</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">{eyebrow}</p>
              <h1 className="mt-3 max-w-[760px] text-[38px] font-semibold leading-[1.04] tracking-[-0.055em] sm:text-[54px]">{title}</h1>
              <p className="mt-5 max-w-[720px] text-[14px] leading-7 text-white/72 sm:text-[16px]">{intro}</p>
              <p className="mt-6 text-[10px] font-medium text-white/42">{updated}</p>
            </div>
          </div>
        </section>

        {helpMode && (
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: "Find a home", body: "Search, filters, saved homes, and recommendations.", href: "/search?purpose=rent" },
              { title: "Talk to an owner", body: "Open your conversations and viewing requests.", href: "/dashboard?section=messages#conversations" },
              { title: "Ask A7", body: "Describe what you need in everyday language.", href: "/assistant" },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(26,39,56,.06)] ring-1 ring-[#17263A]/7 transition-transform hover:-translate-y-0.5">
                <strong className="text-sm">{item.title}</strong>
                <p className="mt-2 text-[11px] leading-5 text-[#6C7884]">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[#0057D9]">Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </section>
        )}

        <div className="mt-10 grid gap-5 sm:mt-12">
          {sections.map((section, index) => (
            <section key={section.title} className="rounded-[26px] bg-white p-6 shadow-[0_10px_34px_rgba(26,39,56,.05)] ring-1 ring-[#17263A]/7 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EEF5FC] text-[11px] font-semibold text-[#0057D9]">{index + 1}</span>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-[-0.035em]">{section.title}</h2>
                  <p className="mt-3 text-[13px] leading-7 text-[#64717E]">{section.body}</p>
                  {section.points && (
                    <ul className="mt-5 grid gap-3">
                      {section.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-[12px] leading-6 text-[#536170]"><CheckCircle2 className="mt-1 size-4 shrink-0 text-[#2B7A52]" />{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 flex flex-col gap-4 rounded-[26px] border border-[#BCD5FA] bg-[#F1F6FF] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div><h2 className="text-lg font-semibold">Still need help?</h2><p className="mt-2 text-xs text-[#637284]">Ask A7 or contact the trust team from your profile.</p></div>
          <Link href="/assistant" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0057D9] px-5 text-xs font-semibold text-white">Ask A7 AI <ArrowRight className="size-4" /></Link>
        </section>
      </main>
    </div>
  );
}

export { InformationPage };
export type { InformationSection };
