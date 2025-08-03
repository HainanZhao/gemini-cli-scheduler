import React, { useState } from 'react';
import axios from 'axios';

interface PromptTesterProps {
  initialPrompt?: string;
  onPromptChange?: (prompt: string) => void;
}

interface TestResult {
  success: boolean;
  output: string;
  duration: number;
}

const PromptTester: React.FC<PromptTesterProps> = ({ initialPrompt = '', onPromptChange }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState('');

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    if (onPromptChange) {
      onPromptChange(newPrompt);
    }
    if (testResult) {
      setTestResult(null);
    }
    if (error) {
      setError('');
    }
  };

  const testPrompt = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to test');
      return;
    }

    setIsLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await axios.post('/api/test-prompt/test', {
        prompt: prompt.trim()
      });

      setTestResult(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error testing prompt';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <span className="icon icon-test icon-lg text-primary-500"></span>
          <div>
            <h3 className="card-title">Test Your Prompt</h3>
            <p className="card-subtitle">Verify your AI prompt before scheduling</p>
          </div>
        </div>
      </div>
      
      <div className="card-body grid gap-4">
        <div className="form-group">
          <label className="form-label required">
            <span className="icon icon-robot"></span>
            AI Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Enter your prompt here to test it before scheduling..."
            rows={4}
            className="form-control"
          />
          <div className="form-text">
            Describe the task you want the AI to perform. Be specific and clear.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={testPrompt}
            disabled={isLoading || !prompt.trim()}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Testing Prompt...
              </>
            ) : (
              <>
                <span className="icon icon-test"></span>
                Test with Gemini AI
              </>
            )}
          </button>
          
          {isLoading && (
            <div className="text-sm text-secondary flex items-center gap-2">
              <span className="icon icon-clock"></span>
              This may take a few seconds...
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="icon icon-error"></span>
            <strong>Test Failed:</strong> {error}
          </div>
        )}

        {testResult && (
          <div className={`card ${testResult.success ? 'border-success-300' : 'border-error-300'}`}>
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`badge ${testResult.success ? 'badge-success' : 'badge-error'}`}>
                    <span className={`icon ${testResult.success ? 'icon-success' : 'icon-error'}`}></span>
                    {testResult.success ? 'Success' : 'Failed'}
                  </span>
                  <span className="text-sm text-secondary flex items-center gap-1">
                    <span className="icon icon-clock"></span>
                    Completed in {testResult.duration}s
                  </span>
                </div>
              </div>
            </div>
            
            <div className="card-body">
              <h4 className="text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                <span className="icon icon-robot"></span>
                AI Response:
              </h4>
              <div className="bg-secondary rounded-lg p-4">
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {testResult.output || 'No output received'}
                </pre>
              </div>
              
              {testResult.success && (
                <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-center gap-2 text-success-700">
                    <span className="icon icon-success"></span>
                    <span className="text-sm font-medium">
                      Your prompt works! You can now schedule this job.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptTester;
