import React, { useEffect, useState } from 'react';

// Define phases for the landing page animation
type LandingPhase =
  | 'initial_logo'
  | 'dividing_screen'
  | 'instrument_reveal'
  | 'fading_out';

interface LandingPageProps {
  onAnimationComplete: () => void; // Callback to notify parent when animation is done
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnimationComplete }) => {
  const [phase, setPhase] = useState<LandingPhase>('initial_logo');
  const [currentInstrumentIndex, setCurrentInstrumentIndex] = useState<number | null>(null);
  const [fadeLandingPage, setFadeLandingPage] = useState(false); // Controls the final fade out

  // Define instrument data (using placeholder images for demonstration)
  const instruments = [
    { name: 'Guitar', src: '/lovable-uploads/guitar.jpg?text=Guitar' },
    { name: 'Piano', src: '/lovable-uploads/piano.jpg?text=Piano' },
    { name: 'Drums', src: '/lovable-uploads/drums.jpg?text=Drums' },
    { name: 'Violin', src: '/lovable-uploads/violin.jpg?text=Violin' },
    { name: 'Saxophone', src: '/lovable-uploads/Saxophone.jpg?text=Saxophone' },
  ];

  useEffect(() => {
    // Define the CSS for animations dynamically
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      body {
        overflow: hidden; /* Prevent scrollbars during animation */
      }

      @keyframes fadeInScale {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes slideInUpBounce {
        0% { opacity: 0; transform: translateY(40px); }
        60% { opacity: 1; transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }

      @keyframes backgroundPulse {
        0% { background-size: 150% 150%; background-position: 50% 50%; }
        50% { background-size: 170% 170%; background-position: 40% 60%; }
        100% { background-size: 150% 150%; background-position: 50% 50%; }
      }

      /* Animation for regions dividing */
      @keyframes divideScreen {
        from { border-width: 0px; opacity: 0; }
        to { border-width: 1px; opacity: 1; }
      }

      /* Animation for current instrument image appearing and expanding */
      @keyframes instrumentExpand {
        0% { opacity: 0; transform: scale(0.5); }
        50% { opacity: 1; transform: scale(1.05); } /* Slightly overshoot */
        100% { opacity: 1; transform: scale(1); }
      }

      /* Animation for instrument name appearing */
      @keyframes nameFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .animate-fadeInScale { animation: fadeInScale 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      .animate-slideInUpBounce-1 { animation: slideInUpBounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: 0.3s; opacity: 0; }
      .animate-slideInUpBounce-2 { animation: slideInUpBounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: 0.6s; opacity: 0; }
      .animated-background {
        background: radial-gradient(circle at center, #2a0a0a 0%, #000 70%); /* Dark red to black */
        animation: backgroundPulse 5s infinite alternate ease-in-out;
      }

      .region-cell {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative; /* For absolutely positioning content inside */
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(0, 0, 0, 0.5); /* Base background for regions */
        opacity: 0; /* Hidden initially for division animation */
        animation: divideScreen 0.5s ease-out forwards; /* For the division animation */
      }
      .region-cell:nth-child(1) { animation-delay: 1.5s; } /* Stagger division animation */
      .region-cell:nth-child(2) { animation-delay: 1.6s; }
      .region-cell:nth-child(3) { animation-delay: 1.7s; }
      .region-cell:nth-child(4) { animation-delay: 1.8s; }
      .region-cell:nth-child(5) { animation-delay: 1.9s; }


      .instrument-img {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover; /* Ensures image fills the region */
        filter: brightness(0.5); /* Dim image to make text stand out */
        animation: instrumentExpand 1s ease-out forwards;
        z-index: 10;
      }

      .instrument-name {
        position: relative; /* Keep name above the image */
        color: #f7d247; /* Gold/yellow color for name */
        font-size: 2.5rem; /* Larger font size */
        font-weight: bold;
        text-shadow: 2px 2px 5px rgba(0,0,0,0.8);
        animation: nameFadeIn 0.5s ease-out forwards;
        animation-delay: 0.5s; /* Delay name appearance after image */
        z-index: 20;
      }

      /* Style for instruments that have already "merged" */
      .instrument-img-merged {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.3); /* Even dimmer when just background */
        opacity: 0.8; /* Slightly visible */
      }
    `;
    document.head.appendChild(styleSheet);

    // --- Animation Orchestration ---

    // 0ms: Initial logo & text phase (default)
    const logoTextEnd = setTimeout(() => {
      // 1.5s: Transition to screen division
      setPhase('dividing_screen');
    }, 1500);

    // 2s: Start instrument reveal sequence
    const instrumentSequenceStart = setTimeout(() => {
      setPhase('instrument_reveal');
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < instruments.length) {
          setCurrentInstrumentIndex(currentIdx);
          currentIdx++;
        } else {
          clearInterval(interval);
        }
      }, 1000); // Show each instrument for 1 second

      return () => clearInterval(interval); // Cleanup interval
    }, 2000);

    // 6.5s: Start final fade out of the entire landing page
    const finalFadeOutStart = setTimeout(() => {
      setPhase('fading_out');
      setFadeLandingPage(true);
    }, 7500); // All instruments shown, begin fade

    // 7s: Remove landing page from DOM (total display time)
    const landingPageComplete = setTimeout(() => {
      // Notify parent component that animation is complete
      onAnimationComplete();
    }, 8000);

    return () => {
      clearTimeout(logoTextEnd);
      clearTimeout(instrumentSequenceStart);
      clearTimeout(finalFadeOutStart);
      clearTimeout(landingPageComplete);
      document.head.removeChild(styleSheet);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div
      className={`relative flex flex-col justify-center items-center min-h-screen bg-black animated-background ${
        fadeLandingPage ? 'transition-opacity duration-500 ease-out opacity-0' : 'opacity-100'
      }`}
    >
      {/* Phase 1: Logo and Taglines */}
      {phase === 'initial_logo' && (
        <>
          <img
            src="/lovable-uploads/38d03c7b-dbd8-42ae-8501-7b5bb7e29495.png"
            alt="Grace Music Logo"
            className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto mb-5 rounded-lg shadow-lg animate-fadeInScale z-10"
          />

        </>
      )}

      {/* Phases involving the 5-region grid */}
      {(phase === 'dividing_screen' || phase === 'instrument_reveal' || phase === 'fading_out') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 w-full h-full absolute inset-0">
          {instruments.map((instrument, index) => (
            <div
              key={index}
              className={`region-cell ${phase === 'dividing_screen' ? '' : 'opacity-100'}`}
              style={{
                // Stagger the initial region division if not already visible
                animationDelay: phase === 'dividing_screen' ? `${1.5 + index * 0.1}s` : '0s'
              }}
            >
              {/* Render active instrument (image and name) */}
              {phase === 'instrument_reveal' && currentInstrumentIndex === index && (
                <>
                  <img
                    src={instrument.src}
                    alt={instrument.name}
                    className="instrument-img"
                  />
                  <p className="instrument-name">{instrument.name}</p>
                </>
              )}

              {/* Render instruments that have already been revealed and are now 'merged' background */}
              {(phase === 'instrument_reveal' && currentInstrumentIndex !== null && index < currentInstrumentIndex) && (
                <img
                  src={instruments[index].src}
                  alt={instruments[index].name}
                  className="instrument-img-merged"
                />
              )}

              {/* When fading out, ensure all images are shown as merged backgrounds */}
              {phase === 'fading_out' && (
                   <img
                     src={instruments[index].src}
                     alt={instruments[index].name}
                     className="instrument-img-merged"
                   />
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
