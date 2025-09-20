'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-purple-500/20 overflow-hidden transition-all duration-300 hover:border-purple-500/40"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left group"
          >
            <h3 className="text-lg font-semibold text-purple-200 group-hover:text-purple-100 transition-colors">
              {item.question}
            </h3>
            <div className="flex-shrink-0 ml-4">
              {openIndex === index ? (
                <ChevronDown className="w-5 h-5 text-purple-200 transform transition-transform duration-300" />
              ) : (
                <ChevronRight className="w-5 h-5 text-purple-200 transform transition-transform duration-300" />
              )}
            </div>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-4">
              <div className="border-t border-purple-500/20 pt-4">
                <p className="text-white leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}