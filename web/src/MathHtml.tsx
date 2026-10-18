import { useLayoutEffect, useRef } from 'react';
import renderMathInElement from 'katex/contrib/auto-render';

// Opgavetekst/svarmulighed: HTML fra databasen med matematik i \( \) og \[ \], sat med KaTeX.
export default function MathHtml({ html, className, inline }: { html: string; className?: string; inline?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current!;
    el.innerHTML = html;
    renderMathInElement(el, {
      delimiters: [{ left: '\\(', right: '\\)', display: false }, { left: '\\[', right: '\\]', display: true }],
      throwOnError: false,
    });
  }, [html]);
  const Tag = inline ? 'span' : 'div';
  return <Tag ref={ref as never} className={'prose-math ' + (className ?? '')} />;
}
