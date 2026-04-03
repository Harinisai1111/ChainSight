
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

import { faqItems } from '../data/faqData';

const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter text-white uppercase italic">
            Inquiry Protocol
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-light tracking-widest uppercase text-xs">
            Technical specifications and implementation details
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass-card rounded-none border border-white/5 px-6 animate-on-scroll"
              >
                <AccordionTrigger className="text-white hover:no-underline font-medium text-lg py-6 tracking-tight">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500 font-light pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

