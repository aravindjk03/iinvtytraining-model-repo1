import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { useChallenge, useModel } from '@/context/ProjectContext';

export const ImprovePage: React.FC = () => {
  const navigate = useNavigate();
  const { history } = useChallenge();
  const { activeModel } = useModel();

  const failedCount = history.filter((c) => c.result === 'FAILED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="06 IMPROVE — SAFETY RETRAINING LOOP"
        subtitle="Analyze exposed weaknesses from adversarial challenges, add corrective examples, and retrain"
        badge={
          <Badge variant="primary" size="sm">
            STAGE 06
          </Badge>
        }
      />

      <Card className="border-surface-border">
        <CardHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-brand-primary flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Improvement Feedback Loop</CardTitle>
              <CardDescription>
                Close the machine learning loop by addressing observed edge-case failures.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Active Safety Model:</span>
              <span className="font-bold text-slate-800">
                {activeModel?.modelId || 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Recorded Challenge Failures:</span>
              <span className={`font-bold ${failedCount > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                {failedCount} failure(s)
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
            <strong>Next Step:</strong> Deep weakness analysis and 1-click dataset re-injection will be finalized in Phase 16. You can currently navigate back to Stage 02 Teach to add more training samples and retrain.
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/challenge')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to 05 Challenge
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/teach')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Add Examples in 02 Teach
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/my-ai')}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              View My AI System
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
