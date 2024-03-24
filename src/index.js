// JS Goes here - ES6 supported

import "./css/main.scss";

function loadLanguageDropdown() {
  document.addEventListener('DOMContentLoaded', function() {
    fetch('/index.json')
      .then(response => response.json())
      .then(data => {
        const languages = data[0].languages;
        const selectElement = document.getElementById('languages');
        
        languages.forEach(language => {
          if (language !== 'English') { // Skip the 'English' language
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language;
            selectElement.appendChild(option);
          }
        });
      })
      .catch(error => console.error('Error loading the languages:', error));
  });
}

function capitalizeWords(str) {
    return str
      .split(' ') // Split the string into an array of words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(' '); // Join the words back into a single string
}

function handleLanguageLinkClick(event) {
    event.preventDefault(); // Prevent the default link action
    const lang = event.target.dataset.lang.toLowerCase(); // Get the language code from the clicked link
    const speciesLi = event.target.closest('.speciesli'); // Find the closest .speciesli container
    const uuid = speciesLi.id; // Use the id of the speciesLi element as the UUID

    // Fetch the JSON data
    fetch('/index.json')
        .then(response => response.json())
        .then(data => {
            const speciesData = data[1].index[uuid]; // Access the species data using the UUID

            if (speciesData && speciesData.languages) {
                // Find the language object
                const languageObject = speciesData.languages.find(langObj => langObj.language.toLowerCase() === lang);

                if (languageObject && languageObject.names.length > 0) {
                    // Extract the common name for the selected language
                    const commonName = languageObject.names[0];
                    const commonNameCapitalized = capitalizeWords(commonName);

                    // Update the displayed common name
                    const commonNameElement = speciesLi.querySelector('.common-name');
                    if (commonNameElement) {
                        commonNameElement.innerText = commonNameCapitalized;
                          commonNameElement.classList.remove('dn');                        
                    }
                } else {
                    console.error('Common name not available in this language:', lang);
                }
            } else {
                console.error('Species not found:', uuid);
            }
        })
        .catch(error => {
            console.error('Error fetching species data:', error);
        });
}

function fetchCommonNamesData(selectedLanguage) {
  fetch('/index.json')
      .then(response => response.json())
      .then(data => {
          updateAllCommonNames(selectedLanguage, data);
      })
      .catch(error => console.error('Error fetching index.json:', error));
}

function updateAllCommonNames(selectedLanguage, data) {
  const speciesIndex = data[1].index;

  document.querySelectorAll('.speciesli').forEach(element => {
    const uuid = element.id;
    const matchingObject = speciesIndex[uuid];

    if (matchingObject) {
      const languageObject = matchingObject.languages.find(lang => lang.language === selectedLanguage);
      const commonNameElement = element.querySelector('.common-name');
      const nameInfo = element.querySelector('.name-info');
      const noSpeciesNameDiv = element.querySelector('.noSpeciesName');
      const editNameBtn = element.querySelector('.giveLanguageName');

      if (languageObject && languageObject.names.length > 0) {
        const commonName = languageObject.names[0];
        const commonNameCapitalized = capitalizeWords(commonName);

        if (commonNameElement) {
          commonNameElement.textContent = commonNameCapitalized;
          if (commonNameElement.classList.contains('has-rep')) {
            // If the element has the 'has-rep' class, remove the 'dn' class
            commonNameElement.classList.add('dn');
          } else {
            commonNameElement.classList.remove('dn'); // Show common name
          }
        }

        if (noSpeciesNameDiv) {
          noSpeciesNameDiv.classList.add('dn'); // Hide noSpeciesName div
        }

        if (nameInfo) {
          nameInfo.classList.add('dn'); // Hide name info
        }

        if (editNameBtn) {
          editNameBtn.classList.add('dn'); // Hide edit name button
        }

      } else {
        if (commonNameElement) {
          if (commonNameElement.classList.contains('has-rep')) {
            commonNameElement.classList.add('dn');
          } else {
            commonNameElement.classList.remove('dn');
          }  

        
        }

        if (nameInfo) {
          nameInfo.classList.remove('dn'); // Show name info
        }

        if (editNameBtn) {
          editNameBtn.classList.remove('dn'); // Show edit name button
        }

        const commonNames = matchingObject.languages.reduce((acc, lang) => {
          acc[lang.language] = lang.names[0]; // Assuming we want to display the first name
          return acc;
        }, {});

        if (noSpeciesNameDiv) {
          noSpeciesNameDiv.classList.remove('dn'); // Show noSpeciesName div
          showAvailableLanguages(element, commonNames, selectedLanguage);
        }
      }
    }
  });
}

function showAvailableLanguages(element, commonNames, selectedLanguage, observer) {
  // Assuming the noSpeciesNameDiv is directly following the element
  let noSpeciesNameDiv = element.querySelector('.noSpeciesName');

  // Check if noSpeciesNameDiv exists and has the correct class
  if (noSpeciesNameDiv && noSpeciesNameDiv.classList.contains('noSpeciesName')) {
    // Filter out the selected language to avoid showing it in the list
    const languages = Object.keys(commonNames).filter(lang => lang.toLowerCase() !== selectedLanguage.toLowerCase());

    // Create links for each language and format the list with an Oxford comma
    let languageLinks = languages
      .map(lang => `<a href="#" class="language-link" data-lang="${capitalizeWords(lang)}">${capitalizeWords(lang)}</a>`)
      .join(', ')
      .replace(/, ([^,]*)$/, ' and $1'); // Replace the last comma with ', and'

    // Update the content of noSpeciesNameDiv with the formatted list of languages
    noSpeciesNameDiv.innerHTML = `<div>No <span>${capitalizeWords(selectedLanguage)}</span> name has been given, but it has been given a name in ${languageLinks}.</div>`;
    if (observer) {
      // Attach mutation observer to the noSpeciesNameDiv if provided
      observer.observe(noSpeciesNameDiv);
    } else {
      // Attach event listeners to the language links if observer is not used
      attachLanguageLinkListeners(noSpeciesNameDiv);
    }
    applyScrollingAnimation(element);
  } else {
    console.error('No .noSpeciesName div found for the element.');
  }
}

function attachLanguageLinkListeners(element) {
  element.querySelectorAll('.language-link').forEach(link => {
    link.addEventListener('click', handleLanguageLinkClick);
  });
}

function applyScrollingAnimation(targetElement) {
  const elements = targetElement.querySelectorAll('.noRep div, .noSpeciesName div');
    elements.forEach(element => {
      const contentWidth = element.scrollWidth;
      const parentWidth = element.parentElement.offsetWidth;
      const distanceToScroll = contentWidth + parentWidth;

      const animationName = `scrollHorizontally-${element.className}-${Math.random().toString(36).substring(2, 9)}`;

      if (contentWidth > parentWidth) {
        const style = document.createElement('style');
        style.type = 'text/css';
        const keyframes = `
          @keyframes ${animationName} {
            from {
              transform: translateX(${parentWidth}px);
            }
            to {
              transform: translateX(-${contentWidth}px);
            }
          }
        `;
        style.innerHTML = keyframes;
        document.head.appendChild(style);

        element.style.animation = `${animationName} ${distanceToScroll / 50}s linear infinite`;
      }
    });
}

function applyMistAnimation(targetElement) {
  const paths = document.querySelectorAll('.path');
  const bgstroke = document.querySelector('.bgstroke');
  const bounds = bgstroke.getBoundingClientRect();
  const variability = 800; // Max variability for control points
  const updateInterval = 5000; // Interval to update target positions
  const lerpFactor = 0.0005; // Factor to control the smoothing (lower is smoother)

  paths.forEach((path) => {
    let currentPath = path.getAttribute('d').match(/[a-zA-Z][^a-zA-Z]*/g).map(cmd => {
      const points = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(num => !isNaN(num));
      return {
        type: cmd.charAt(0),
        points: points
      };
    });

    let targetPath = JSON.parse(JSON.stringify(currentPath)); // Deep copy

    const updateTargetPath = () => {
      // Assuming the first point doesn't move, use its position to limit the control points
      const baseX = currentPath[0].points[0];
      const baseY = currentPath[0].points[1];

      // Update only the control point of the Q command
      // Ensure the new points are within a certain range to keep them inside the .bgstroke element
      targetPath[1].points[0] = Math.min(Math.max(baseX + (Math.random() * 2 * variability - variability), 0), bounds.width);
      targetPath[1].points[1] = Math.min(Math.max(baseY + (Math.random() * 2 * variability - variability), 0), bounds.height);

      // Update the end point of the Q command, which is the control point of the T command
      targetPath[1].points[2] = Math.min(Math.max(baseX + (Math.random() * 2 * variability - variability), 0), bounds.width);
      targetPath[1].points[3] = Math.min(Math.max(baseY + (Math.random() * 2 * variability - variability), 0), bounds.height);
    };

    const animatePath = () => {
      // Lerp the Q command control and end points linearly
      for (let i = 0; i < 4; i++) {
        currentPath[1].points[i] += (targetPath[1].points[i] - currentPath[1].points[i]) * lerpFactor;
      }
      
      // Generate the new d attribute
      const newD = currentPath.map(cmd => `${cmd.type}${cmd.points.join(' ')}`).join(' ');
      path.setAttribute('d', newD);
      
      requestAnimationFrame(animatePath);
    };

    setInterval(updateTargetPath, updateInterval);
    animatePath();
  });
}

// Add event listener to language selector dropdown
document.addEventListener('DOMContentLoaded', function() {
  const languageSelect = document.getElementById('languages');


  // Listen for changes on the language select dropdown
  languageSelect.addEventListener('change', function() {
      const selectedLanguage = languageSelect.value;
      fetchCommonNamesData(selectedLanguage);
  });
});

// Do when DOM has loaded
document.addEventListener('DOMContentLoaded', () => {
  const options = {
    root: null,
    rootMargin: '100px 0px',
    threshold: 0.01
  };

  const stopAnimationMap = {}; // Object to store stop functions for mist animations

  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      const elementId = entry.target.id; // Assume each target has a unique ID for reference
  
      if (entry.isIntersecting) {
        // Element is in view
        if (!entry.target.classList.contains('inView')) {
          const imglink = entry.target.getAttribute('imagelink');
          entry.target.style.backgroundImage = `url('${imglink}')`;
          entry.target.querySelectorAll('.language-link').forEach(link => {
            link.addEventListener('click', handleLanguageLinkClick);
          });
          applyScrollingAnimation(entry.target); // Apply scrolling animation
          stopAnimationMap[elementId] = applyMistAnimation(entry.target); // Apply mist animation and store the stop function
          entry.target.classList.add('inView');
        }
      } else {
        // Element is out of view
        if (entry.target.classList.contains('inView')) {
          entry.target.querySelectorAll('.language-link').forEach(link => {
            link.removeEventListener('click', handleLanguageLinkClick);
          });
          entry.target.querySelectorAll('.noRep div, .noSpeciesName div').forEach(element => {
            element.style.animation = 'none'; // Remove specific animations
          });
          if (stopAnimationMap[elementId]) {
            stopAnimationMap[elementId](); // Stop the mist animation
            delete stopAnimationMap[elementId]; // Remove the stop function reference
          }
          entry.target.classList.remove('inView');
        }
      }
    });
  };
  
  
  

  const observer = new IntersectionObserver(observerCallback, options);

  document.querySelectorAll('.speciesli').forEach(element => {
    observer.observe(element);
  });
});


loadLanguageDropdown()