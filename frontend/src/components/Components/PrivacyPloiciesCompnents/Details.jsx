import React, { useState } from "react";
import { ChevronDown, Mail, Phone } from "lucide-react";

const PrivacyPolicyComponent = () => {
  const [openSection, setOpenSection] = useState(0);

  const sections = [
    {
      title: "Information We Collect",
      content: "We collect personal information when you interact with our services, including but not limited to:",
      items: [
        "Name",
        "Contact information (email, phone number, address)",
        "Payment details",
        "Service preferences",
        "Usage data related to our website and services"
      ]
    },
    {
      title: "How We Use Your Information",
      content: "The information we collect is used for the following purposes:",
      items: [
        "To provide and improve our services",
        "To process payments and transactions",
        "To communicate with you regarding bookings and support",
        "To send promotional materials (with opt-in consent)"
      ]
    },
    {
      title: "Data Retention and Deletion",
      content: "We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected. Data will not be retained for more than 5 years unless required by law.",
      items: []
    },
    {
      title: "Data Sharing and Disclosure",
      content: "We do not share, sell, rent, or trade your personal information with third parties for marketing purposes. We may share personal information with trusted third-party service providers who assist us in operating our business, such as payment processors or IT support. These providers are required to maintain the confidentiality of your data and use it only for the purposes for which it was shared.",
      items: []
    },
    {
      title: "Data Security",
      content: "We take reasonable precautions to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use secure encryption protocols for payment transactions and implement appropriate safeguards to maintain the security of your data.",
      items: []
    },
    {
      title: "Your Rights and Choices",
      content: "You have the right to access, update, or delete your personal information at any time. If you would like to exercise any of these rights, please contact us. You may also request that we stop sending you marketing communications.",
      items: []
    },
    {
      title: "Cookies and Tracking",
      content: "We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie preferences through your browser settings.",
      items: []
    },
    {
      title: "Third-Party Websites",
      content: "Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites and encourage you to review their privacy policies.",
      items: []
    },
    {
      title: "Children's Privacy",
      content: "Our services are not intended for individuals under the age of 13, and we do not knowingly collect personal information from children.",
      items: []
    },
    {
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.",
      items: []
    }
  ];

  return (
    <div className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Language Limousine
          </h2>
          <p className="text-lg text-gray-600">
            Professional student transportation services
          </p>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3 mb-16">
          {sections.map((section, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-orange-300 transition-colors duration-300"
            >
              <button
                onClick={() => setOpenSection(openSection === index ? -1 : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <span className="text-orange-500 font-bold text-lg">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                    openSection === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openSection === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {section.content}
                  </p>
                  {section.items.length > 0 && (
                    <ul className="space-y-2 mt-4">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Contact Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <a
                  href="mailto:book@languagelimousine.com"
                  className="text-gray-900 font-semibold hover:text-orange-600 transition-colors"
                >
                  book@languagelimousine.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <a
                  href="tel:778-773-5466"
                  className="text-gray-900 font-semibold hover:text-orange-600 transition-colors"
                >
                  778-773-5466
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              If you have any questions about this Privacy Policy or how we handle your personal information, please don't hesitate to contact us using the information above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyComponent;
