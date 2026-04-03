'use client';

import React from 'react';
import { Card } from './ui/Card';
import { useTranslation } from '@/lib/i18n/useTranslation';
import Image from 'next/image';

export function GuideImages() {
  const { t } = useTranslation();

  const steps = [
    {
      title: t.guide.step1Title,
      description: t.guide.step1Desc,
      image: '/images/firstStep.jpg',
    },
    {
      title: t.guide.step2Title,
      description: t.guide.step2Desc,
      image: '/images/secondStep.png',
    },
    {
      title: t.guide.step3Title,
      description: t.guide.step3Desc,
      image: '/images/thirdStep.png',
    },
  ];

  return (
    <section className="mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-ps5-text-primary mb-3">
          {t.guide.title}
        </h2>
        <p className="text-lg text-ps5-text-secondary">{t.guide.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <Card key={index} padding="md" className="flex flex-col">
            <div className="mb-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ps5-blue/20 text-ps5-blue font-bold text-lg mb-3">
                {index + 1}
              </span>
              <h3 className="text-xl font-semibold text-ps5-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-ps5-text-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
            <div className="mt-auto">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-ps5-border bg-ps5-bg-secondary">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
