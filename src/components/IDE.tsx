import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { compileCode } from '../api/compiler';

const IDE: React.FC = () => {
  const [code, setCode] = useState<string>('#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCompile = async () => {
    setIsLoading(true);
    setOutput('Compiling...');
    try {
      const response = await compileCode(code, input);
      setOutput(response.data.output || `Process exited with code ${response.data.exitCode}`);
    } catch (error: any) {
      console.error('Error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with an error status
        if (error.response.data?.error) {
          setOutput(`Error: ${error.response.data.error}`);
        } else {
          setOutput(`Server error: ${error.response.status} ${error.response.statusText}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setOutput('Cannot connect to the compiler service. Please check if the server is running.');
      } else {
        // Something else happened
        setOutput('An unexpected error occurred: ' + error.message);
      }
    } finally {
      setIsLoading(false);
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
              automaticLayout: true 
            }}
          />
        </div>
        
        {/* Right Panel */}
        <div className="w-1/3 flex flex-col gap-4">
          {/* Input Box */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Input (stdin):</h3>
            <textarea
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck="false"
            />
          </div>
          
          {/* Output Box */}
          <div className="flex-1 bg-white p-4 border border-gray-300 rounded-md overflow-auto">
            <h3 className="font-semibold mb-2">Output:</h3>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {isLoading ? 'Loading...' : output}
            </pre>
          </div>
          
          {/* Run Button */}
          <div>
            <button
              onClick={handleCompile}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-md text-white font-semibold ${
                isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDE;