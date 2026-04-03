'use client';

import React from 'react';
import { Card } from './ui/Card';
import { useTranslation, interpolate } from '@/lib/i18n/useTranslation';
import type { FirmwareDetectionResult } from '@/types/serial';

interface ResultDisplayProps {
  result: FirmwareDetectionResult;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (result.status) {
      case 'JAILBREAKABLE':
        return {
          icon: '✅',
          title: t.results.jailbreakable.title,
          description: t.results.jailbreakable.description,
          firmware: interpolate(t.results.jailbreakable.firmware, {
            version: result.firmware,
          }),
          glow: 'success' as const,
          bgColor: 'bg-ps5-success/10',
          borderColor: 'border-ps5-success/30',
          textColor: 'text-ps5-success',
        };
      case 'NOT_JAILBREAKABLE':
        return {
          icon: '❌',
          title: t.results.notJailbreakable.title,
          description: t.results.notJailbreakable.description,
          firmware: interpolate(t.results.notJailbreakable.firmware, {
            version: result.firmware,
          }),
          glow: 'error' as const,
          bgColor: 'bg-ps5-error/10',
          borderColor: 'border-ps5-error/30',
          textColor: 'text-ps5-error',
        };
      case 'UNCERTAIN':
      default:
        return {
          icon: '⚠️',
          title: t.results.uncertain.title,
          description: t.results.uncertain.description,
          firmware: interpolate(t.results.uncertain.firmware, {
            version: result.firmware,
          }),
          glow: 'warning' as const,
          bgColor: 'bg-ps5-warning/10',
          borderColor: 'border-ps5-warning/30',
          textColor: 'text-ps5-warning',
        };
    }
  };

  const config = getStatusConfig();

  const getConfidenceBadge = () => {
    const confidence = result.confidence;
    let label = '';
    let classes = '';

    switch (confidence) {
      case 'HIGH':
        label = t.results.confidence.high;
        classes = 'bg-green-500/20 text-green-400 border-green-500/30';
        break;
      case 'MEDIUM':
        label = t.results.confidence.medium;
        classes = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        break;
      case 'LOW':
        label = t.results.confidence.low;
        classes = 'bg-red-500/20 text-red-400 border-red-500/30';
        break;
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${classes}`}
      >
        {label}
      </span>
    );
  };

  return (
    <Card glow={config.glow} className="overflow-hidden">
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-start gap-4">
          <div className="text-5xl" role="img" aria-label={config.title}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl md:text-3xl font-bold ${config.textColor} mb-2`}>
              {config.title}
            </h2>
            <p className="text-base text-ps5-text-secondary leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Firmware Info */}
        <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-5`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-ps5-text-muted uppercase tracking-wide font-medium mb-1">
                {t.results.jailbreakable.firmware.split(':')[0]}
              </p>
              <p className={`text-xl md:text-2xl font-bold font-mono ${config.textColor}`}>
                {result.firmware}
              </p>
            </div>
            {getConfidenceBadge()}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <InfoItem
            label={t.results.detectedRegion.split(':')[0]}
            value={result.region}
          />
          <InfoItem
            label={t.results.detectedModel.split(':')[0]}
            value={result.modelCode}
          />
          <InfoItem
            label={t.results.manufacturedYear.split(':')[0]}
            value={`${result.yearManufactured} / Month ${result.monthManufactured}`}
          />
          <InfoItem
            label="Confidence"
            value={result.confidence}
          />
        </div>

        {/* Disclaimer for uncertain results */}
        {result.confidence !== 'HIGH' && (
          <div className="bg-ps5-bg-secondary border border-ps5-border rounded-lg p-4 mt-4">
            <p className="text-sm text-ps5-text-muted">
              <span className="font-semibold text-ps5-text-secondary">⚡ Note:</span>{' '}
              {t.about.disclaimerDesc}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ps5-bg-secondary/50 rounded-lg px-4 py-3">
      <p className="text-xs text-ps5-text-muted uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-ps5-text-primary">{value}</p>
    </div>
  );
}
