import Link from 'next/link';
import type { ReactNode } from 'react';
import { FOOTER_COLUMNS } from '@/lib/home-data';
import PhoenixLogoMark from './PhoenixLogoMark';

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] tracking-wide transition-colors duration-200 block"
    >
      {children}
    </Link>
  );
}

export default function PhoenixFooter() {
  return (
    <footer className="phx-footer relative bg-[#03040A] text-[#F8FAFC] w-full flex flex-col overflow-hidden pt-14 px-6 md:px-12 lg:px-24 border-t border-white/10">
      <article id="lighting-wrap" className="phx-footer-lighting" aria-hidden>
        <article id="lightings">
          <section id="light-one" className="lighting-section">
            <section id="light-two" className="lighting-section">
              <section id="light-three" className="lighting-section">
                <section id="light-four" className="lighting-section">
                  <section id="light-five" className="lighting-section" />
                </section>
              </section>
            </section>
          </section>
        </article>
      </article>

      <div className="flex flex-col lg:flex-row justify-between w-full pb-12 z-10 relative gap-10">
        <div className="flex flex-col max-w-xl">
          <Link href="/" className="flex items-center gap-3 mb-6 cursor-pointer w-fit">
            <PhoenixLogoMark size={32} />
            <span className="font-semibold text-[#F8FAFC] text-lg">Phoenix OS</span>
          </Link>

          <h2 className="text-2xl md:text-4xl font-semibold leading-tight text-[#F8FAFC] mb-4">
            Clinic operating system
            <br />
            for modern practices
          </h2>

          <p className="text-[#64748B] text-sm leading-relaxed max-w-md">
            Starting with veterinary clinics and scaling to dental, general, and specialty practices —
            one intelligent OS for queue, records, billing, and audit-ready workflows.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col space-y-4">
              <h3 className="text-[#64748B] text-[11px] font-mono uppercase tracking-[0.2em]">
                {column.title}
              </h3>
              <ul className="flex flex-col space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full pointer-events-none select-none flex justify-center overflow-hidden">
        <h2 className="phx-footer-wordmark text-[13vw] font-bold leading-none translate-y-[28%] tracking-tighter whitespace-nowrap">
          Phoenix OS
        </h2>
      </div>

      <div className="mt-auto pb-6 pt-10 z-10 text-center w-full relative">
        <p className="text-[10px] tracking-[0.2em] text-[#475569] font-mono uppercase">
          &copy; {new Date().getFullYear()} Phoenix OS — Clinic Operating System
        </p>
      </div>
    </footer>
  );
}
