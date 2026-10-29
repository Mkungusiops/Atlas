# The Atlas of Thinking Machines

A React + TypeScript (Vite) version of the single-file page `Atlas of Thinking Machines.html`, which stays in this folder as the reference.

## Run it

```sh
npm install
npm run dev       # http://localhost:5173
```

```sh
npm run build     # type-check, then build to dist/
npm run preview   # serve the build
npm run lint      # oxlint
```

## Layout

- `src/plates/` — one component per plate, from `Neuron` (1) to `Coexist` (15). Each file holds its own data and drawing code.
- `src/components/` — the hero, the footer and shared pieces (plate header, colour key, fact cards).
- `src/lib/` — theme tokens (CSS variables read for canvas and SVG colours), canvas sizing (`useCanvas`), reduced-motion and resize hooks.
- `src/index.css` — the original stylesheet, unchanged.

Canvas plates keep their simulation state in refs and redraw imperatively through `useCanvas`. SVG plates are plain JSX computed from state. Light and dark follow the system setting, or a `data-theme="light|dark"` attribute on `<html>`. Animations stop when the OS asks for reduced motion.
