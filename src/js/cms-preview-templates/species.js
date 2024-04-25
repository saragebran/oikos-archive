import React, { useEffect, useRef } from "react";

const SpeciesPreview = ({ entry, widgetFor }) => {

// Function to render languages and their respective names
const renderLanguages = (languages) => {
  if (!Array.isArray(languages)) {
    return <p>Language: </p>;
  }

  return languages.map((lang, index) => {
    if (!Array.isArray(lang.names)) {
      return <li key={index}>{lang.language}?</li>;
    }
    return (
      <li key={index}>
        {lang.language}: {lang.names.join(', ')}
      </li>
    );
  });
};

// Function to get the name
const getNames = () => {
  if (Array.isArray(entry.data.languages) && entry.data.languages.length > 0) {
    // Try to find an entry with English language
    const englishLanguageEntry = entry.data.languages.find(language => language.language === 'English');
    
    // If an English language entry is found, return its first name
    if (englishLanguageEntry && Array.isArray(englishLanguageEntry.names) && englishLanguageEntry.names.length > 0) {
      return englishLanguageEntry.names[0];
    }
    
    // Fallback to the first available name if English is not found
    const firstLanguage = entry.data.languages[0];
    if (Array.isArray(firstLanguage.names) && firstLanguage.names.length > 0) {
      return firstLanguage.names[0];
    }
  }
  return 'Unknown';
};

// Function to render the preview square
const ComplementarySquare = ({ color }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const bgstroke = svgRef.current;
    if (!bgstroke) return;

    const variability = 50; // Adjust variability for control points
    const updateInterval = 3000; // Update every 3 seconds

    const animatePath = () => {
      const pathElement = bgstroke.querySelector('#morphing-path');
      if (!pathElement) return;

      let d = pathElement.getAttribute('d');
      let commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);

      let updatedCommands = commands.map((cmd) => {
        let type = cmd.charAt(0);
        let points = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

        if (type === 'M') {
          return cmd; // Do not alter the move command
        } else if (type === 'Q' || type === 'T') {
          // Adjust control points for curves
          return cmd.replace(/[0-9]+(?:\.[0-9]*)?/g, (match) => {
            let point = parseFloat(match);
            return Math.max(0, point + (Math.random() * variability - (variability / 2)));
          });
        } else {
          return cmd; // Return the command if it's not 'M', 'Q', or 'T'
        }
      });

      pathElement.setAttribute('d', updatedCommands.join(' '));
    };

    // Set the interval
    const intervalId = setInterval(animatePath, updateInterval);

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Color and path computations
  const trimmedColor = color.replace('#', '');
  const rHex = trimmedColor.slice(0, 2);
  const gHex = trimmedColor.slice(2, 4);
  const bHex = trimmedColor.slice(4, 6);
  const rInt = parseInt(rHex, 16);
  const gInt = parseInt(gHex, 16);
  const bInt = parseInt(bHex, 16);
  const rComp = (255 - rInt).toString(16).padStart(2, '0');
  const gComp = (255 - gInt).toString(16).padStart(2, '0');
  const bComp = (255 - bInt).toString(16).padStart(2, '0');
  const complimentaryColor = `#fff`; // Change #fff to #${rComp}${gComp}${bComp} to fill font with complimentaryColor.

  // Define the constants and randomness for the SVG path
  const width = 250.0;
  const height = 250.0;
  const minControlX = 10.0;
  const maxControlX = 445.0;
  const minControlY = 10.0;
  const maxControlY = 150.0;
  const variance = 10.0;

  // Random control points
  const randX = Math.random();
  const randY = Math.random();

  let controlX = (maxControlX - minControlX) * randX + minControlX;
  let controlY = (maxControlY - minControlY) * randY + minControlY;

  // Additional randomness with variance
  controlX += (randX * 2 - 1) * variance;
  controlY += (randY * 2 - 1) * variance;

  // SVG path
  const path = `M100 220 Q ${controlX.toFixed(2)} ${controlY.toFixed(2)}, 145 80 T ${width.toFixed(2)} ${height.toFixed(2)}`;


  return (
    <div className="flex flex-column items-center justify-center mb4">
      <div className="w5 h5 bt bb br bl b--black relative speciesli overflow-hidden" ref={svgRef}>
        <div className="flex title items-center justify-center w-100 h-100">
          <div className="absolute bgstroke top-0 left-0 w-100 h-100" style={{ filter: 'blur(20px)' }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <path className="cms-mist" id="morphing-path" fill="transparent" stroke={color} strokeWidth="100" d={path}></path>
            </svg>
          </div>
          <h2 className="z-1 f3 word-wrap common-name" style={{ color: complimentaryColor }}>
            {getNames() || entry.data.fileName || '?'}
          </h2>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="ph3 pv4 mw6 center">
      <ComplementarySquare color={entry.data.color || '#ffffff'} />
      <div className="cms">
      <h2>Info</h2>
      <ul className="flex flex-column">
        <li>{`Species Category: ${entry.data.category || '?'}`}</li>
        <li>{`Scientific Name: ${entry.data.fileName || '?'}`}</li>
      </ul>
      <h2>Names in different languages</h2>
      <ul>{renderLanguages(entry.data.languages)}</ul>
        <div className="pt2">----</div>
        <div><h2>Collective knowledge and stories about {'The ' + getNames() || '?'}</h2></div>
        {widgetFor("body")}
      </div>
    </div>
  );

};

export default SpeciesPreview;
