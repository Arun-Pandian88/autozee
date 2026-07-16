import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07090f] dark:text-slate-200 p-8 font-sans">
      <div className="max-w-3xl mx-auto py-12">
        <Link href="/" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold mb-8">Privacy Policy</h1>
        <p className="mb-4 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">1. Introduction</h2>
            <p>Welcome to Zeenox. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, email address and telephone numbers.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">3. WhatsApp Data & Cloud API</h2>
            <p>Zeenox integrates with the WhatsApp Cloud API. We act as a data processor for the messages you send and receive through our platform. We strictly adhere to Meta&apos;s data processing terms. We do not use your customer conversation data for advertising purposes or sell it to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">4. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">5. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">6. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at <strong>support@zeenox.in</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
