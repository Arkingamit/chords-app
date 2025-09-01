import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeTransition = () => {
  const { isTransitioning, targetTheme, completeThemeTransition, theme: currentTheme } = useTheme();
  const transitionRef = useRef(null); // For the expanding circle overlay
  const sunMoonRef = useRef(null); // For the sun/moon icon that travels
  const galaxyRef = useRef(null); // For the galaxy background
  const [animationStarted, setAnimationStarted] = useState(false);

  // Define your CSS as a string here
  const componentStyles = `
    /* General Overlay */
    .theme-transition-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999; /* Ensure it's above everything else */
      pointer-events: none; /* Allow clicks to pass through */
      clip-path: circle(0px at 0 0); /* Initial state, set by JS */
      transition: clip-path 1.0s ease-in-out, background-color 0.5s ease-in-out; /* Adjust duration and easing */
      will-change: clip-path, background-color;
    }

    /* Sun/Moon Icon Container that moves */
    .sun-moon-container {
      position: fixed;
      z-index: 10000; /* Above the overlay */
      opacity: 0; /* Hidden by default */
      pointer-events: none;
      /* Initial position set by JS, animated by keyframes */
      transition: opacity 0.3s ease-out, color 0.5s ease-in-out; /* For initial fade in/out and color change */
      will-change: left, top, transform, opacity;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px; /* SVG default width */
      height: 24px; /* SVG default height */
    }

    .sun-moon-container .sun-icon-svg {
        display: block;
        width: 100%;
        height: 100%;
    }

    /* Keyframe animations for sun/moon movement */
    @keyframes sun-move-dark {
      0% {
        opacity: 1;
        transform: translate(0, 0); /* Relative to its initial JS-set position */
      }
      100% {
        opacity: 1;
        transform: translate(calc(100vw - 24px), calc(100vh - 24px)); /* Moves roughly to bottom-right corner */
      }
    }

    @keyframes sun-move-light {
      0% {
        opacity: 1;
        transform: translate(0, 0); /* Relative to its initial JS-set position */
      }
      100% {
        opacity: 1;
        transform: translate(calc(-100vw + 24px), calc(100vh - 24px)); /* Moves roughly to bottom-left corner */
      }
    }

    .sun-moon-container[data-animation-theme="dark"].sun-moving {
      animation: sun-move-dark 1.0s ease-in-out forwards;
    }
    .sun-moon-container[data-animation-theme="light"].sun-moving {
      animation: sun-move-light 1.0s ease-in-out forwards;
    }

    /* Galaxy Container */
    .galaxy-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-image: url('/lovable-uploads/shooting-star.gif'); 
      background-size: cover;
      background-position: center;
      opacity: 0; /* Hidden by default */
      transition: opacity 1.0s ease-in-out; /* Fade in/out */
      z-index: 9990; /* Below overlay and sun/moon */
      pointer-events: none;
      will-change: opacity;
    }
    /* Controls visibility of galaxy based on theme or transition */
    .galaxy-active {
        opacity: 1;
    }

    /* Meteoroids */
    .meteoroid-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden; /* Keep meteors within viewport */
        pointer-events: none;
        z-index: 9996; /* Below sun/moon, above galaxy */
        opacity: 0; /* Hidden by default */
        transition: opacity 0.5s ease-out;
    }
    .meteoroid-container.active {
        opacity: 1;
    }

    .meteoroid {
      position: absolute;
      width: 3px;
      height: 40px;
      background: linear-gradient(to top, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0));
      border-radius: 50%;
      transform: rotate(45deg); /* Angle for streaks */
      animation: meteor-fall 2s infinite cubic-bezier(0.4, 0, 1, 1);
      opacity: 0; /* Hidden by default, animation makes it appear */
    }

    /* Randomize positions and delays */
    .meteoroid:nth-child(1) { top: 10%; left: 30%; animation-delay: 0s; }
    .meteoroid:nth-child(2) { top: 5%; left: 70%; animation-delay: 0.5s; }
    .meteoroid:nth-child(3) { top: 40%; left: 10%; animation-delay: 1s; }
    .meteoroid:nth-child(4) { top: 70%; left: 80%; animation-delay: 1.5s; }
    .meteoroid:nth-child(5) { top: 20%; left: 50%; animation-delay: 2s; }


    @keyframes meteor-fall {
        0% { transform: translate(0px, 0px) rotate(45deg); opacity: 0; }
        20% { opacity: 1; }
        100% { transform: translate(-300px, 300px) rotate(45deg); opacity: 0; }
    }

    /* Daytime Sun (a distinct visual, not the travelling sun/moon icon) */
    .daytime-sun-visual {
      position: fixed;
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, #FFD700 0%, #FFA500 50%, transparent 70%); /* Yellow to Orange gradient */
      border-radius: 50%;
      box-shadow: 0 0 40px 10px rgba(255, 215, 0, 0.6);
      opacity: 0;
      transition: opacity 1.0s ease-in-out;
      z-index: 9998; /* Above galaxy, below overlay */
      pointer-events: none;
    }
    .daytime-sun-visual.active-light {
        opacity: 1;
        top: 5%; /* Example position for daytime sun */
        right: 5%;
        transform: translate(-50%, -50%); /* Center the sun on its coords */
    }
    .daytime-sun-visual.active-dark {
        opacity: 0; /* Ensure hidden in dark theme */
    }
  `;

  // Effect to inject and remove the styles (from previous correction)
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = componentStyles;
    styleElement.id = 'theme-transition-styles'; // Give it an ID for easy removal
    document.head.appendChild(styleElement);

    return () => {
      const existingStyle = document.getElementById('theme-transition-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [componentStyles]);

  // Function to calculate start and end positions for the sun/transition
  const getAnimationProperties = useCallback(() => {
    // These are example values. You can refine them based on your UI.
    // For dark theme (day -> night), sun appears from top-left, travels to bottom-right.
    const startXDark = 0; // Top-left
    const startYDark = 0;

    // For light theme (night -> day), sun appears from top-right, travels to bottom-left.
    const startXLight = window.innerWidth; // Top-right
    const startYLight = 0;

    const startX = targetTheme === 'dark' ? startXDark : startXLight;
    const startY = targetTheme === 'dark' ? startYDark : startYLight;

    // Final radius to ensure full screen coverage
    const finalRadius = Math.max(window.innerWidth, window.innerHeight) * 1.5;

    return { startX, startY, finalRadius };
  }, [targetTheme]);


  useEffect(() => {
    if (isTransitioning && targetTheme) {
      setAnimationStarted(true); // Trigger CSS animation
      const { startX, startY, finalRadius } = getAnimationProperties();

      // Get references for dynamic styling
      const overlay = transitionRef.current;
      const sunMoon = sunMoonRef.current;
      const galaxy = galaxyRef.current;
      const daytimeSun = document.getElementById('daytime-sun-element'); // Get by ID for the static element
      const meteoroids = document.getElementById('meteoroid-elements');

      if (!overlay || !sunMoon || !galaxy || !daytimeSun || !meteoroids) {
          console.error("ThemeTransition: Missing DOM elements for animation.");
          return;
      }

      // 1. Set initial states for transition (before animation starts)
      overlay.style.clipPath = `circle(0px at ${startX}px ${startY}px)`;
      overlay.style.backgroundColor = targetTheme === 'dark' ? 'black' : 'white';

      sunMoon.style.left = `${startX}px`;
      sunMoon.style.top = `${startY}px`;
      sunMoon.style.opacity = '1';
      sunMoon.style.color = targetTheme === 'dark' ? 'white' : 'black'; // Sun/Moon icon color changes
      sunMoon.setAttribute('data-animation-theme', targetTheme);


      // 2. Add classes to trigger animations (after a short delay for initial styles to apply)
      const timeoutId = setTimeout(() => {
        overlay.style.clipPath = `circle(${finalRadius}px at ${startX}px ${startY}px)`;
        overlay.classList.add('transition-active');
        sunMoon.classList.add('sun-moving');

        if (targetTheme === 'dark') {
          galaxy.classList.add('galaxy-active');
          meteoroids.classList.add('active');
          daytimeSun.classList.remove('active-light'); // Hide day sun
          daytimeSun.classList.add('active-dark');
        } else { // targetTheme === 'light'
          galaxy.classList.remove('galaxy-active');
          meteoroids.classList.remove('active');
          daytimeSun.classList.remove('active-dark'); // Show day sun
          daytimeSun.classList.add('active-light');
        }
      }, 50); // Small delay to ensure initial styles are painted before transition starts

      // 3. Define the cleanup function after transition ends
      const handleTransitionEnd = () => {
        // This is called when the clip-path transition finishes
        completeThemeTransition(targetTheme); // Update the actual theme class on <html>

        // Reset elements to hidden/inactive state
        overlay.classList.remove('transition-active');
        overlay.style.clipPath = ''; // Reset clip path
        sunMoon.classList.remove('sun-moving');
        sunMoon.style.opacity = '0'; // Hide the traveling sun/moon
        sunMoon.removeAttribute('data-animation-theme');
        sunMoon.style.left = ''; // Reset positions
        sunMoon.style.top = '';


        setAnimationStarted(false); // Reset animation state
      };

      // 4. Attach event listener
      overlay.addEventListener('transitionend', handleTransitionEnd, { once: true });

      // Cleanup on unmount or before next effect run
      return () => {
        clearTimeout(timeoutId);
        overlay.removeEventListener('transitionend', handleTransitionEnd);
        // Ensure all elements are reset if transition is interrupted
        overlay.classList.remove('transition-active');
        overlay.style.clipPath = '';
        sunMoon.classList.remove('sun-moving');
        sunMoon.style.opacity = '0';
        sunMoon.removeAttribute('data-animation-theme');
        sunMoon.style.left = '';
        sunMoon.style.top = '';
        galaxy.classList.remove('galaxy-active');
        meteoroids.classList.remove('active');
        daytimeSun.classList.remove('active-light', 'active-dark');
      };
    } else if (!isTransitioning && animationStarted) {
      // Manual cleanup if state changes before transitionend fires (e.g., component unmounts)
      const overlay = transitionRef.current;
      const sunMoon = sunMoonRef.current;
      const galaxy = galaxyRef.current;
      const daytimeSun = document.getElementById('daytime-sun-element');
      const meteoroids = document.getElementById('meteoroid-elements');

      if (overlay) { overlay.classList.remove('transition-active'); overlay.style.clipPath = ''; }
      if (sunMoon) { sunMoon.classList.remove('sun-moving'); sunMoon.style.opacity = '0'; sunMoon.removeAttribute('data-animation-theme'); sunMoon.style.left = ''; sunMoon.style.top = ''; }
      if (galaxy) { galaxy.classList.remove('galaxy-active'); }
      if (meteoroids) { meteoroids.classList.remove('active'); }
      if (daytimeSun) { daytimeSun.classList.remove('active-light', 'active-dark'); }
      setAnimationStarted(false);
    }
  }, [isTransitioning, targetTheme, completeThemeTransition, getAnimationProperties, animationStarted]);


  // Determine the sun/moon icon (re-using your existing SVG)
  const SunMoonIcon = ({ isDarkTheme }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor" // Fill the icon based on current color
      stroke="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sun-icon-svg"
    >
      {isDarkTheme ? (
        // Moon icon for dark theme
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      ) : (
        // Sun icon for light theme
        <>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </>
      )}
    </svg>
  );


  // Render nothing if no transition is in progress and no animation has started
  if (!isTransitioning && !animationStarted) {
    return null;
  }

  // Render the elements, controlling their visibility and animation via classes/opacity
  return (
    <>
      {/* This element remains for the global light/dark theme switch */}
      <div id="daytime-sun-element"
           className={`daytime-sun-visual ${!isTransitioning && currentTheme === 'light' ? 'active-light' : 'active-dark'}`}>
      </div>

      <div ref={galaxyRef}
           className={`galaxy-container ${!isTransitioning && currentTheme === 'dark' ? 'galaxy-active' : ''}`}>
      </div>

      <div id="meteoroid-elements"
           className={`meteoroid-container ${!isTransitioning && currentTheme === 'dark' ? 'active' : ''}`}>
        <div className="meteoroid"></div>
        <div className="meteoroid"></div>
        <div className="meteoroid"></div>
        <div className="meteoroid"></div>
        <div className="meteoroid"></div>
      </div>

      <div ref={transitionRef} className="theme-transition-overlay"></div>

      <div ref={sunMoonRef} className="sun-moon-container">
        <SunMoonIcon isDarkTheme={targetTheme === 'dark'} />
      </div>
    </>
  );
};

export default ThemeTransition;     