import React, { useMemo } from 'react';
import { slugify } from '../../utils/slugify';

interface TocEntry {
  level: number;
  text: string;
  slug: string;
}

interface TableOfContentsProps {
  content: string;
}

const getIndentClass = (level: number): string => {
    switch (level) {
        case 2: return 'ml-4';
        case 3: return 'ml-8';
        default: return 'ml-0';
    }
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const toc = useMemo(() => {
    if (!content) return [];
    const headings: TocEntry[] = [];
    const headingRegex = /^(#{1,3})\s+(.*)/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      if (text) {
        headings.push({
          level,
          text,
          slug: slugify(text),
        });
      }
    }
    return headings;
  }, [content]);

  if (toc.length === 0) {
    return null;
  }

  return (
    <nav className="w-72 flex-shrink-0 p-4 bg-gray-900/50 border-r-2 border-gray-700/50 rounded-l-lg overflow-y-auto">
      <h3 className="text-base font-bold text-cyan-300 mb-4 uppercase tracking-wider">Contents</h3>
      <ul className="space-y-1">
        {toc.map((entry, index) => (
          <li key={`${entry.slug}-${index}`} className={getIndentClass(entry.level)}>
            <a
              href={`#${entry.slug}`}
              className="block py-1 px-2 text-sm text-gray-400 rounded-md transition-colors duration-200 hover:bg-gray-700/50 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
