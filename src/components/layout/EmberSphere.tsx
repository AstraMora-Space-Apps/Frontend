/** Decorative hero sphere. Pure CSS (see .ember-sphere in globals.css); animation respects reduced motion. */
function EmberSphere({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="ember-sphere">
        <div className="ember-sphere__halo" />
        <div className="ember-sphere__core" />
        <div className="ember-sphere__orbit">
          <span className="ember-sphere__orbit-dot" />
        </div>
      </div>
    </div>
  );
}

export { EmberSphere };
