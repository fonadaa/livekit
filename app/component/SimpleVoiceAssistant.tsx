import { useEffect, useRef } from "react";
import { AgentState, useVoiceAssistant } from "@livekit/components-react";
function SimpleVoiceAssistant(props: {
    onStateChange: (state: AgentState) => void;
}) {
    const { state, audioTrack } = useVoiceAssistant();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        props.onStateChange(state);
    }, [props, state]);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let animationFrameId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            switch (state) {
                case "disconnected":
                case "initializing": // Same animation as disconnected for initializing
                    drawDisconnectedAnimation(ctx, canvas);
                    break;
                case "listening":
                    drawListeningAnimation(ctx, canvas);
                    break;
                case "thinking":
                    drawThinkingAnimation(ctx, canvas);
                    break;
                case "speaking":
                    drawRespondingAnimation(ctx, canvas);
                    break;
                default:
                    drawInitialLoadingAnimation(ctx, canvas); // Initial loading state
                    break;
            }
            animationFrameId = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [state]);
    return (
        <div className="h-[300px] max-w-[90vw] mx-auto">
            <canvas ref={canvasRef} width={800} height={300} className="w-full h-full" />
        </div>
    );
}
function drawInitialLoadingAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // Earth-like sphere revolving in an atmosphere
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const earthRadius = 50;
    const atmosphereRadius = 70;
    const time = Date.now() * 0.001; // Animation speed
    // Draw atmosphere
    ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, atmosphereRadius + Math.sin(time) * 10, 0, Math.PI * 2);
    ctx.stroke();
    // Draw earth
    ctx.fillStyle = "#1e90ff"; // Earth-like blue
    ctx.beginPath();
    ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
    ctx.fill();
}
function drawDisconnectedAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const time = Date.now() * 0.005; // Time-based animation speed
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 70;
    const pulse = Math.sin(time * 3) * 2; // Pulsing effect
    const radius = baseRadius + pulse; // Dynamic scaling
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Create radial gradient to match glowing effect
    const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 2);
    gradient.addColorStop(0, "rgba(0, 255, 180, 0.8)"); // Inner glow
    gradient.addColorStop(0.5, "rgba(0, 180, 140, 0.6)"); // Middle
    gradient.addColorStop(1, "rgba(0, 100, 100, 0.2)"); // Outer fade
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    // Soft shadow for depth
    ctx.shadowBlur = 50;
    ctx.shadowColor = "rgba(0, 255, 180, 0.5)";
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time); // Increased rotation speed
    ctx.translate(-centerX, -centerY);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Draw microphone icon in center
    drawMicrophoneIcon(ctx, centerX, centerY, 20);
    requestAnimationFrame(() => drawDisconnectedAnimation(ctx, canvas));
}
// Function to draw a simple microphone icon
function drawMicrophoneIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = "#ffffff";
    // Mic body
    ctx.beginPath();
    ctx.rect(x - size / 4, y - size / 2, size / 2, size);
    ctx.fill();
    // Mic head (circle)
    ctx.beginPath();
    ctx.arc(x, y - size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();
    // Mic stand
    ctx.beginPath();
    ctx.rect(x - size / 8, y + size / 2, size / 4, size / 3);
    ctx.fill();
    // Base
    ctx.beginPath();
    ctx.rect(x - size / 2, y + size * 0.75, size, size / 6);
    ctx.fill();
}
function drawListeningAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // Rounded circle going out of the ball for listening state
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;
    const time = Date.now() * 0.002; // Animation speed
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    // Outer circle animation
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + Math.sin(time) * 20, 0, Math.PI * 2);
    ctx.stroke();
}
function drawThinkingAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const nucleusRadius = 30;
    const electronRadius = 10;
    const orbitRadiusX = 80; // Horizontal radius of orbit
    const orbitRadiusY = 50; // Vertical radius for 3D effect
    const time = Date.now() * 0.002; // Animation speed
    const electronCount = 5; // Number of orbiting electrons
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw nucleus (protons & neutrons)
    const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, nucleusRadius * 2);
    gradient.addColorStop(0, "rgba(255, 0, 0, 0.9)"); // Inner red glow
    gradient.addColorStop(0.5, "rgba(0, 0, 255, 0.7)"); // Mix with blue
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.3)"); // Outer fade
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
    ctx.fill();
    // Draw electron orbits (elliptical paths)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, orbitRadiusX + i * 10, orbitRadiusY + i * 5, Math.PI / 4 * i, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Draw electrons moving in elliptical paths
    for (let i = 0; i < electronCount; i++) {
        const angle = time + (i * (Math.PI * 2)) / electronCount;
        const x = centerX + Math.cos(angle) * orbitRadiusX;
        const y = centerY + Math.sin(angle) * orbitRadiusY;
        ctx.fillStyle = "rgba(0, 255, 0, 1)"; // Green electrons
        ctx.beginPath();
        ctx.arc(x, y, electronRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}
function drawRespondingAnimation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // Web-like animation with 3-5 circles radiating out
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;
    const time = Date.now() * 0.002; // Animation speed
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    // Draw 3-5 radiating circles
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const circleRadius = radius + Math.sin(time + i) * 50;
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
}
export default SimpleVoiceAssistant;