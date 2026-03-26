import { SiteNavbar }      from '../components/site/SiteNavbar';
import { SiteFooter }      from '../components/site/SiteFooter';
import { HeroSection }     from '../components/home/HeroSection';
import { PhilosophyFlow }  from '../components/home/PhilosophyFlow';
import { WorkflowDiagram } from '../components/home/WorkflowDiagram';
import { AxelSimulation }  from '../components/simulation/AxelSimulation';
import { FeedbackClose }   from '../components/home/FeedbackClose';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNavbar />

      <main className="flex-1">
        {/* 1. Dark hero — the statement */}
        <HeroSection />

        {/* 2. Light editorial — the philosophy */}
        <PhilosophyFlow />

        {/* 3. Dark prose flow — how it works */}
        <WorkflowDiagram />

        {/* 4. Live simulation — the system in action */}
        <div id="simulation" className="relative" style={{ height: '100svh' }}>
          <AxelSimulation embedded />
        </div>

        {/* 5. Light close — feedback loop + final */}
        <FeedbackClose />
      </main>

      <SiteFooter />
    </div>
  );
}
