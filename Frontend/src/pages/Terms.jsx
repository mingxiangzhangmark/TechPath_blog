import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <main className="bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Last Updated: October , 2025
          </p>
        </header>

        <div className="prose max-w-none dark:prose-invert prose-slate prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline">
          <section className="mb-8">
            <h2>1. Introduction</h2>
            <p>
              Welcome to TechPath Blog. By accessing and using our platform, you agree to comply with and be bound by the following terms and conditions. Please read these Terms and Conditions carefully before using our website.
            </p>
            <p>
              These Terms and Conditions govern your use of the TechPath Blog website operated by TechPath, Inc.
            </p>
          </section>

          <section className="mb-8">
            <h2>2. Acceptance of Terms</h2>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2>3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>
            <p>
              You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2>4. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post, including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting Content, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights.
            </p>
            <p>
              You represent and warrant that: (i) the Content is yours or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.
            </p>
          </section>

          <section className="mb-8">
            <h2>5. Prohibited Uses</h2>
            <p>
              You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
            </p>
            <ul>
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," or "spam."</li>
              <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful.</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm the Company or users of the Service.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>6. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of TechPath and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of TechPath.
            </p>
          </section>

          <section className="mb-8">
            <h2>7. Limitation of Liability</h2>
            <p>
              In no event shall TechPath, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2>9. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of Australia, without regard to its conflict of law provisions.
            </p>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
            </p>
          </section>

          <section className="mb-8">
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: support@techpathblog.com</li>
              <li>Address: 100 Tech Avenue, Sydney NSW 2000, Australia</li>
            </ul>
          </section>

          <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              By using TechPath Blog, you acknowledge that you have read these Terms and Conditions, understand them, and agree to be bound by them.
            </p>
            <div className="mt-4">
              <Link 
                to="/" 
                className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
