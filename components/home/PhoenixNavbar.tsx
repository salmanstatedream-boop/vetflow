'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LineHoverLink } from '@/components/ui/line-hover-link';
import { SpotlightNavbar } from '@/components/ui/spotlight-navbar';
import { NAV_LINKS } from '@/lib/home-data';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import PhoenixLogoMark from './PhoenixLogoMark';
import { useLenis } from './SmoothScrollProvider';

const SCROLL_OFFSET = -96;

export default function PhoenixNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const lenis = useLenis();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const el = document.querySelector<HTMLElement>(href);
    if (el) {
      if (lenis) {
        lenis.scrollTo(el, { offset: SCROLL_OFFSET });
      } else {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    }
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-4 lg:inset-x-8 top-4 z-50 max-w-5xl mx-auto">
      <div
        className={cn(
          'rounded-2xl border transition-all duration-200 overflow-hidden',
          scrolled || open
            ? 'bg-[#03040A]/85 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-[#03040A]/40 backdrop-blur-md border-white/5',
        )}
      >
        <div className="flex h-[var(--phx-nav-height)] items-center justify-between gap-4 px-4 sm:px-5">
          <Link
            href="/"
            className="flex items-center gap-3 cursor-pointer group shrink-0 phx-focus-ring rounded-xl"
          >
            <PhoenixLogoMark />
            <div className="leading-tight">
              <div className="font-semibold text-[#F8FAFC] group-hover:text-[#22D3EE] transition-colors duration-200">
                Phoenix OS
              </div>
              <div className="text-[11px] text-[#64748B] hidden sm:block">Clinic Operating System</div>
            </div>
          </Link>

          <div className="hidden lg:flex flex-1 justify-center">
            <SpotlightNavbar
              className="!pt-0"
              items={NAV_LINKS.map((link) => ({ label: link.label, href: link.href }))}
              onItemClick={(item) => scrollToSection(item.href)}
            />
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="phx-btn-ghost text-sm px-4 py-2 phx-focus-ring transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/request-access"
              className="phx-btn-primary text-sm px-4 py-2 phx-focus-ring transition-colors duration-200"
            >
              Request Access
            </Link>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 text-[#F8FAFC] cursor-pointer phx-focus-ring rounded-lg transition-colors duration-200 hover:text-[#22D3EE]"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-white/10">
            <div className="px-4 sm:px-5 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <LineHoverLink
                  key={link.href}
                  href={link.href}
                  variant="slide"
                  className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] py-2 phx-focus-ring rounded-md transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                >
                  {link.label}
                </LineHoverLink>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <Link
                  href="/login"
                  className="phx-btn-ghost text-sm phx-focus-ring transition-colors duration-200"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/request-access"
                  className="phx-btn-primary text-sm phx-focus-ring transition-colors duration-200"
                  onClick={() => setOpen(false)}
                >
                  Request Access
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
