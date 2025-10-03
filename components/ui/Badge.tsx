export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-[#475569] bg-white">
      {children}
    </span>
  );
}
