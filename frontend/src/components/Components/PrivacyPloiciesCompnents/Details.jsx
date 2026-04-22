import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const PrivacyPolicyComponent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Content Section */}
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Language Limousine
              </h1>
              <p className="text-lg text-gray-600">
                Professional student transportation services
              </p>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    1. Information We Collect
                  </h3>
                  <p className="text-gray-700 mb-3">
                    We collect personal information when you interact with our
                    services, including but not limited to:
                  </p>
                  <ul className="space-y-1 text-gray-700 ml-4">
                    <li>• Name</li>
                    <li>
                      • Contact information (email, phone number, address)
                    </li>
                    <li>• Payment details</li>
                    <li>• Service preferences</li>
                    <li>• Usage data related to our website and services</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    2. How We Use Your Information
                  </h3>
                  <p className="text-gray-700 mb-3">
                    The information we collect is used for the following
                    purposes:
                  </p>
                  <ul className="space-y-1 text-gray-700 ml-4">
                    <li>• To provide and improve our services</li>
                    <li>• To process payments and transactions</li>
                    <li>
                      • To communicate with you regarding bookings and support
                    </li>
                    <li>
                      • To send promotional materials (with opt-in consent)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    3. Data Retention and Deletion
                  </h3>
                  <p className="text-gray-700">
                    We retain your personal data only for as long as necessary
                    to fulfill the purposes for which it was collected. Data
                    will not be retained for more than 5 years unless required
                    by law.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    4. Data Sharing and Disclosure
                  </h3>
                  <p className="text-gray-700">
                    We do not share, sell, rent, or trade your personal
                    information with third parties for marketing purposes. We
                    may share personal information with trusted third-party
                    service providers who assist us in operating our business,
                    such as payment processors or IT support. These providers
                    are required to maintain the confidentiality of your data
                    and use it only for the purposes for which it was shared. We
                    may also disclose personal information if required by law or
                    in response to legal processes, such as a subpoena or court
                    order.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    5. Data Security
                  </h3>
                  <p className="text-gray-700">
                    We take reasonable precautions to protect your personal
                    information from unauthorized access, alteration,
                    disclosure, or destruction. We use secure encryption
                    protocols for payment transactions and implement appropriate
                    safeguards to maintain the security of your data.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    6. Your Rights and Choices
                  </h3>
                  <p className="text-gray-700">
                    You have the right to access, update, or delete your
                    personal information at any time. If you would like to
                    exercise any of these rights, please contact us at{" "}
                    <a
                      href="mailto:book@languagelimousine.com"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      book@languagelimousine.com
                    </a>
                    . You may also request that we stop sending you marketing
                    communications by following the unsubscribe instructions in
                    our emails, if applicable.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    7. Cookies and Tracking Technologies
                  </h3>
                  <p className="text-gray-700">
                    You have the right to access, update, or delete your
                    personal information at any time. If you would like to
                    exercise any of these rights, please contact us at{" "}
                    <a
                      href="mailto:book@languagelimousine.com"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      book@languagelimousine.com
                    </a>
                    . You may also request that we stop sending you marketing
                    communications by following the unsubscribe instructions in
                    our emails, if applicable.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    8. Third-Party Websites
                  </h3>
                  <p className="text-gray-700">
                    Our website may contain links to third-party websites. We
                    are not responsible for the privacy practices of these
                    websites and encourage you to review their privacy policies
                    before providing any personal information.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    9. Children's Privacy
                  </h3>
                  <p className="text-gray-700">
                    Our services are not intended for individuals under the age
                    of 13, and we do not knowingly collect personal information
                    from children. If we learn that we have collected personal
                    information from a child under 13, we will take steps to
                    delete that information.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    10. Changes to This Privacy Policy
                  </h3>
                  <p className="text-gray-700">
                    We may update this Privacy Policy from time to time. Any
                    changes will be posted on this page, and the updated Privacy
                    Policy will be effective as of the date of posting. We
                    encourage you to review this Privacy Policy periodically.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    11. Contact Information
                  </h3>
                  <div className="text-gray-700">
                    <p className="font-medium">Language Limousine</p>
                    <p>
                      Email:{" "}
                      <a
                        href="mailto:book@languagelimousine.com"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        book@languagelimousine.com
                      </a>
                    </p>
                    <p>
                      Phone:{" "}
                      <a
                        href="tel:778-773-5466"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        778-773-5466
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Image Section */}
          <div className="lg:sticky lg:top-8">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Airport terminal with traveler"
                className="w-full h-[600px] object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyComponent;
