import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { compileCode } from '../api/compiler';

const IDE: React.FC = () => {
  const [code, setCode] = useState<string>('#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}');
  const [consoleContent, setConsoleContent] = useState<string>('');
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of console whenever content changes
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleContent]);

  // Focus on input when waiting for input
  useEffect(() => {
    if (isWaitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isWaitingForInput]);

  const handleCompile = async () => {
    setIsLoading(true);
    setConsoleContent(prev => prev + 'Compiling...\n');
    
    try {
      const response = await compileCode(code, inputBuffer)
      
      // Check if the program is waiting for input
      if (response.data.output && response.data.output.includes('@@WAITING_FOR_INPUT@@')) {
        setIsWaitingForInput(true);
        setConsoleContent(prev => prev + response.data.output.replace('@@WAITING_FOR_INPUT@@', ''));
      } else {
        setConsoleContent(prev => prev + (response.data.output || `Process exited with code ${response.data.exitCode}\n`));
        setInputBuffer(''); // Clear input buffer after execution completes
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      if (error.response) {
        if (error.response.data?.error) {
          setConsoleContent(prev => prev + `Error: ${error.response.data.error}\n`);
        } else {
          setConsoleContent(prev => prev + `Server error: ${error.response.status} ${error.response.statusText}\n`);
        }
      } else if (error.request) {
        setConsoleContent(prev => prev + 'Cannot connect to the compiler service. Please check if the server is running.\n');
      } else {
        setConsoleContent(prev => prev + 'An unexpected error occurred: ' + error.message + '\n');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSubmit = () => {
    if (inputRef.current && inputRef.current.value) {
      const userInput = inputRef.current.value + '\n';
      setInputBuffer(prev => prev + userInput);
      setConsoleContent(prev => prev + userInput);
      inputRef.current.value = '';
      setIsWaitingForInput(false);
      
      // Continue execution with the new input
      handleCompile();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputSubmit();
    }
  };

  const handleRunClick = () => {
    if (isWaitingForInput) {
      handleInputSubmit();
    } else {
      // Clear console and start fresh execution
      setConsoleContent('');
      setInputBuffer('');
      handleCompile();
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="text-2xl font-bold mb-4">Online C Compiler</div>
      <div className="flex flex-1 gap-4">
        {/* Code Editor */}
        <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="c"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{ 
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              automaticLayout: true, 
            }}
          />
        </div>
        
        {/* Combined Console */}
        <div className="w-1/3 flex flex-col">
          <div className="flex-1 bg-black text-green-300 p-4 font-mono text-sm overflow-auto rounded-t-md">
            <div className="whitespace-pre-wrap">{consoleContent}</div>
            {isWaitingForInput && (
              <div className="flex items-center">
                <span className="mr-2">{'>'}</span>
                <input
                  type="text"
                  className="flex-1 bg-black text-green-300 outline-none border-none"
                  ref={inputRef}
                  onKeyPress={handleKeyPress}
                  disabled={!isWaitingForInput}
                />
              </div>
            )}
            <div ref={consoleEndRef} />
          </div>
          
          {/* Run Button */}
          <div className="mt-2">
            <button
              onClick={handleRunClick}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-md text-white font-semibold ${
                isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading 
                ? 'Running...' 
                : isWaitingForInput 
                  ? 'Submit Input' 
                  : 'Run Code'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDE;