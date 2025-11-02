'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface PolicyModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'privacy' | 'terms'
}

export default function PolicyModal({ isOpen, onClose, type }: PolicyModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300)
  }

  const privacyPolicyContent = {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: January 2025',
    sections: [
      {
        heading: '1. Information We Collect',
        content: [
          'We collect information that you provide directly to us, including:',
          '• Birth date, time, and location for generating your destiny report',
          '• Account information (email, name) when you create an account',
          '• Payment information processed securely through our payment providers',
          '• Any communications you send to us'
        ]
      },
      {
        heading: '2. How We Use Your Information',
        content: [
          'We use the information we collect to:',
          '• Generate personalized destiny reports based on your birth data',
          '• Process payments and manage your account',
          '• Improve our services and user experience',
          '• Communicate with you about your account and our services',
          '• Ensure security and prevent fraud'
        ]
      },
      {
        heading: '3. Data Storage and Security',
        content: [
          'Your data is stored securely using industry-standard encryption.',
          'We use Supabase for secure database storage and authentication.',
          'All sensitive information is encrypted both in transit and at rest.',
          'We regularly review our security practices to ensure your data remains protected.'
        ]
      },
      {
        heading: '4. Data Sharing',
        content: [
          'We do not sell, trade, or rent your personal information to third parties.',
          'We may share information only:',
          '• With service providers who assist us in operating our platform (under strict confidentiality agreements)',
          '• When required by law or to protect our legal rights',
          '• With your explicit consent'
        ]
      },
      {
        heading: '5. Your Rights',
        content: [
          'You have the right to:',
          '• Access your personal data',
          '• Request correction of inaccurate data',
          '• Request deletion of your data',
          '• Withdraw consent at any time',
          '• Export your data in a portable format'
        ]
      },
      {
        heading: '6. Data Retention',
        content: [
          'We retain your data for as long as necessary to provide our services.',
          'You can delete your account and associated data at any time through your account settings.',
          'Some information may be retained for legal or security purposes even after account deletion.'
        ]
      },
      {
        heading: '7. Cookies and Tracking',
        content: [
          'We use cookies and similar technologies to enhance your experience.',
          'These help us remember your preferences and understand how you use our service.',
          'You can control cookie preferences through your browser settings.'
        ]
      },
      {
        heading: '8. Children\'s Privacy',
        content: [
          'Our service is not intended for children under 13 years of age.',
          'We do not knowingly collect personal information from children under 13.',
          'If you believe we have collected information from a child under 13, please contact us immediately.'
        ]
      },
      {
        heading: '9. Changes to This Policy',
        content: [
          'We may update this Privacy Policy from time to time.',
          'We will notify you of any significant changes by posting the new policy on this page.',
          'We encourage you to review this policy periodically.'
        ]
      },
      {
        heading: '10. Contact Us',
        content: [
          'If you have questions about this Privacy Policy, please contact us at:',
          'Email: contact@starwhisperai.com'
        ]
      }
    ]
  }

  const termsOfServiceContent = {
    title: 'Terms of Service',
    lastUpdated: 'Last Updated: January 2025',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        content: [
          'By accessing and using Cosmic Destiny AI, you accept and agree to be bound by these Terms of Service.',
          'If you do not agree to these terms, please do not use our service.'
        ]
      },
      {
        heading: '2. Description of Service',
        content: [
          'Cosmic Destiny AI provides AI-powered astrological reports based on traditional Chinese Bazi (Four Pillars) calculations.',
          'Our service generates personalized reports including personality analysis, career guidance, and life path insights.',
          'This service is provided for entertainment and self-reflection purposes only.'
        ]
      },
      {
        heading: '3. User Accounts',
        content: [
          'You are responsible for maintaining the confidentiality of your account credentials.',
          'You agree to provide accurate and complete information when creating an account.',
          'You must notify us immediately of any unauthorized use of your account.',
          'We reserve the right to suspend or terminate accounts that violate these terms.'
        ]
      },
      {
        heading: '4. User Conduct',
        content: [
          'You agree not to:',
          '• Use the service for any illegal purpose',
          '• Attempt to gain unauthorized access to our systems',
          '• Interfere with or disrupt the service',
          '• Use automated systems to access the service without permission',
          '• Share your account credentials with others',
          '• Reverse engineer or attempt to extract our proprietary algorithms'
        ]
      },
      {
        heading: '5. Payment and Refunds',
        content: [
          'Paid services require payment before access is granted.',
          'All payments are processed securely through our payment providers.',
          'Refund policies vary by product type - please review specific product terms before purchase.',
          'We reserve the right to change pricing with reasonable notice.'
        ]
      },
      {
        heading: '6. Intellectual Property',
        content: [
          'All content, including reports, algorithms, and website design, is owned by Cosmic Destiny AI.',
          'Users receive a license to view and use their personal reports for personal purposes only.',
          'Reports may not be reproduced, distributed, or used for commercial purposes without permission.',
          'You retain ownership of your personal data, but grant us license to use it for service provision.'
        ]
      },
      {
        heading: '7. Disclaimers',
        content: [
          'Our service is provided "as is" without warranties of any kind.',
          'We do not guarantee the accuracy, completeness, or usefulness of any information provided.',
          'Astrological reports are for entertainment purposes only and should not replace professional advice.',
          'We are not responsible for decisions made based on our reports.'
        ]
      },
      {
        heading: '8. Limitation of Liability',
        content: [
          'To the maximum extent permitted by law, Cosmic Destiny AI shall not be liable for:',
          '• Any indirect, incidental, or consequential damages',
          '• Loss of data, profits, or business opportunities',
          '• Decisions or actions taken based on our reports',
          '• Service interruptions or technical issues'
        ]
      },
      {
        heading: '9. Modifications to Service',
        content: [
          'We reserve the right to modify, suspend, or discontinue any part of our service at any time.',
          'We will make reasonable efforts to notify users of significant changes.',
          'We are not liable for any loss resulting from service modifications.'
        ]
      },
      {
        heading: '10. Termination',
        content: [
          'Either party may terminate service at any time.',
          'We may terminate or suspend your access immediately if you violate these terms.',
          'Upon termination, your right to use the service will cease immediately.',
          'Provisions that by their nature should survive termination will remain in effect.'
        ]
      },
      {
        heading: '11. Governing Law',
        content: [
          'These terms are governed by and construed in accordance with applicable laws.',
          'Any disputes will be resolved through binding arbitration or in courts of competent jurisdiction.'
        ]
      },
      {
        heading: '12. Changes to Terms',
        content: [
          'We reserve the right to modify these terms at any time.',
          'Continued use of the service after changes constitutes acceptance of the new terms.',
          'We encourage you to review these terms periodically.'
        ]
      },
      {
        heading: '13. Contact Information',
        content: [
          'For questions about these Terms of Service, please contact us at:',
          'Email: contact@starwhisperai.com'
        ]
      }
    ]
  }

  const content = type === 'privacy' ? privacyPolicyContent : termsOfServiceContent

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      >
        {/* Modal container with scale and slide animation */}
        <div
          className={`relative max-w-4xl w-full mx-4 max-h-[90vh] transform transition-all duration-300 ease-out ${
            isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Main modal with glass morphism and modern design */}
          <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                    {content.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">{content.lastUpdated}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {content.sections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-xl font-semibold text-purple-300">
                      {section.heading}
                    </h3>
                    <div className="space-y-2 text-gray-300 leading-relaxed">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-sm md:text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-purple-500/20">
                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

