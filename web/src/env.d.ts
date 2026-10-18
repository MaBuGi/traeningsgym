declare module 'katex/contrib/auto-render' {
  export default function renderMathInElement(el: HTMLElement, options?: Record<string, unknown>): void;
}
declare module '*.sql?raw' {
  const s: string;
  export default s;
}
