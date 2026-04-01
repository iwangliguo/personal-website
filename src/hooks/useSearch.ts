import { useState, useMemo } from 'react';

/**
 * 通用搜索 hook
 * @param items  全量数据
 * @param keys   要搜索的字段名（支持字符串 / 字符串数组字段）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSearch<T extends Record<string, any>>(
  items: T[],
  keys: (keyof T)[]
) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      keys.some(key => {
        const val = item[key];
        if (Array.isArray(val)) return val.some((v: unknown) => String(v).toLowerCase().includes(q));
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [items, keys, query]);

  return { query, setQuery, filtered };
}
