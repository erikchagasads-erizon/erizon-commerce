export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <div className="h-5 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="mt-5 h-10 w-3/4 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-4 h-5 w-full animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-2 h-5 w-2/3 animate-pulse rounded-2xl bg-white/10" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
          <div className="h-6 w-40 animate-pulse rounded-2xl bg-white/10" />
          <div className="mt-4 h-40 animate-pulse rounded-xl bg-white/10" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
          <div className="h-6 w-32 animate-pulse rounded-2xl bg-white/10" />
          <div className="mt-4 h-40 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}

