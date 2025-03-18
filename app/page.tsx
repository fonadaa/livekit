"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LiveKitRoom, RoomAudioRenderer, VoiceAssistantControlBar, AgentState, DisconnectButton, } from "@livekit/components-react";
import { useCallback, useEffect, useState } from "react";
import { MediaDeviceFailure } from "livekit-client";
import type { ConnectionDetails } from "./api/connection-details/route";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import SimpleVoiceAssistant from "./component/SimpleVoiceAssistant";
import { FcEndCall } from "react-icons/fc";
import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Krisp error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Or some fallback UI
    }

    return this.props.children;
  }
}

export default function Page() {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");

  const onConnectButtonClicked = useCallback(async () => {
    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ??
      "/api/connection-details",
      window.location.origin
    );
    const response = await fetch(url.toString());
    const connectionDetailsData = await response.json();
    updateConnectionDetails(connectionDetailsData);
  }, []);

  return (
    <main
      data-lk-theme="default"
      className="h-full grid content-center bg-[var(--lk-bg)]"
    >
      <ErrorBoundary>
        <LiveKitRoom
          token={connectionDetails?.participantToken}
          serverUrl={connectionDetails?.serverUrl}
          connect={connectionDetails !== undefined}
          audio={true}
          video={false}
          onMediaDeviceFailure={onDeviceFailure}
          onDisconnected={() => {
            updateConnectionDetails(undefined);
          }}
          className="grid grid-rows-[2fr_1fr] items-center"
        >
          <SimpleVoiceAssistant onStateChange={setAgentState} />
          <ControlBar
            onConnectButtonClicked={onConnectButtonClicked}
            agentState={agentState}
          />
          <RoomAudioRenderer />
          <NoAgentNotification state={agentState} />
          <KrispNoiseManager agentState={agentState} />
        </LiveKitRoom>
      </ErrorBoundary>
    </main>
  );
}

// Create a new component to handle Krisp noise filter
function KrispNoiseManager({ agentState }: { agentState: AgentState }) {
  const krisp = useKrispNoiseFilter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initKrisp = async () => {
      if (agentState !== 'disconnected' && !isInitialized) {
        try {
          // Add a small delay to ensure WASM is loaded
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if component is still mounted
          if (!mounted) return;

          await krisp.setNoiseFilterEnabled(true);
          setIsInitialized(true);
        } catch (error: unknown) {
          // If it's not ready, try again after a delay
          if (error instanceof Error && error.message?.includes('WASM_OR_WORKER_NOT_READY') && mounted) {
            setTimeout(initKrisp, 1000);
          } else {
            console.warn('Krisp initialization warning:', error);
          }
        }
      }
    };

    if (agentState !== 'disconnected') {
      initKrisp();
    } else if (isInitialized) {
      // Disable when disconnected
      try {
        krisp.setNoiseFilterEnabled(false);
        setIsInitialized(false);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    return () => {
      mounted = false;
      if (isInitialized) {
        try {
          krisp.setNoiseFilterEnabled(false);
          setIsInitialized(false);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [agentState, krisp, isInitialized]);

  return null;
}

function ControlBar(props: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
}) {
  // Remove Krisp initialization from ControlBar
  return (
    <div className="relative h-[100px]">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className=" absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-transparent backdrop-blur-md border border-white rounded-md shadow-lg"
            onClick={() => props.onConnectButtonClicked()}
          >
            Start Call
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {props.agentState !== "disconnected" &&
          props.agentState !== "connecting" && (
            <motion.div
              initial={{ opacity: 0, top: "10px" }}
              animate={{ opacity: 1, top: 0 }}
              exit={{ opacity: 0, top: "-10px" }}
              transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
              className="flex h-8 absolute left-1/2 -translate-x-1/2  justify-center"
            >
              <VoiceAssistantControlBar controls={{ leave: false }} />
              <DisconnectButton>
                <FcEndCall />End Call
              </DisconnectButton>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
