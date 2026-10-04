import { Suspense, lazy } from "react";

// The article editor (and TipTap with it) loads only where someone writes, so readers of a
// question page never download it.
const Editor = lazy(() => import("./Editor"));

export default function LazyEditor(props) {
  return (
    <Suspense fallback={<div aria-hidden="true" className="min-h-64 border border-stone-border bg-paper" />}>
      <Editor {...props} />
    </Suspense>
  );
}
