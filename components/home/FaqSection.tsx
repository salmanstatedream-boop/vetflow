'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { FAQS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

export default function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useScrollReveal(sectionRef, { selector: '[data-faq-fade]', staggerMs: 90 });

  return (
    <section ref={sectionRef} id="faq" className="phx-section phx-section-alt">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="phx-section-header text-center max-w-3xl mx-auto">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-faq-fade
          >
            FAQ
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl" data-faq-fade>
            Questions clinics ask us.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.question}
                data-faq-fade
                layout
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className={cn(
                  'rounded-2xl border overflow-hidden transition-colors duration-200',
                  isOpen
                    ? 'phx-panel border-[#22D3EE]/35 shadow-[0_8px_40px_rgba(34,211,238,0.08)]'
                    : 'phx-panel border-white/10 hover:border-[#22D3EE]/25',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left cursor-pointer group phx-focus-ring rounded-2xl transition-colors duration-200"
                >
                  <span
                    className={cn(
                      'text-base sm:text-lg font-medium transition-colors duration-200',
                      isOpen ? 'text-[#F8FAFC]' : 'text-[#94A3B8] group-hover:text-[#F8FAFC]',
                    )}
                  >
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={cn(
                      'shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-200',
                      isOpen
                        ? 'border-[#22D3EE]/50 bg-[#22D3EE]/10 text-[#22D3EE]'
                        : 'border-white/15 text-[#64748B] group-hover:border-[#22D3EE]/30 group-hover:text-[#22D3EE]',
                    )}
                  >
                    <Plus size={16} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 34 }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ y: -8 }}
                        animate={{ y: 0 }}
                        exit={{ y: -8 }}
                        className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-[#94A3B8] leading-relaxed border-l-2 border-[#22D3EE]/40 ml-5 sm:ml-6 pl-4 mr-6"
                      >
                        {faq.answer}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
