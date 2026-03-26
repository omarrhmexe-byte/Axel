import { Navbar }          from '../components/ui/Navbar';
import { Hero }            from '../components/landing/Hero';
import { Philosophy }      from '../components/landing/Philosophy';
import { AdvisoryPreview } from '../components/landing/AdvisoryPreview';
import { WaitlistForm }    from '../components/landing/WaitlistForm';
import { Footer }          from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="landing" />
      <main className="flex-1">
        <Hero />
        <Philosophy />
        <AdvisoryPreview />
        <WaitlistForm />
      </main>
      <Footer />
    </div>
  );
}
