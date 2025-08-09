import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export const CopyButton = ({ text }: { text: string }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            disabled={isCopied}
            className="p-1.5 text-gray-400 rounded-md hover:bg-gray-600 hover:text-white transition-colors focus:outline-none"
            aria-label={isCopied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        >
            {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
        </button>
    );
};
