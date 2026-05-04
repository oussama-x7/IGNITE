import { useState, useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

export function AichaModel() {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanRender(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!canRender) {
    return (
      <div className="w-full max-w-[500px] h-40 sm:h-52 md:h-64 inline-block bg-gradient-to-br from-[#1a1f2e]/10 to-primary/5 rounded-2xl animate-pulse mx-auto" />
    );
  }

  return (
    <div 
      className="w-full max-w-[500px] h-40 sm:h-52 md:h-64 inline-block mx-auto block relative" 
      style={{ 
        overflow: "hidden", 
        borderRadius: "1rem",
        animation: "float 3s ease-in-out infinite"
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
      {/* @ts-ignore */}
      <model-viewer
        src="/a"
        camera-controls
        disable-tap
        disable-zoom
        camera-orbit="0deg 110deg 80%"
        style={{
          width: "100%",
          height: "150%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "transparent"
        }}
      />
    </div>
  );
}