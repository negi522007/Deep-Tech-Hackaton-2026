'use client';

import { ThemeToggle } from '@/components/ui';
import { DiagnosisDemo, WorkflowTimeline, AnalyticsSnapshot } from '@/components/demo-components';

export default function Page() {
  return (
    <main className="min-h-screen bg-surface-dark-0 text-ink-dark-base">
      {/* Header */}
      <header className="border-b border-surface-dark-2 sticky top-0 z-40 bg-surface-dark-0/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Smart Asset Intelligence</h1>
            <p className="text-sm text-ink-dark-soft">Industrial diagnostics & parts workflow</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-surface-dark-2 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Turn Equipment Failures into Data
            </h2>
            <p className="text-xl text-ink-dark-soft mb-8">
              Photograph damaged parts. Our AI diagnoses the defect, recommends the replacement part, and tracks it through your entire supply chain. Every diagnosis strengthens our predictive capability.
            </p>
            <p className="text-sm text-ink-dark-soft">
              🎯 Designed for emerging markets. Insights on where your supply chain bottlenecks are — typically in the 96+ hour sourcing stage.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Mode */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Diagnosis */}
            <div className="lg:col-span-1">
              <DiagnosisDemo />
            </div>

            {/* Workflow + Analytics */}
            <div className="lg:col-span-2 space-y-8">
              <WorkflowTimeline />
              <AnalyticsSnapshot />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="border-t border-surface-dark-2 py-16 bg-surface-dark-1">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to transform your maintenance?</h3>
          <p className="text-ink-dark-soft mb-8">
            Connect Supabase, upload a failure image, and see the flywheel in action.
          </p>
          <div className="inline-block text-sm text-ink-dark-soft p-4 rounded-lg bg-surface-dark-2 border border-surface-dark-3">
            📖 See <code className="text-accent-dark">database/schema.sql</code> to set up your instance.
          </div>
        </div>
      </section>
    </main>
  );
}
