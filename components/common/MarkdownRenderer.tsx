import React, { useEffect, useRef, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugify } from '../../utils/slugify';
import { Bot, Quote } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from './CopyButton';

declare global {
    interface Window {
        mermaid?: any;
    }
}

// Custom renderer for headings to add IDs
const HeadingRenderer = ({ level, children }: { level: number, children: React.ReactNode }) => {
    const text = React.Children.toArray(children).reduce((acc: string, child: any) => {
        if (typeof child === 'string') return acc + child;
        if (child.props && child.props.children) {
             return acc + React.Children.toArray(child.props.children).join('');
        }
        return acc;
    }, '') as string;
    const id = slugify(text);
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return <Tag id={id}>{children}</Tag>;
};

// Custom renderer for blockquotes for a more robust style
const BlockquoteRenderer = ({ children, theme }: { children: React.ReactNode, theme?: 'dark' | 'light' }) => {
    if (theme === 'light') {
        return (
            <blockquote className="my-6 border-l-4 border-gray-300 bg-gray-50 rounded-r-lg overflow-hidden">
                <div className="p-4 pl-5 relative">
                     <Quote className="absolute top-3 left-2 w-8 h-8 text-gray-300/80 transform -translate-x-1/2" aria-hidden="true" />
                    <div className="ml-4 italic text-gray-600">
                        {children}
                    </div>
                </div>
            </blockquote>
        );
    }
    // Dark theme (original)
    return (
        <blockquote className="my-6 border-l-4 border-cyan-500 bg-gray-800/50 rounded-r-lg overflow-hidden">
            <div className="p-4 pl-5 relative">
                <Quote className="absolute top-3 left-2 w-8 h-8 text-cyan-500/30 transform -translate-x-1/2" aria-hidden="true" />
                <div className="ml-4 italic text-gray-300">
                    {children}
                </div>
            </div>
        </blockquote>
    );
};


// Memoized CodeBlock component for performance
const CodeBlock = memo(({ node, inline, className, children, theme, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : null;

    // Handle inline code. Its style is controlled by the `prose-code` class in the main renderer.
    if (inline) {
        return (
            <code className={className} {...props}>
                {children}
            </code>
        );
    }

    const codeString = String(children).trim();

    // Handle Mermaid diagrams, which are block-level.
    if (lang === 'mermaid' && typeof window.mermaid !== 'undefined') {
        const id = `mermaid-` + Math.random().toString(36).substr(2, 9);
        let mermaidCode = codeString;
        if (mermaidCode.startsWith('```')) {
            const lines = mermaidCode.split('\n');
            mermaidCode = lines.slice(1, lines.length - 1).join('\n');
        }

        const themeConfig = theme === 'light' ? `%%{init: {'theme': 'default'}%%` : '';
        const codeToRender = `${themeConfig}\n${mermaidCode}`;

        const containerClasses = theme === 'light'
            ? "mermaid-container my-8 rounded-lg border border-gray-200 shadow-sm bg-white"
            : "mermaid-container my-8 rounded-lg border border-gray-700 shadow-lg bg-gray-900/50 shadow-cyan-500/5";
        const headerClasses = theme === 'light'
            ? "flex items-center gap-2 px-4 py-2 bg-gray-100/80 rounded-t-lg border-b border-gray-200"
            : "flex items-center gap-2 px-4 py-2 bg-gray-800/60 rounded-t-lg border-b border-gray-700";
        const botColor = theme === 'light' ? "text-blue-600" : "text-cyan-400";
        const textColor = theme === 'light' ? "text-xs font-semibold text-gray-600 uppercase tracking-wider" : "text-xs font-semibold text-gray-400 uppercase tracking-wider";

        return (
            <div className={containerClasses}>
                 <div className={headerClasses}>
                    <Bot size={16} className={botColor} />
                    <span className={textColor}>Flow Diagram</span>
                </div>
                <div data-mermaid-code={codeToRender} className="flex justify-center p-4">
                    <div id={id} className="mermaid">{mermaidCode}</div>
                </div>
            </div>
        );
    }
    
    // Simple block for code without a specific language (e.g., ```) or explicitly 'text'
    if (!lang || lang === 'text') {
        if (theme === 'light') {
            return (
                <div className="my-6 relative">
                    <pre className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 font-mono overflow-x-auto selection:bg-blue-200">
                        <code>{codeString}</code>
                    </pre>
                    <div className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity">
                        <CopyButton text={codeString} />
                    </div>
                </div>
            );
        }
        return (
            <div className="my-6 relative">
                <pre className="bg-gray-800 border border-gray-700/80 rounded-lg p-4 text-sm text-gray-300 font-mono overflow-x-auto selection:bg-cyan-500/30">
                    <code>{codeString}</code>
                </pre>
                <div className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity">
                    <CopyButton text={codeString} />
                </div>
            </div>
        );
    }

    // Handle all other fenced code blocks with a language specifier.
    const syntaxTheme = theme === 'light' ? oneLight : vscDarkPlus;
    const containerClasses = theme === 'light'
        ? "my-8 rounded-lg border border-gray-200 shadow-sm bg-gray-50"
        : "my-8 rounded-lg border border-gray-700 shadow-lg bg-[#1e1e1e] shadow-purple-500/5";
    const headerClasses = theme === 'light'
        ? "flex items-center justify-between gap-2 px-4 py-2 bg-gray-100 rounded-t-lg border-b border-gray-200"
        : "flex items-center justify-between gap-2 px-4 py-2 bg-gray-800/60 rounded-t-lg border-b border-gray-700";
    const langTextColor = theme === 'light'
        ? "text-xs font-semibold text-gray-600 uppercase tracking-wider"
        : "text-xs font-semibold text-gray-400 uppercase tracking-wider";

    return (
        <div className={containerClasses}>
            <div className={headerClasses}>
                <span className={langTextColor}>
                    {lang}
                </span>
                <CopyButton text={codeString} />
            </div>
            <SyntaxHighlighter
                style={syntaxTheme}
                language={lang}
                PreTag="div"
                customStyle={{ margin: 0, padding: '1rem', backgroundColor: 'transparent', fontSize: '14px', lineHeight: '1.6' }}
                codeTagProps={{ style: { fontFamily: 'var(--font-mono, monospace)' } }}
                {...props}
            >
                {codeString}
            </SyntaxHighlighter>
        </div>
    );
});


interface MarkdownRendererProps {
    content: string;
    theme?: 'dark' | 'light';
}

const darkThemeClasses = `
    prose-invert prose-lg max-w-none 
    prose-p:leading-8 prose-p:my-4
    prose-strong:text-white 
    prose-a:text-cyan-400 prose-a:font-medium hover:prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:underline
    prose-hr:my-10 prose-hr:border-gray-700
    prose-h1:text-4xl prose-h1:font-bold prose-h1:text-transparent prose-h1:bg-clip-text prose-h1:bg-gradient-to-r prose-h1:from-cyan-300 prose-h1:to-violet-400 prose-h1:mb-8 prose-h1:pb-0 prose-h1:border-b-0
    prose-h2:text-3xl prose-h2:font-semibold prose-h2:text-cyan-300 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-0 prose-h2:border-b-0
    prose-h3:text-2xl prose-h3:font-semibold prose-h3:text-teal-300 prose-h3:mt-10 prose-h3:mb-5
    prose-ul:my-5 prose-ul:list-disc prose-ul:marker:text-cyan-400 prose-ul:pl-6
    prose-ol:my-5 prose-ol:list-decimal prose-ol:marker:text-cyan-400 prose-ol:pl-6
    prose-li:my-2 prose-li:pl-2
    prose-li>p:my-1
    prose-blockquote:hidden
    prose-code:bg-gray-700/50 prose-code:text-amber-300 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:font-normal prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
    prose-table:w-full prose-table:my-6 prose-table:border-collapse prose-table:border prose-table:border-gray-600
    prose-thead:bg-gray-800
    prose-th:p-3 prose-th:border prose-th:border-gray-600 prose-th:font-semibold prose-th:text-left prose-th:text-white
    prose-td:p-3 prose-td:border prose-td:border-gray-700
    prose-tr:bg-gray-900/50 prose-tr:odd:bg-gray-800/40 hover:prose-tr:bg-cyan-500/10
`;

const lightThemeClasses = `
    prose prose-lg max-w-none 
    text-gray-900 
    prose-p:leading-loose prose-p:my-4
    prose-strong:text-gray-800 
    prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-a:underline
    prose-hr:my-8 prose-hr:border-gray-300
    prose-h1:text-4xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:mb-6 prose-h1:pb-2 prose-h1:border-b prose-h1:border-gray-200
    prose-h2:text-3xl prose-h2:font-bold prose-h2:text-gray-800 prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
    prose-h3:text-2xl prose-h3:font-bold prose-h3:text-gray-700 prose-h3:mt-8 prose-h3:mb-4
    prose-ul:my-4 prose-ul:list-disc prose-ul:marker:text-gray-500 prose-ul:pl-6
    prose-ol:my-4 prose-ol:list-decimal prose-ol:marker:text-gray-500 prose-ol:pl-6
    prose-li:my-2 prose-li:pl-2
    prose-li>p:my-1
    prose-blockquote:hidden
    prose-code:bg-gray-100 prose-code:text-pink-600 prose-code:px-1.5 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:font-normal prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
    prose-table:w-full prose-table:my-6 prose-table:border-collapse prose-table:border prose-table:border-gray-300
    prose-thead:bg-gray-100 prose-thead:border-b-2 prose-thead:border-gray-300
    prose-th:p-3 prose-th:border prose-th:border-gray-300 prose-th:font-semibold prose-th:text-left prose-th:text-gray-700
    prose-td:p-3 prose-td:border prose-td:border-gray-300
    prose-tr:border-b prose-tr:border-gray-200 hover:prose-tr:bg-gray-100/50 even:prose-tr:bg-gray-50/50
`;


// Main MarkdownRenderer component
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, theme = 'dark' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Effect to render Mermaid diagrams after initial render
    useEffect(() => {
        if (!content || typeof window.mermaid === 'undefined' || !containerRef.current) return;
    
        const processMermaidElements = () => {
            const mermaidElements = containerRef.current?.querySelectorAll<HTMLElement>('.mermaid');
            if (!mermaidElements) return;
    
            mermaidElements.forEach(async (element) => {
                if (element.dataset.processed === 'true') return;
    
                const container = element.parentElement;
                const code = container?.dataset.mermaidCode || element.innerText;
                element.dataset.processed = 'true';
                element.innerHTML = '<div class="flex items-center justify-center h-24 text-cyan-400">Loading diagram...</div>';
    
                if (!code.trim().split('\n').slice(1).join('\n').trim()) {
                    element.innerHTML = '';
                    return;
                }
    
                try {
                    const { svg } = await window.mermaid.render(element.id, code);
                    element.innerHTML = svg;
                } catch (error) {
                    console.error('Mermaid rendering error:', error);
                    const errorMessageContainer = document.createElement('div');
                    errorMessageContainer.className = 'text-red-400 p-4 border border-red-500 rounded-md bg-red-900/50 w-full text-left';
                    const safeErrorMessage = (error instanceof Error ? error.message : String(error)).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
                    errorMessageContainer.innerHTML = `
                        <strong class="font-bold">Diagram Rendering Error</strong>
                        <p class="text-sm mt-1">The AI-generated diagram syntax could not be rendered.</p>
                        <pre class="mt-2 text-xs bg-gray-800 p-2 rounded whitespace-pre-wrap break-all">${safeErrorMessage}</pre>
                    `;
                    element.innerHTML = '';
                    element.appendChild(errorMessageContainer);
                }
            });
        };
    
        const timerId = setTimeout(processMermaidElements, 100);
    
        return () => clearTimeout(timerId);
    }, [content]);

    return (
        <div 
            ref={containerRef} 
            className={theme === 'light' ? lightThemeClasses : darkThemeClasses}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ 
                    code: (props) => <CodeBlock {...props} theme={theme} />,
                    blockquote: ({ children }) => <BlockquoteRenderer theme={theme}>{children}</BlockquoteRenderer>,
                    h1: ({children}) => <HeadingRenderer level={1}>{children}</HeadingRenderer>,
                    h2: ({children}) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
                    h3: ({children}) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};