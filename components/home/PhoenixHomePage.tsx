import PhoenixNavbar from './PhoenixNavbar';
import PhoenixHero from './PhoenixHero';
import StatsStrip from './StatsStrip';
import AnimatedOSDemo from './AnimatedOSDemo';
import TrustedByStrip from './TrustedByStrip';
import AnimatedWorkflow from './AnimatedWorkflow';
import FeatureToolbox from './FeatureToolbox';
import ClinicTypes from './ClinicTypes';
import SecuritySection from './SecuritySection';
import Testimonials from './Testimonials';
import PricingPreview from './PricingPreview';
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
          <StatsStrip />
          <AnimatedOSDemo />
          <TrustedByStrip />
          <AnimatedWorkflow />
          <FeatureToolbox />
          <ClinicTypes />
          <SecuritySection />
          <Testimonials />
          <PricingPreview />
          <FaqSection />
          <FinalCTA />
        </main>
        <PhoenixFooter />
      </div>
    </SmoothScrollProvider>
  );
}
