import Link from 'next/link'
import SakuraPetals from '@/components/SakuraPetals'

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen">
      <SakuraPetals />
      <nav className="relative z-10 flex items-center px-4 py-4 md:px-8">
        <Link href="/" className="pixel-font text-sm text-[#FF69B4]">← Kawaii Couple</Link>
      </nav>
      <div className="relative z-10 px-4 py-8 max-w-2xl mx-auto">
        <div className="card-pixel p-8">
          <h1 className="pixel-font text-sm text-[#FF1493] mb-6">Privacy Policy ♡</h1>
          <p className="text-xs text-gray-500 font-semibold mb-6">Last updated: May 2026</p>

          <div className="space-y-6 text-sm font-semibold text-gray-600">
            <section>
              <h2 className="font-bold text-[#FF69B4] mb-2">What We Collect</h2>
              <p>We collect your email address when you sign in with a magic link. We also store your chosen username and game scores to enable multiplayer sessions.</p>
            </section>

            <section>
              <h2 className="font-bold text-[#FF69B4] mb-2">How We Use It</h2>
              <p>Your email is used only for authentication. Game scores are used to display results to you and your partner. We do not sell your data to third parties.</p>
            </section>

            <section>
              <h2 className="font-bold text-[#FF69B4] mb-2">Cookies</h2>
              <p>We use cookies to keep you logged in between sessions. We may display third-party advertisements (Google AdSense) which use cookies to show relevant ads.</p>
            </section>

            <section>
              <h2 className="font-bold text-[#FF69B4] mb-2">Third-Party Services</h2>
              <p>We use Supabase for authentication and data storage. We may use Google AdSense for advertising. These services have their own privacy policies.</p>
            </section>

            <section>
              <h2 className="font-bold text-[#FF69B4] mb-2">Data Deletion</h2>
              <p>To delete your account and data, email us at hello@roastlabai.com. We will remove your data within 7 days.</p>
            </section>

            <section>
              <h2 className="font-bold text-[#FF69B4] mb-2">Contact</h2>
              <p>Questions? Email hello@roastlabai.com~ ♡</p>
            </section>
          </div>
        </div>
      </div>
      <footer className="relative z-10 text-center py-8">
        <p className="font-semibold text-gray-400">Kawaii Couple by Roast Lab AI 🌸</p>
      </footer>
    </div>
  )
}
