import { Children, cloneElement, Fragment, isValidElement, type ReactNode } from 'react';

const SHORT_WORDS = [
  'а', 'и', 'в', 'во', 'на', 'но', 'не', 'к', 'ко', 'с', 'со', 'у', 'о', 'об', 'обо',
  'от', 'до', 'по', 'за', 'из', 'без', 'для', 'при', 'под', 'над', 'про', 'через',
];

const shortWordPattern = new RegExp(
  `(?<![\\p{L}\\p{N}_])(${SHORT_WORDS.join('|')})( )(?=\\S)`,
  'giu',
);

/** Keeps common Russian short words attached to the word that follows them. */
export function keepShortWords(text: string): string {
  return text.replace(shortWordPattern, (_match, word: string) => `${word}\u00a0`);
}

/** Recursively applies Russian nonbreaking spaces to strings in a copy record. */
export function prepareTypography<T>(value: T): T {
  if (typeof value === 'string') return keepShortWords(value) as T;
  if (Array.isArray(value)) return value.map((entry) => prepareTypography(entry)) as T;
  if (value === null || typeof value !== 'object') return value;

  const copy = Object.create(Object.getPrototypeOf(value)) as Record<PropertyKey, unknown>;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor) continue;
    if ('value' in descriptor) descriptor.value = prepareTypography(descriptor.value);
    Object.defineProperty(copy, key, descriptor);
  }
  return copy as T;
}

type TextLeaf = { text: string; start: number; end: number };

/**
 * Normalizes contiguous inline text while retaining its React element tree.
 * Common inline tag boundaries do not break the text run, so split markup
 * cannot strand a short word at the end of a line.
 */
export function NoOrphans({ children }: { children: ReactNode }) {
  let run: TextLeaf[] = [];
  let runLength = 0;
  const normalized = new WeakMap<object, string>();

  const flush = () => {
    if (!run.length) return;
    const fullText = run.map((leaf) => leaf.text).join('');
    const fixedText = keepShortWords(fullText);
    for (const leaf of run) normalized.set(leaf, fixedText.slice(leaf.start, leaf.end));
    run = [];
    runLength = 0;
  };

  const collect = (node: ReactNode): ReactNode => {
    if (typeof node === 'string') {
      const leaf: TextLeaf = { text: node, start: runLength, end: runLength + node.length };
      run.push(leaf);
      runLength = leaf.end;
      return leaf as unknown as ReactNode;
    }
    if (typeof node === 'number' || node == null || typeof node === 'boolean') return node;
    if (Array.isArray(node)) return node.map(collect);
    if (!isValidElement(node)) return node;

    const isTransparentInline = node.type === Fragment
      || (typeof node.type === 'string'
        && ['span', 'strong', 'b', 'em', 'i', 'a', 'code', 'small', 'mark'].includes(node.type.toLowerCase()));
    if (!isTransparentInline) flush();
    const child = collect((node.props as { children?: ReactNode }).children);
    if (!isTransparentInline) flush();
    return cloneElement(node, undefined, child);
  };

  const tree = Children.map(children, collect);
  flush();

  const restore = (node: ReactNode): ReactNode => {
    if (node && typeof node === 'object' && normalized.has(node)) return normalized.get(node)!;
    if (Array.isArray(node)) return node.map(restore);
    if (!isValidElement(node)) return node;
    return cloneElement(node, undefined, restore((node.props as { children?: ReactNode }).children));
  };

  return <>{restore(tree)}</>;
}
