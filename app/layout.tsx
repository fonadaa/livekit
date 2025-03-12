import "@livekit/components-styles";
import "./globals.css";
import { Public_Sans } from "next/font/google";

const publicSans400 = Public_Sans({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${publicSans400.className}`}>
      <head>
        <script id="noiseVertexShader" type="x-shader/x-vertex" dangerouslySetInnerHTML={{
          __html: `
            varying vec3 vNormal;
            uniform float time;
            // ... rest of your vertex shader code ...
          `
        }} />
        <script id="fragmentShader" type="x-shader/x-vertex" dangerouslySetInnerHTML={{
          __html: `
            varying vec3 vNormal;
            uniform float time;
            // ... rest of your fragment shader code ...
          `
        }} />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
