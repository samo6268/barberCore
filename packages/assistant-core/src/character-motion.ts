/** Local-only gaze tracking. Pointer coordinates never enter conversation context. */
export function attachCharacterGaze(root: HTMLElement | ShadowRoot, selector: string): () => void {
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!view) return () => {};
  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = view.matchMedia('(any-pointer: fine)');
  let frame = 0;
  let point: { x: number; y: number } | undefined;

  const reset = () => {
    if (frame) view.cancelAnimationFrame(frame);
    frame = 0;
    point = undefined;
    root.querySelectorAll<HTMLElement>(selector).forEach((character) => {
      character.style.removeProperty('--mimo-gaze-x');
      character.style.removeProperty('--mimo-gaze-y');
    });
  };
  const paint = () => {
    frame = 0;
    if (!point) return;
    root.querySelectorAll<HTMLElement>(selector).forEach((character) => {
      const rect = character.getBoundingClientRect();
      const x = point!.x - (rect.left + rect.width / 2);
      const y = point!.y - (rect.top + rect.height / 2);
      const distance = Math.hypot(x, y);
      const amount = Math.min(distance / 100, 1);
      character.style.setProperty('--mimo-gaze-x', `${distance ? x / distance * amount * 3 : 0}px`);
      character.style.setProperty('--mimo-gaze-y', `${distance ? y / distance * amount * 2 : 0}px`);
    });
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || reducedMotion.matches || !finePointer.matches) return;
    point = { x: event.clientX, y: event.clientY };
    if (!frame) frame = view.requestAnimationFrame(paint);
  };
  const visibility = () => { if (doc.hidden) reset(); };
  doc.addEventListener('pointermove', move, { passive: true });
  doc.documentElement.addEventListener('pointerleave', reset);
  doc.addEventListener('visibilitychange', visibility);
  view.addEventListener('blur', reset);
  reducedMotion.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);
  return () => {
    reset();
    doc.removeEventListener('pointermove', move);
    doc.documentElement.removeEventListener('pointerleave', reset);
    doc.removeEventListener('visibilitychange', visibility);
    view.removeEventListener('blur', reset);
    reducedMotion.removeEventListener('change', reset);
    finePointer.removeEventListener('change', reset);
  };
}
