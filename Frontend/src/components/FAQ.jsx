import React, { useState } from "react";

const FAQItem = ({ question, answer, isOpen, toggleOpen }) => {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        type="button"
        className="flex justify-between items-center w-full py-5 px-4 text-left focus:outline-none"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5 px-4" : "max-h-0"}`}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  );
};

export default function FAQ() {
  // English FAQ content for the IT tech blog
  const faqs = [
    {
      question: "Do I need an account to read posts?",
      answer:
        "No. Most articles are public. Sign in to comment, bookmark posts, or publish your own content.",
    },
    {
      question: "How do I create a new post?",
      answer:
        "Go to Dashboard → Posts → Create New Post. The editor supports headings (H1–H3), code blocks, ordered/unordered lists, links, and images. Please add a clear title, relevant tags, and an optional cover image.",
    },
    {
      question: "How are code blocks rendered?",
      answer:
        "Code blocks are shown with a dark background and monospace font for readability. In the editor, use the “Code Block” tool or format your selection as a code block.",
    },
    {
      question: "Can I edit or delete my posts?",
      answer:
        "Yes. Open Dashboard → Posts to see your articles. From there you can View, Edit, or Delete. Edits are saved via PUT; deletion is permanent.",
    },
    {
      question: "What are the content guidelines?",
      answer:
        "Share original, helpful technical content. Cite sources when quoting, and avoid spam, harassment, or illegal content. Snippets and external links are welcome when properly attributed.",
    },
    {
      question: "Which tags are supported?",
      answer:
        "Common programming languages, frameworks, cloud, DevOps, AI/ML, databases, and more. If nothing fits, choose “other”. Tags help readers discover your article.",
    },
    {
      question: "How do I contact the team or report an issue?",
      answer:
        "If you find a bug, have feedback, or want to collaborate, please open an issue on our GitHub repository using the link below. Include a short description and screenshots if possible.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);
  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-pink-600">
              Questions
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about using our tech blog.
          </p>
        </div>

        {/* FAQ accordion */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFAQ(index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-700 mb-4">
            Want to help us improve the site & have feedback?
          </p>
          <a
            href="https://github.sydney.edu.au/2025S2-INTERNET-SOFTWARE-PLATFORM/Thu-13-16-7" // replace with your repo
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 transition-colors"
          >
            Contact us on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
