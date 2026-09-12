export type ScrollTarget = Pick<Window, "scrollTo">;

export function resetScrollPosition(target: ScrollTarget) {
  target.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function enableManualScrollRestoration(target: Pick<Window, "history">) {
  const previous = target.history.scrollRestoration;
  target.history.scrollRestoration = "manual";
  return () => {
    target.history.scrollRestoration = previous;
  };
}
