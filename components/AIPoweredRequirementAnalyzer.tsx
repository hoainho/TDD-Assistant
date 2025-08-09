
import React, { useState, useCallback } from 'react';
import { generateAIPoweredAnalysis } from '../services/geminiService';
import { Button } from './common/Button';
import { MarkdownRenderer } from './common/MarkdownRenderer';
import { LoadingSpinner } from './common/LoadingSpinner';
import { Sparkles, Copy, Check, Download, FileWarning } from 'lucide-react';

export const AIPoweredRequirementAnalyzer: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please provide some requirement text to analyze.');
      return;
    }
    setIsLoading(true);
    setAnalysisResult('');
    setError('');
    try {
      const result = await generateAIPoweredAnalysis(inputText);
      setAnalysisResult(result);
      if (result.startsWith('Error:')) {
        setError(result);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis. Please try again.');
      setAnalysisResult('');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const handleDownload = () => {
      if (!analysisResult) return;
      const blob = new Blob([analysisResult], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AI_Requirement_Analysis.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const isAnalyzeDisabled = !inputText.trim();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 rounded-xl bg-black/30 border border-gray-700/50 backdrop-blur-sm">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-3">
            <span className="text-cyan-400 text-2xl">🔹</span>
            Requirement
        </h2>

        <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your feature description, user story, or engineering ticket here..."
            className="w-full h-96 flex-grow p-4 bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300 resize-none font-mono text-sm"
            disabled={isLoading}
        />

        <Button onClick={handleAnalyze} isLoading={isLoading} disabled={isAnalyzeDisabled} icon={<Sparkles size={20} />}>
            Analyze Requirements
        </Button>
        {error && !isLoading && (
            <div className="text-red-400 flex items-center gap-2 mt-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <FileWarning size={16} />
                <span>{error.replace('Error: ', '')}</span>
            </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-cyan-300">2. AI-Powered Analysis</h2>
            {analysisResult && !isLoading && !error && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  title={isCopied ? 'Copied!' : 'Copy as Ticket'}
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
            )}
        </div>
        <div className="w-full h-full min-h-[300px] lg:min-h-0 bg-gray-900/50 border-2 border-gray-700 rounded-lg p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner text="Analyzing Requirements..." />
            </div>
          ) : analysisResult && !error ? (
            <MarkdownRenderer content={analysisResult} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Your detailed analysis and ticket template will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};