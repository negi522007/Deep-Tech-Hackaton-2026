'use client';
import dynamic from 'next/dynamic';

// ssr:false + dynamic import = lazy load + code split the heavy 3D bundle.
const IndustrialScene = dynamic(() => import('./IndustrialScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-40 w-40 rounded-full border border-cyan/20 shimmer animate-pulse" />
    </div>
  ),
});

export default function Hero3D({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <IndustrialScene />
    </div>
  );
}
