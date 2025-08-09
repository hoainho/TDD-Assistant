
import React, { useState, useCallback, useRef } from 'react';
import { generateTDDFromText, generateImplementationPlan } from '../services/geminiService';
import { extractTextFromPDF } from '../utils/pdfUtils';
import { extractTextFromDocx } from '../utils/docxUtils';
import { Button } from './common/Button';
import { MarkdownRenderer } from './common/MarkdownRenderer';
import { LoadingSpinner } from './common/LoadingSpinner';
import { TableOfContents } from './common/TableOfContents';
import { ImplementationPlanDisplay } from './ImplementationPlanDisplay';
import { ImplementationPlan } from '../types';
import { UploadCloud, FileCheck, FileWarning, Sparkles, Rocket, FileText, Link, Download, Copy, Check } from 'lucide-react';

type InputType = 'file' | 'url';

const mockFetchFromJira = async (url: string): Promise<string> => {
    console.log(`Simulating fetch from: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return `
      Ticket: FEAT-451
      Title: Overhaul Shopping Cart & Checkout Experience
      Description: The current checkout process is clunky and has a high drop-off rate. We need to redesign the entire flow from adding an item to the cart to successful payment.
      Core Requirements:
      1.  **Shopping Cart:** Allow users to add/remove items, and update quantities. The cart should be persistent across sessions.
      2.  **Shipping Information:** A simple form to collect the user's shipping address. Integrate with a address validation service.
      3.  **Payment Gateway:** Integrate with Stripe for credit card payments. Must handle success, failure, and pending states.
      4.  **Order Confirmation:** Show a summary of the order and send a confirmation email.
    `;
};

const DOC_UNSUPPORTED_ERROR = '`.doc` files are not supported for direct analysis. Please save the file as `.docx` or `.pdf` and re-upload it.';

export const TDDGenerator: React.FC = () => {
  const [inputType, setInputType] = useState<InputType>('file');
  const [urlInput, setUrlInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [tddResult, setTddResult] = useState<{ content: string; title: string } | null>(null);
  const [plan, setPlan] = useState<ImplementationPlan[] | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setError('');
    setTddResult(null);
    setPlan(null);
    setIsGeneratingPlan(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (file) {
        setSelectedFile(file);
        resetState();
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid PDF, DOCX, or DOC file.');
        } else if (file.type === 'application/msword') {
            setError(DOC_UNSUPPORTED_ERROR);
        }
    }
  };

  const handleGenerateTDD = useCallback(async () => {
    let extractedText = '';
    setIsLoading(true);
    resetState();

    try {
      if (inputType === 'file') {
        if (!selectedFile) throw new Error('Please select a file first.');

        if (selectedFile.type === 'application/msword') {
          throw new Error(DOC_UNSUPPORTED_ERROR);
        }
        
        if (selectedFile.type === 'application/pdf') {
          extractedText = await extractTextFromPDF(selectedFile);
        } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          extractedText = await extractTextFromDocx(selectedFile);
        } else {
          throw new Error('Unsupported file type. Please use a PDF or DOCX file.');
        }

      } else { // url
        if (!urlInput.trim()) throw new Error('Please enter a URL first.');
        extractedText = await mockFetchFromJira(urlInput);
      }
      
      if (!extractedText.trim()) {
        throw new Error("Could not extract any text from the source. The document might be empty or image-based.");
      }
      const result = await generateTDDFromText(extractedText);
      setTddResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, inputType, urlInput]);

  const handleGeneratePlan = useCallback(async () => {
    if (!tddResult) return;
    setIsGeneratingPlan(true);
    setPlan(null);
    setError('');
    try {
      const result = await generateImplementationPlan(tddResult.content);
      setPlan(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate implementation plan.');
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [tddResult]);

  const handleDownload = () => {
    if (!tddResult) return;
    const blob = new Blob([tddResult.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tddResult.title}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!tddResult) return;
    navigator.clipboard.writeText(tddResult.content).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-cyan-500');
    
    const file = event.dataTransfer.files?.[0];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (file) {
      setInputType('file');
      setSelectedFile(file);
      resetState();
      if (!allowedTypes.includes(file.type)) {
          setError('Please drop a valid PDF, DOCX, or DOC file.');
      } else if (file.type === 'application/msword') {
        setError(DOC_UNSUPPORTED_ERROR);
      }
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => { event.preventDefault(); event.stopPropagation(); };
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.classList.add('border-cyan-500'); };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.classList.remove('border-cyan-500'); };
  
  const isGenerateDisabled = (inputType === 'file' && (!selectedFile || selectedFile.type === 'application/msword')) || (inputType === 'url' && !urlInput.trim());

  const renderErrorDisplay = () => {
    if (!error || isLoading) return null;

    if (error === DOC_UNSUPPORTED_ERROR) {
        return (
            <div className="p-4 mt-2 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
                <div className="flex items-start gap-3">
                    <FileWarning size={24} className="flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold text-red-200">Unsupported File Format</h3>
                        <p className="mt-1 text-sm">{error}</p>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-red-500/30 text-xs text-red-200/80">
                    <p className="font-bold mb-2 text-red-100">How to Convert Your File:</p>
                    <ul className="list-none space-y-1">
                        <li className="flex items-baseline gap-2">
                            <strong className="w-28 flex-shrink-0">In MS Word:</strong> 
                            <span><code>File &rarr; Save As &rarr;</code> Choose <code>.docx</code> or <code>.pdf</code>.</span>
                        </li>
                        <li className="flex items-baseline gap-2">
                            <strong className="w-28 flex-shrink-0">On macOS:</strong> 
                            <span><code>File &rarr; Export To &rarr;</code> Select <code>PDF</code> or <code>Word (.docx)</code>.</span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="text-red-400 flex items-center gap-2 mt-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <FileWarning size={16} />
            <span>{error}</span>
        </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 p-4 rounded-xl bg-black/30 border border-gray-700/50 backdrop-blur-sm">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="w-full flex flex-col gap-4">
              <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                      <UploadCloud className="text-cyan-400" />
                      1. Provide Document
                  </h2>
                  <div className="flex items-center bg-gray-800/70 rounded-lg p-1">
                      <button onClick={() => setInputType('file')} className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${inputType === 'file' ? 'bg-cyan-500/30 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                          <FileText size={16}/> File
                      </button>
                      <button onClick={() => setInputType('url')} className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${inputType === 'url' ? 'bg-cyan-500/30 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                          <Link size={16}/> URL
                      </button>
                  </div>
              </div>

              {inputType === 'file' ? (
                <div className="w-full p-6 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:bg-gray-800/50"
                  onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword" className="hidden" disabled={isLoading} />
                  {selectedFile ? (
                      <div className="flex flex-col items-center gap-2 text-teal-300">
                          <FileCheck size={40} />
                          <p className="font-semibold break-all">{selectedFile.name}</p>
                          <p className="text-xs text-gray-400">({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                          <UploadCloud size={40} />
                          <p className="font-semibold">Drag & drop a PDF, DOCX, or DOC file</p>
                          <p className="text-sm">or click to select</p>
                      </div>
                  )}
                </div>
              ) : (
                <input type="text" value={urlInput} onChange={e => { setUrlInput(e.target.value); resetState(); }} placeholder="Paste URL from Jira, Confluence, etc..."
                  className="w-full p-4 h-full min-h-[148px] bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm" disabled={isLoading} />
              )}
          </div>
          <div className="w-full flex flex-col gap-4 self-center">
              <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                  <Sparkles className="text-cyan-400" />
                  2. Generate TDD
              </h2>
              <p className="text-gray-400 text-sm">Once a document is provided, you can generate the Technical Design Document.</p>
              <Button onClick={handleGenerateTDD} isLoading={isLoading} disabled={isGenerateDisabled} icon={<Sparkles size={20} />}>
                  Generate TDD
              </Button>
              {renderErrorDisplay()}
          </div>
      </div>

      {/* Output Section */}
      {isLoading && <div className="w-full"><LoadingSpinner text="Generating TDD..." /></div>}
      
      {tddResult && !isLoading && (
        <div className="w-full flex flex-col gap-8">
          {/* TDD Preview Section */}
          <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                  <FileText className="text-cyan-400" />
                  3. Generated TDD Preview
                </h2>
                <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      title={isCopied ? 'Copied!' : 'Copy Markdown'}
                      className="p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {isCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                    <button
                      onClick={handleDownload}
                      title="Download as .md"
                      className="p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <Download size={18} />
                    </button>
                </div>
              </div>
              <div className="w-full h-[70vh] min-h-[600px] bg-gray-900/50 border-2 border-gray-700 rounded-lg overflow-hidden flex flex-row">
                  <TableOfContents content={tddResult.content} />
                  <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-200">
                      <div className="bg-white rounded-lg shadow-lg p-8 sm:p-10 lg:p-12 mx-auto max-w-5xl min-h-full">
                        <MarkdownRenderer content={tddResult.content} theme="light" />
                      </div>
                  </main>
              </div>
          </div>

          {/* Implementation Plan Section */}
          <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                <Rocket className="text-cyan-400"/>
                4. Plan Next Steps
              </h2>
              <div className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-6 flex flex-col">
                  {isGeneratingPlan ? (
                      <div className="m-auto"><LoadingSpinner text="Creating Implementation Plan..." /></div>
                  ) : plan ? (
                      <ImplementationPlanDisplay plans={plan} />
                  ) : (
                      <div className="m-auto text-center flex flex-col items-center gap-4 py-8">
                          <p className="text-gray-400">Ready to break down this TDD into an actionable implementation plan?</p>
                          <Button onClick={handleGeneratePlan} isLoading={isGeneratingPlan} icon={<Rocket size={20} />}>
                              Create Implementation Plan
                          </Button>
                          {error && isGeneratingPlan && <p className="text-red-400 flex items-center gap-2 mt-2"><FileWarning size={16} /> {error}</p>}
                      </div>
                  )}
              </div>
          </div>
        </div>
      )}
    </div>
  );
};
