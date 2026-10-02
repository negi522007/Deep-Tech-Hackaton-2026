'use client';

import { useAppStore } from '@/lib/store';
import { DEMO_MODE_DATA } from '@/lib/sample-data';
import { useEffect, useState } from 'react';
import { Button, Card, StatusBadge } from './ui';

export function DiagnosisDemo() {
  const { demoMode } = useAppStore();
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    if (demoMode) {
      setIsRevealing(true);
    }
  }, [demoMode]);

  if (!demoMode) return null;

  const diagnosis = DEMO_MODE_DATA.diagnosis;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-ink-dark-base">AI Diagnosis Result</h3>
      
      <Card className="border-accent-dark">
        <div className="space-y-4">
          <div>
            <p className="text-ink-dark-soft text-sm mb-1">Defect Label</p>
            <p className="text-lg font-semibold text-ink-dark-base">{diagnosis.defect_label}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-ink-dark-soft text-sm mb-1">Category</p>
              <p className="font-medium">{diagnosis.failure_category}</p>
            </div>
            <div>
              <p className="text-ink-dark-soft text-sm mb-1">Confidence</p>
              <p className="font-medium">{(diagnosis.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>

          <div>
            <p className="text-ink-dark-soft text-sm mb-2">Severity</p>
            <StatusBadge status={diagnosis.severity === 'critical' ? 'error' : diagnosis.severity === 'high' ? 'warning' : 'info'} text={diagnosis.severity} />
          </div>

          <div>
            <p className="text-ink-dark-soft text-sm mb-1">Recommended Part</p>
            <p className="text-accent-dark font-bold">{diagnosis.recommended_part}</p>
          </div>

          <div className="pt-4 border-t border-surface-dark-2">
            <p className="text-sm text-ink-dark-soft">{diagnosis.reasoning_brief}</p>
          </div>

          <Button variant="primary" className="w-full">Create Part Request</Button>
        </div>
      </Card>
    </div>
  );
}

export function WorkflowTimeline() {
  const { demoMode } = useAppStore();
  const stages = DEMO_MODE_DATA.workflowStages;

  if (!demoMode) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-ink-dark-base">Workflow Progress</h3>
      <div className="space-y-3">
        {stages.map((stage, idx) => (
          <div key={stage} className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              idx === 1 ? 'bg-accent-dark text-surface-dark-0' : 'bg-surface-dark-2 text-ink-dark-soft'
            }`}>
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium capitalize text-ink-dark-base">{stage}</p>
              {idx === 1 && <p className="text-sm text-ink-dark-soft">Currently in progress</p>}
            </div>
            {idx < stages.length - 1 && idx <= 1 && (
              <div className="w-0.5 h-8 bg-surface-dark-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsSnapshot() {
  const { demoMode } = useAppStore();
  const analytics = DEMO_MODE_DATA.analyticsSnapshot;

  if (!demoMode) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-ink-dark-base">Analytics Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h4 className="font-semibold mb-4 text-ink-dark-base">Top Failing Equipment</h4>
          <div className="space-y-3">
            {analytics.topFailingEquipment.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-ink-dark-soft text-sm">{item.name}</span>
                <span className="font-bold text-accent-dark">{item.failureCount}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h4 className="font-semibold mb-4 text-ink-dark-base">Most Requested Parts</h4>
          <div className="space-y-3">
            {analytics.topRequestedParts.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-ink-dark-soft text-sm">{item.name}</span>
                <span className="font-bold text-accent-dark">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="bg-surface-dark-2/50">
        <h4 className="font-semibold mb-4 text-ink-dark-base">Avg Time Per Stage (hours)</h4>
        <div className="space-y-2">
          {Object.entries(analytics.avgTimePerStage).map(([stage, hours]) => (
            <div key={stage} className="flex justify-between text-sm">
              <span className="capitalize text-ink-dark-soft">{stage}</span>
              <span className={hours > 50 ? 'text-status-warning font-bold' : 'text-ink-dark-base'}>
                {hours.toFixed(1)}h
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-dark-soft mt-4 pt-4 border-t border-surface-dark-1">
          ⚠️ Sourcing is the bottleneck. Average 96.5 hours — this is where supply chain optimization matters most.
        </p>
      </Card>
    </div>
  );
}
