
import React, { useState } from 'react';
import { MarkdownRenderer } from './common/MarkdownRenderer';
import { Edit3, Eye } from 'lucide-react';

const defaultMarkdown = `# 📄 Markdown Preview

Welcome to the **Live Markdown Editor**. This preview updates in real-time as you type.

## ✅ Core Features
- Real-time rendering
- GitHub Flavored Markdown (GFM)
- Syntax highlighting for code blocks
- Mermaid.js diagrams for flowcharts and sequences
- Task lists (checklists)

---

## 🔢 Example Code Block
\`\`\`javascript
// Simple JavaScript function
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Hello, \${name}!\`;
}

greet('Developer');
\`\`\`

## 📊 Example Mermaid Diagram
\`\`\`mermaid
graph TD;
    A[Start Typing] --> B{See Preview?};
    B -- Yes --> C[Keep Writing!];
    B -- No --> D[Check Console!];
    C --> E[Happy Coding!];
\`\`\`

## 📝 Lists & Blockquotes

> "The ability to have a live preview is a game changer for writing documentation."

*   Unordered List Item 1
*   Unordered List Item 2
    *   Nested Item

1.  Ordered List Item 1
2.  Ordered List Item 2

## ☑️ Task List
- [x] Implement split-view layout
- [x] Enable live rendering
- [ ] Add more cool features

## 🌐 Tables

| Feature            | Status      | Priority |
| ------------------ | ----------- | -------- |
| Live Preview       | Implemented | High     |
| Syntax Highlighting| Done        | High     |
| Dark Mode Toggle   | Future      | Medium   |
`;


export const MarkdownPreviewer: React.FC = () => {
  const [markdownText, setMarkdownText] = useState<string>(defaultMarkdown);

  return (
    <div className="flex flex-col h-full rounded-xl bg-black/30 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-px bg-gray-700">
        {/* Markdown Input Panel */}
        <div className="flex flex-col bg-gray-900 h-full">
          <div className="flex items-center gap-3 p-3 border-b border-gray-700 text-cyan-300 flex-shrink-0">
             <Edit3 size={18} />
             <h2 className="text-lg font-semibold">Markdown Editor</h2>
          </div>
          <div className="flex flex-col p-4 flex-grow h-0">
            <textarea
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
              placeholder="Start typing your Markdown here..."
              className="w-full flex-grow p-4 bg-gray-800/40 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm text-gray-300 leading-relaxed transition-all"
              spellCheck="false"
              aria-label="Markdown Input"
            />
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="flex flex-col bg-gray-900/40 h-full">
            <div className="flex items-center gap-3 p-3 border-b border-gray-700 text-cyan-300 flex-shrink-0">
                <Eye size={18} />
                <h2 className="text-lg font-semibold">Live Preview</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-grow min-h-0">
                <MarkdownRenderer content={markdownText} />
            </div>
        </div>
      </div>
    </div>
  );
};