import PhoenixBootPreloader from './PhoenixBootPreloader';
import PhoenixNavbar from './PhoenixNavbar';
import PhoenixHero from './PhoenixHero';
import ProblemSection from './ProblemSection';
import SolutionJourneySection from './SolutionJourneySection';
import FeatureEcosystemSection from './FeatureEcosystemSection';
import SecuritySection from './SecuritySection';
import Testimonials from './Testimonials';
import PricingPreview from './PricingPreview';
import PlatformExpansionSection from './PlatformExpansionSection';
import FaqSection from './FaqSection';
import FinalCTA from './FinalCTA';
import PhoenixFooter from './PhoenixFooter';
import RequestAccessProvider from './RequestAccessProvider';
import SmoothScrollProvider from './SmoothScrollProvider';

const BOOT_GATE_SCRIPT = `
try {
  if (sessionStorage.getItem('phx_boot_seen')) {
    document.documentElement.classList.add('phx-boot-done');
  }
} catch (e) {}
`;

export default function PhoenixHomePage() {
  return (
    <SmoothScrollProvider>
      <script dangerouslySetInnerHTML={{ __html: BOOT_GATE_SCRIPT }} />
      <PhoenixBootPreloader />
      <RequestAccessProvider>
        <div className="phx-page min-h-screen">
          <PhoenixNavbar />
          <main>
            <PhoenixHero />
            <ProblemSection />
            <SolutionJourneySection />
            <FeatureEcosystemSection />
            <SecuritySection />
            <Testimonials />
            <PricingPreview />
            <PlatformExpansionSection />
            <FaqSection />
            <FinalCTA />
          </main>
          <PhoenixFooter />
        </div>
      </RequestAccessProvider>
    </SmoothScrollProvider>
  );
}
