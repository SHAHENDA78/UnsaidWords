import Link from "next/link";
import { Feather } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-plum/10 flex items-center justify-center text-plum mx-auto mb-6">
          <Feather size={24} />
        </div>
        <h1 className="text-2xl font-display font-bold italic mb-3">
          This page went unsaid too
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-8">
          We couldn&apos;t find what you were looking for. Let&apos;s get you back somewhere familiar.
        </p>
        <Link
          href="/"
          className="inline-block bg-plum text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#5a3849] transition-all"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}