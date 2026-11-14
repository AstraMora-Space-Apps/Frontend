/** Re-mounts on every route change: a 180 ms CSS fade (static under reduced motion). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
