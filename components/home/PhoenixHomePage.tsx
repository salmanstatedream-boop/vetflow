import PhoenixNavbar from './PhoenixNavbar';
import PhoenixHero from './PhoenixHero';
import ProblemSection from './ProblemSection';
import SolutionSection from './SolutionSection';
import DashboardPreviewSection from './DashboardPreviewSection';
import InteractiveWorkflowSection from './InteractiveWorkflowSection';
import FeatureEcosystemSection from './FeatureEcosystemSection';
import SecuritySection from './SecuritySection';
import Testimonials from './Testimonials';
import PricingPreview from './PricingPreview';
import PlatformExpansionSection from './PlatformExpansionSection';
import FaqSection from './FaqSection';
import FinalCTA from './FinalCTA';
import PhoenixFooter from './PhoenixFooter';
import SmoothScrollProvider from './SmoothScrollProvider';

export default function PhoenixHomePage() {
  return (
    <SmoothScrollProvider>
      <div className="phx-page min-h-screen">
        <PhoenixNavbar />
        <main>
          <PhoenixHero />
          <ProblemSection />
          <SolutionSection />
          <DashboardPreviewSection />
          <InteractiveWorkflowSection />
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
    </SmoothScrollProvider>
  );
}
