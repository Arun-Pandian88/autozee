import Link from 'next/link';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07090f] dark:text-slate-200 p-8 font-sans">
      <div className="max-w-3xl mx-auto py-12">
        <Link href="/" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold mb-8">Cookie Policy</h1>
        <p className="mb-4 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">1. What are Cookies?</h2>
            <p>Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">2. How Zeenox Uses Cookies</h2>
            <p>We use cookies to enhance your experience on our platform. Specifically, we use them to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Keep you signed in to your CRM dashboard.</li>
              <li>Remember your preferences, such as your theme (Light or Dark mode).</li>
              <li>Understand how you interact with our application so we can improve our services.</li>
              <li>Ensure the security of your account and protect against fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">3. Types of Cookies We Use</h2>
            <p>We primarily use the following types of cookies:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Essential Cookies:</strong> These are required for the operation of our website and CRM. They include, for example, cookies that enable you to log into secure areas of our website.</li>
              <li><strong>Analytical/Performance Cookies:</strong> They allow us to recognise and count the number of visitors and to see how visitors move around our website when they are using it.</li>
              <li><strong>Functionality Cookies:</strong> These are used to recognise you when you return to our website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">4. Managing Cookies</h2>
            <p>You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of the Zeenox CRM may become inaccessible or not function properly.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-100">5. Contact Us</h2>
            <p>If you have any questions about our use of cookies, please contact us at <strong>support@zeenox.in</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
