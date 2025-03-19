'use client';

import { useEffect } from "react";
import { AgentState, useVoiceAssistant } from "@livekit/components-react";
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// Define the props type for AbstractBall
type AbstractBallProps = {
  perlinTime: number;
  chromaRGBr: number;
  chromaRGBg: number;
  chromaRGBb: number;
  state: AgentState;
};

// Fix the dynamic import with proper typing
const AbstractBall = dynamic<AbstractBallProps>(() =>
  import('./AbstractBall').then((mod) => mod.default as ComponentType<AbstractBallProps>),
  { ssr: false }
);

function SimpleVoiceAssistant(props: { onStateChange: (state: AgentState) => void }) {
  const { state } = useVoiceAssistant();

  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);

  // Map states to animation parameters with color influence
  const getAnimationParams = () => {
    console.log('state--', state);
    // disconnected -> when application loaded
    // connecting -> wehen clicked on start call
    // initializing -> till get the prmpt of allow microphone access
    // thinking -> when assistant is thinking

    // speaking -> when assistant is speaking
    switch (state) {
      case "disconnected":
        return {
          perlinTime: 15.0,
          chromaRGBr: 3.0,
          chromaRGBg: 3.0,
          chromaRGBb: 3.0,
          state: state
        };
      case "listening":
        return {
          perlinTime: 25.0,
          chromaRGBr: 2.0,
          chromaRGBg: 5.0,
          chromaRGBb: 3.0,
          state: state
        };
      case "thinking":
        return {
          perlinTime: 35.0,
          chromaRGBr: 1.0,
          chromaRGBg: 4.0,
          chromaRGBb: 2.0,
          state: state
        };
      case "speaking":
        return {
          perlinTime: 45.0,
          chromaRGBr: 5.0,
          chromaRGBg: 5.0,
          chromaRGBb: 5.0,
          state: state
        };
      default:
        return {
          perlinTime: 25.0,
          chromaRGBr: 2.0,
          chromaRGBg: 2.0,
          chromaRGBb: 2.0,
          state: state
        };
    }
  };

  return (
    <div className="h-[300px] w-full max-w-[90vw] mx-auto relative flex flex-col items-center">
      {state === "initializing" || state === "connecting" && (
        <div className="text-s text-gray-700 mt-5">
          Hang on, we're granting your microphone access
        </div>
      )}
      <AbstractBall {...getAnimationParams()} />
    </div>
    // <div className="h-[300px] w-full max-w-[90vw] mx-auto relative">
    //   <AbstractBall {...getAnimationParams()} />
    // </div>
  );
}

export default SimpleVoiceAssistant;
