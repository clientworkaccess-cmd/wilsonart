
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RetellWebClient } from "retell-client-js-sdk";
import Visualizer from './components/Visualizer';
import { CallStatus } from './types';

// Use a singleton for the SDK client as recommended
const retellWebClient = new RetellWebClient();

const App: React.FC = () => {
  const [status, setStatus] = useState<CallStatus>(CallStatus.IDLE);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration constants provided by the user
  const RETELL_API_KEY = "key_7e9e056c1966ba34389499367c32";
  const RETELL_AGENT_ID = "agent_41f16e0548bdc72534dd8f5718";

  useEffect(() => {
    // Setup SDK Event Listeners
    retellWebClient.on("call_started", () => {
      setStatus(CallStatus.ACTIVE);
      setError(null);
    });

    retellWebClient.on("call_ended", () => {
      setStatus(CallStatus.IDLE);
      setIsAgentSpeaking(false);
    });

    retellWebClient.on("agent_start_talking", () => {
      setIsAgentSpeaking(true);
    });

    retellWebClient.on("agent_stop_talking", () => {
      setIsAgentSpeaking(false);
    });

    retellWebClient.on("error", (err: any) => {
      console.error("SDK Error:", err);
      setError(typeof err === 'string' ? err : "A communication error occurred");
      setStatus(CallStatus.ERROR);
      retellWebClient.stopCall();
    });

    // Cleanup
    return () => {
      retellWebClient.stopCall();
    };
  }, []);

  const handleToggleCall = async () => {
    if (status === CallStatus.ACTIVE || status === CallStatus.CONNECTING) {
      retellWebClient.stopCall();
      return;
    }

    try {
      setStatus(CallStatus.CONNECTING);
      setError(null);

      const response = await fetch('https://api.retellai.com/v2/create-web-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RETELL_API_KEY}`
        },
        body: JSON.stringify({
          agent_id: RETELL_AGENT_ID
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to initialize call. Verify your API key and Agent ID.");
      }

      const data = await response.json();
      
      await retellWebClient.startCall({
        accessToken: data.access_token,
        sampleRate: 24000,
      });

    } catch (err: any) {
      console.error("Start Call Error:", err);
      setError(err.message || "Failed to start call");
      setStatus(CallStatus.IDLE);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
            <i className="fas fa-robot text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Retell Voice AI</h1>
            <p className="text-[10px] text-gray-500 font-mono">AGENT: {RETELL_AGENT_ID.substring(0, 12)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === CallStatus.ACTIVE ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
          <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            {status}
          </span>
        </div>
      </header>

      {/* Main Experience */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        {/* Visualizer Card */}
        <div className="w-full bg-gray-900/50 border border-gray-800 rounded-[3rem] p-12 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
          <Visualizer isActive={status === CallStatus.ACTIVE} isSpeaking={isAgentSpeaking} />
          
          <div className="mt-12 text-center">
            {status === CallStatus.IDLE && (
              <div className="space-y-2">
                <p className="text-xl font-light text-gray-300">Ready to speak?</p>
                <p className="text-sm text-gray-500 italic">Click the microphone to begin your session</p>
              </div>
            )}
            {status === CallStatus.ACTIVE && (
              <p className="text-2xl font-medium text-blue-400 tracking-wide animate-pulse">
                {isAgentSpeaking ? 'Agent is speaking...' : 'Listening to you...'}
              </p>
            )}
            {status === CallStatus.CONNECTING && (
              <p className="text-xl text-yellow-400 animate-pulse">Establishing connection...</p>
            )}
          </div>
        </div>
      </main>

      {/* Persistent Call-to-Action */}
      <footer className="py-12 flex flex-col items-center gap-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-6 py-3 rounded-2xl text-sm mb-4 max-w-md text-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}
        
        <button
          onClick={handleToggleCall}
          disabled={status === CallStatus.CONNECTING}
          className={`group relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 shadow-2xl ${
            status === CallStatus.ACTIVE 
              ? 'bg-red-500 hover:bg-red-600 scale-110' 
              : 'bg-blue-600 hover:bg-blue-500 hover:scale-110'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {status === CallStatus.ACTIVE ? (
            <i className="fas fa-phone-slash text-3xl"></i>
          ) : (
            <i className="fas fa-microphone text-3xl"></i>
          )}
          
          {/* Animated rings when active */}
          {status === CallStatus.ACTIVE && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500 pulse-animation" style={{ animationDelay: '0s' }}></div>
              <div className="absolute inset-0 rounded-full bg-red-500 pulse-animation" style={{ animationDelay: '0.4s' }}></div>
            </>
          )}
        </button>
        
        <p className="text-sm text-gray-500 font-bold tracking-[0.2em] uppercase">
          {status === CallStatus.ACTIVE ? 'End Call' : 'Start Call'}
        </p>
      </footer>
    </div>
  );
};

export default App;
