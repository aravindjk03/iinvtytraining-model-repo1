import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ShieldCheck,
  Cpu,
  XCircle,
} from 'lucide-react';
import type { DatasetValidationResponse } from '@/types/api';

export interface DatasetValidationCardProps {
  validation: DatasetValidationResponse;
  onValidate: () => Promise<DatasetValidationResponse>;
}

export const DatasetValidationCard: React.FC<DatasetValidationCardProps> = ({
  validation,
  onValidate,
}) => {
  const [isValidating, setIsValidating] = useState(false);

  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      await onValidate();
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusBadge = () => {
    switch (validation.state) {
      case 'VALID':
        return <Badge variant="accent" size="sm">✓ VALID</Badge>;
      case 'VALID_WITH_WARNINGS':
        return <Badge variant="neutral" size="sm" className="bg-amber-100 text-amber-800">⚠ VALID WITH WARNINGS</Badge>;
      case 'INVALID':
        return <Badge variant="danger" size="sm">✕ INVALID</Badge>;
      case 'ERROR':
        return <Badge variant="danger" size="sm">○ ENGINE OFFLINE</Badge>;
      case 'CHECKING':
        return <Badge variant="neutral" size="sm" className="bg-sky-100 text-sky-800">◌ CHECKING...</Badge>;
      case 'NOT_CHECKED':
      default:
        return <Badge variant="neutral" size="sm">NOT CHECKED</Badge>;
    }
  };

  return (
    <Card className="border border-surface-border bg-white shadow-subtle">
      <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-primary" />
          <CardTitle className="text-xs font-mono uppercase">
            Dataset Validation (Repo 2 Engine Authority)
          </CardTitle>
        </div>
        {getStatusBadge()}
      </CardHeader>

      <CardContent className="p-4 space-y-3 text-xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-slate-600 leading-relaxed max-w-xl font-sans">
            Repo 2 is the authority on training-dataset validity. Click below to verify class labels, image integrity, and sample sufficiency before starting training.
          </p>

          <Button
            variant="outline"
            size="sm"
            disabled={isValidating}
            onClick={handleRunValidation}
            leftIcon={
              isValidating ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cpu className="w-3.5 h-3.5 text-brand-primary" />
              )
            }
          >
            {isValidating ? 'Checking with Repo 2...' : 'CHECK MY DATA'}
          </Button>
        </div>

        {/* Status Message Banner */}
        <div
          className={`p-3 rounded-lg border text-xs ${
            validation.state === 'VALID'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : validation.state === 'VALID_WITH_WARNINGS'
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : validation.state === 'INVALID' || validation.state === 'ERROR'
              ? 'border-rose-300 bg-rose-50 text-rose-950'
              : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-start gap-2">
            {validation.state === 'VALID' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : validation.state === 'VALID_WITH_WARNINGS' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : validation.state === 'INVALID' || validation.state === 'ERROR' ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Cpu className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <span className="font-bold block text-[11px]">{validation.message}</span>
              {validation.issues.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-rose-800">
                  {validation.issues.map((iss, i) => (
                    <li key={i}>{iss}</li>
                  ))}
                </ul>
              )}
              {validation.warnings.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-amber-800">
                  {validation.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Summary Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Images Verified:</span>
            <span className="font-bold text-slate-800">{validation.summary.totalImages}</span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Classes Found:</span>
            <span className="font-bold text-slate-800">{validation.summary.classCount}</span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Class Balance:</span>
            <span className={validation.summary.isBalanced ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
              {validation.summary.isBalanced ? '✓ Balanced' : '⚠ Imbalance'}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Authority:</span>
            <span className="font-bold text-slate-700">Repo 2 Engine</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
