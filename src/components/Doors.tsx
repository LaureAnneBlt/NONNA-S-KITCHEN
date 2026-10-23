/** Grande porte double. `open` déclenche l'ouverture (animation 100 % CSS, voir index.css). */
export default function Doors({ open }: { open: boolean }) {
  return (
    <div className="doors" data-open={open} aria-hidden="true">
      {(['left', 'right'] as const).map((side) => (
        <div key={side} className={`door-leaf door-${side}`}>
          <span className="door-panel" />
          <span className="door-panel" />
          <span className="door-knob" />
        </div>
      ))}
    </div>
  );
}
