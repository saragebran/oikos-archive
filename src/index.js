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
                        commonNameElement.classList.remove('dn'); // Show the common name element
                    }

                    // Hide the noSpeciesName div
                    const noSpeciesNameDiv = speciesLi.querySelector('.noSpeciesName');
                    if (noSpeciesNameDiv) {
                        noSpeciesNameDiv.classList.add('dn');
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
      const noSpeciesNameDiv = element.querySelector('.noSpeciesName');

      if (languageObject && languageObject.names.length > 0) {
        const commonName = languageObject.names[0];
        const commonNameCapitalized = capitalizeWords(commonName);

        if (commonNameElement) {
          commonNameElement.textContent = commonNameCapitalized;
          commonNameElement.classList.remove('dn'); // Show common name
        }

        if (noSpeciesNameDiv) {
          noSpeciesNameDiv.classList.add('dn'); // Hide noSpeciesName div
        }
      } else {
        if (commonNameElement) {
          commonNameElement.classList.add('dn'); // Hide common name
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
      .replace(/, ([^,]*)$/, ', and $1'); // Replace the last comma with ', and'

    // Update the content of noSpeciesNameDiv with the formatted list of languages
    noSpeciesNameDiv.innerHTML = `There is no <span class="current-language">${capitalizeWords(selectedLanguage)}</span> name for this species, but it has been given a name in ${languageLinks}.`;

    if (observer) {
      // Attach mutation observer to the noSpeciesNameDiv if provided
      observer.observe(noSpeciesNameDiv);
    } else {
      // Attach event listeners to the language links if observer is not used
      attachLanguageLinkListeners(noSpeciesNameDiv);
    }
  } else {
    console.error('No .noSpeciesName div found for the element.');
  }
}

function attachLanguageLinkListeners(element) {
  element.querySelectorAll('.language-link').forEach(link => {
    link.addEventListener('click', handleLanguageLinkClick);
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

  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Element is in view
        const imglink = entry.target.getAttribute('imagelink');
        entry.target.style.backgroundImage = `url('${imglink}')`;
        entry.target.querySelectorAll('.language-link').forEach(link => {
          link.addEventListener('click', handleLanguageLinkClick);
        });
        entry.target.classList.add('inView'); 
      } else {
        // Element is out of view;
        // entry.target.style.backgroundColor = ''; // Reset background color
        entry.target.querySelectorAll('.language-link').forEach(link => {
          link.removeEventListener('click', handleLanguageLinkClick);             
        });
        entry.target.classList.remove('inView'); 
      }
    });
  };
  

  const observer = new IntersectionObserver(observerCallback, options);

  document.querySelectorAll('.speciesli').forEach(element => {
    observer.observe(element);
  });
});


loadLanguageDropdown()