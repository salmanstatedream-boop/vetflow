'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { LineHoverLink } from '@/components/ui/line-hover-link';
import { useRequestAccess } from '@/components/home/RequestAccessProvider';
import { NAV_LINKS } from '@/lib/home-data';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import { useLenis } from './SmoothScrollProvider';

const SCROLL_OFFSET = -80;

export default function PhoenixNavbar() {
  const [open, setOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const lenis = useLenis();
  const menuId = useId();
  const { open: openRequestAccess } = useRequestAccess();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

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
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-[var(--phx-nav-height)] overflow-hidden border-b border-white/5 bg-[#03040A]/80 backdrop-blur-md">
        <div className="relative h-full phx-container flex items-end justify-between pb-1">
          <Link
            href="/"
            className="relative z-10 flex-1 min-w-0 overflow-hidden h-full flex items-end phx-focus-ring rounded-sm"
            aria-label="Phoenix OS home"
          >
            <span className="phx-header-wordmark text-[clamp(2.75rem,12vw,7.5rem)] font-bold leading-none tracking-tighter whitespace-nowrap pointer-events-none select-none">
              Phoenix OS
            </span>
          </Link>

          <button
            type="button"
            className={cn(
              'relative z-20 shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border border-white/10',
              'bg-[var(--phx-panel)]/80 text-[#F8FAFC] cursor-pointer phx-focus-ring',
              'transition-colors duration-200 hover:border-[#22D3EE]/30 hover:text-[#22D3EE]',
            )}
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls={menuId}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />

          <aside
            id={menuId}
            className={cn(
              'absolute inset-y-0 right-0 w-full max-w-sm',
              'bg-[#03040A]/95 backdrop-blur-xl border-l border-white/10 shadow-[-8px_0_40px_rgba(0,0,0,0.45)]',
              'flex flex-col',
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#64748B]">
                  Navigation
                </p>
                <p className="text-sm font-semibold text-[#F8FAFC] mt-1">Phoenix OS</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#22D3EE]/30 transition-colors duration-200 cursor-pointer phx-focus-ring"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <LineHoverLink
                  key={link.href}
                  href={link.href}
                  variant="slide"
                  className="text-base text-[#94A3B8] hover:text-[#F8FAFC] py-3 phx-focus-ring rounded-md transition-colors duration-200"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(link.href);
                  }}
                >
                  {link.label}
                </LineHoverLink>
              ))}
              <LineHoverLink
                href="#early-access"
                variant="slide"
                className="text-base text-[#94A3B8] hover:text-[#F8FAFC] py-3 phx-focus-ring rounded-md transition-colors duration-200"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection('#early-access');
                }}
              >
                Early Access
              </LineHoverLink>
            </nav>

            <div className="px-6 py-6 border-t border-white/10 flex flex-col gap-3">
              <Link
                href="/login"
                className="phx-btn-ghost text-sm w-full justify-center phx-focus-ring transition-colors duration-200"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
              <button
                type="button"
                className="phx-btn-primary text-sm w-full justify-center phx-focus-ring transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  openRequestAccess();
                }}
              >
                Request Access
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
