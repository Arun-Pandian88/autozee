import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07090f] dark:text-slate-200 p-8 font-sans">
      <div className="max-w-3xl mx-auto py-12">
        <Link href="/" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold mb-8">Terms of Service</h1>
        <p className="mb-4 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">1. Acceptance of Terms</h2>
            <p>By accessing or using the Zeenox CRM platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">2. Description of Service</h2>
            <p>Zeenox provides a customer relationship management (CRM) tool specifically designed to integrate with the WhatsApp Cloud API. We offer features such as unified inboxes, automated workflows, bulk broadcasting, and analytics.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">3. User Responsibilities</h2>
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree to use the Service in compliance with all applicable local, state, national, and international laws, rules and regulations, including Meta's WhatsApp Business Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">4. Subscriptions and Billing</h2>
            <p>Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (such as monthly or annually), depending on the type of subscription plan you select when purchasing a Subscription.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">5. Limitation of Liability</h2>
            <p>In no event shall Zeenox, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">6. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <strong>support@zeenox.in</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
