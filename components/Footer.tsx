export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-100">
      <div className="container-tight py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-brand-500" />
          <span className="font-semibold">Aligned</span>
          <span className="text-gray-500">— Built for recruiters. Trusted by hiring managers.</span>
        </div>
        <div className="text-sm text-gray-500">© {new Date().getFullYear()} Weld Recruiting</div>
      </div>
    </footer>
  );
}
