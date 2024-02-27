// JS Goes here - ES6 supported

import "./css/main.scss";


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
    const h2Element = speciesLi.querySelector('h2[title]'); // Find the h2 element with the title attribute
    const scientificName = h2Element.getAttribute('title'); // Get the scientific name from the title attribute
    const noSpeciesText = speciesLi.querySelector('.noSpeciesName'); // Get the scientific name from the title attribute

    // Fetch the JSON data
    fetch('/index.json')
        .then(response => response.json())
        .then(data => {
            // Find the species data by scientific name
            const species = data.find(species => species.scientificName === scientificName);

            if (species && species.commonNames && species.commonNames[lang]) {
                // Extract the common name for the selected language
                const commonName = species.commonNames[lang]; // Directly access the common name
                const commonNameCapitalized = capitalizeWords(commonName[0]); // Capitalize the common name
                h2Element.innerHTML = `<a class="no-underline" href="${h2Element.querySelector('a').getAttribute('href')}">${commonNameCapitalized}</a>`; // Update the h2 content while preserving the link
                noSpeciesText.style.display = 'none'; // Hide the no species text element
            } else {
                console.error('Common name not available in this language or species not found:', scientificName, lang);
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
  document.querySelectorAll('.common-name').forEach(element => {
      const scientificName = element.title;
      const matchingObject = data.find(item => item.scientificName === scientificName);
      if (matchingObject && matchingObject.commonNames[selectedLanguage]) {
          const commonName = matchingObject.commonNames[selectedLanguage];
          console.log(commonName[0]);
          const commonNameCapitalized = capitalizeWords(commonName[0]);
          element.querySelector('a').textContent = commonNameCapitalized;
          // Remove the noSpeciesName div when common name exists
          let noSpeciesNameDiv = element.nextElementSibling;
          if (noSpeciesNameDiv && noSpeciesNameDiv.classList.contains('noSpeciesName')) {
              noSpeciesNameDiv.remove();
          }
      } else {
          // If no common name in selected language, show other available languages
          showAvailableLanguages(element, matchingObject ? matchingObject.commonNames : {}, selectedLanguage);          
      }
  });
}

function showAvailableLanguages(element, commonNames, selectedLanguage, observer) {
  if (!observer) {
  // Remove existing noSpeciesName div if it exists to avoid duplicates
  let noSpeciesNameDiv = element.nextElementSibling;
  // console.log(noSpeciesNameDiv);
  if (!noSpeciesNameDiv || !noSpeciesNameDiv.classList.contains('noSpeciesName')) {
      noSpeciesNameDiv = document.createElement('div');
      noSpeciesNameDiv.className = 'noSpeciesName';
      element.parentNode.insertBefore(noSpeciesNameDiv, element.nextSibling);
      element.querySelector('a').textContent = ""; // Remove common name if no species name
      
  }
  
  const languages = Object.keys(commonNames).filter(lang => lang !== selectedLanguage);
  let languageLinks = languages.map(lang => `<a href="#" class="language-link" data-lang="${capitalizeWords(lang)}">${capitalizeWords(lang)}</a>`).join(', ').replace(/, ([^,]*)$/, ', and $1');

  noSpeciesNameDiv.innerHTML = `<p class="f6 ma0 secondary">There is no <span class="current-language">${capitalizeWords(selectedLanguage)}</span> name for this species, but it has been given a name in ${languageLinks}.</p>`;
  attachLanguageLinkListeners(noSpeciesNameDiv); // Attach click event listeners to newly added language links
  } else {
      // Attach click event listeners to newly added language links
      observer.observe(noSpeciesNameDiv);
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
        const color = entry.target.getAttribute('color');
        entry.target.style.backgroundColor = color;
        entry.target.querySelectorAll('.language-link').forEach(link => {
          link.addEventListener('click', handleLanguageLinkClick);
        });
        entry.target.classList.add('inView'); 
      } else {
        // Element is out of view;
        entry.target.style.backgroundColor = ''; // Reset background color
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


