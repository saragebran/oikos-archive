import "./css/main.scss";

function loopThroughLanguages(speciesElement) {
  let names = Array.from(speciesElement.querySelectorAll(`#namesContainer-${speciesElement.id} span`)).map(el => el.textContent);
  let currentNameIndex = 0;
  let h2Element = speciesElement.querySelector('h2');

  if (names.length > 1) {
      let intervalId;

      const changeName = () => {
          let nextNameIndex = (currentNameIndex + 1) % names.length;
          while (names[nextNameIndex] === h2Element.textContent && names.length > 1) {
              nextNameIndex = (nextNameIndex + 1) % names.length;
          }

          h2Element.classList.remove('fade-in');
          h2Element.classList.add('fade-out');

          setTimeout(() => {
              currentNameIndex = nextNameIndex;
              h2Element.textContent = names[currentNameIndex];

              h2Element.classList.remove('fade-out');
              h2Element.classList.add('fade-in');

              clearInterval(intervalId);
              intervalId = setInterval(changeName, getRandomDuration());
          }, 2000); // Duration to match the fade-out transition
      };

      const getRandomDuration = () => Math.random() * (20000 - 10000) + 10000;

      intervalId = setInterval(changeName, getRandomDuration());

      return () => clearInterval(intervalId); // Return a function to stop the interval
  }
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
  // console.log(targetElement);
  const paths = targetElement.querySelectorAll('.morphing-path');
  const bgstroke = targetElement.querySelector('.bgstroke');
  const bounds = bgstroke.getBoundingClientRect();
  const variability = 100; // Max variability for control points
  const updateInterval = 5000; // Update target positions every 5 seconds

  let intervals = []; // Store interval IDs for later cleanup

  paths.forEach((path) => {
   // console.log(`Initial path data: ${path.getAttribute('d')}`);
    const intervalId = setInterval(() => {
      let d = path.getAttribute('d');
      let commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);

      let updatedCommands = commands.map((cmd) => {
        let type = cmd.charAt(0);
        let points = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

        if (type === 'M') {
          // Log the move command points for debugging
         // console.log(`Move command points before update: ${points}`);
          return cmd;
        } else if (type === 'Q' || type === 'T') {
          // Log the original points for debugging
         // console.log(`Original points for ${type} command: ${points}`);

          points = points.map((point, i) => {
            let maxBound = i % 2 === 0 ? bounds.width : bounds.height;
            let updatedPoint = Math.min(Math.max(point + Math.random() * variability - variability / 2, 0), maxBound);
            
            // Log the updated points for debugging
            // console.log(`Updated point: ${updatedPoint}`);
            return updatedPoint;
          });

          return `${type}${points.join(' ')}`;
        } else {
          return cmd;
        }
      });

      path.setAttribute('d', updatedCommands.join(' '));
    }, updateInterval);

    intervals.push(intervalId);
  });

  // Return a stop function to clear intervals
  return () => intervals.forEach(clearInterval);
}

// Move the clicked gallery image to center of screen.
function moveToCenter(selectedItem) {
  const gallery = document.getElementById('gallery');
  let items = document.querySelectorAll('.gallery-item');

  // Get the center of the gallery viewport
  let galleryCenter = gallery.clientWidth / 2;

  // Reset all items' transformations before calculating new centering
  items.forEach(item => {
    item.style.transform = 'translateX(0px)';
  });

  // After reset, calculate the centering transformation
  setTimeout(() => {
    // Recalculate the selected item's center based on its current position within the gallery
    let itemOffset = selectedItem.offsetLeft; // Left offset of the item within the gallery
    let itemWidth = selectedItem.clientWidth; // Width of the item
    let itemInitialCenter = itemOffset + (itemWidth / 2); // Center position of the item

    // Calculate the shift needed to center the item
    let shiftX = galleryCenter - itemInitialCenter;

    // Apply a transform to each item to create the effect of centering the selected item
    items.forEach(item => {
      item.style.transform = `translateX(${shiftX}px)`;
    });

    // Update classes for centered and non-centered items
    items.forEach(item => {
      item.classList.remove('centered');
      item.style.filter = 'grayscale(1)';
      let innerDiv = item.querySelector('div.flex'); // Adjust the selector as needed
      innerDiv.classList.remove('imghighlight');
      innerDiv.style.filter = 'opacity(0.4)';
    });

    selectedItem.classList.add('centered');
    selectedItem.style.filter = 'grayscale(0)';
    let selectedInnerDiv = selectedItem.querySelector('div.flex'); // Adjust the selector as needed
    selectedInnerDiv.classList.add('imghighlight');
    selectedInnerDiv.style.filter = 'opacity(1)';
  }, 10); // Short delay to ensure styles reset
}

// Currently not in use, but could be improved and implemented.
function animatePathToCursor(pathElement, delayIncrement) {
  let mousePos = { x: 0, y: 0 };
  document.addEventListener('mousemove', (event) => {
    mousePos.x = event.clientX - (window.innerWidth / 3 );
    mousePos.y = event.clientY - (window.innerHeight / 10 );
  });

  let commands = pathElement.getAttribute('d').match(/[a-zA-Z][^a-zA-Z]*/g);
  let commandDelays = commands.map((_, index) => index * delayIncrement);

  function updatePath() {
    let newD = commands.map((cmd, index) => {
      let type = cmd.charAt(0);
      let points = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

      if (type === 'M' || type === 'Q' || type === 'T') {
        let delayTime = commandDelays[index];
        setTimeout(() => {
          let updatedPoints = points.map((point, i) => {
            if (i % 2 === 0) {  // x coordinate
              return point + (mousePos.x - point) * 0.01;  // Smooth transition toward the mouse
            } else {  // y coordinate
              return point + (mousePos.y - point) * 0.01;  // Smooth transition toward the mouse
            }
          });
          commands[index] = `${type} ${updatedPoints.join(' ')}`;
          pathElement.setAttribute('d', commands.join(' '));
        }, delayTime);
      }

      return cmd;  // Return unchanged if not applicable
    }).join(' ');
  }

  setInterval(updatePath, 100);  // Update path every 100 ms for smoother animation
}


// Animate the welcome message
document.addEventListener('DOMContentLoaded', function () {
  let currentIndex = 0;
  const typingSpeed = 100; // Speed of typing, lower is faster
  const paragraphs = document.querySelectorAll('#welcomeTexts p');
  const chicharraDiv = document.getElementById('welcomeChicharra');
  const welcomeDiv = document.getElementById('welcomeMessage');
  const footer = document.getElementById('footer');
  if (welcomeDiv) {
    function typeWriter(text, n) {
      if (n < text.length) {
        paragraphs[currentIndex].innerHTML = text.substring(0, n + 1);
        setTimeout(() => typeWriter(text, n + 1), typingSpeed);
      } else {
        // Start fading out after typing finishes
        setTimeout(() => {
          paragraphs[currentIndex].style.opacity = '0';
          paragraphs[currentIndex].addEventListener('transitionend', function handler() {
            this.removeEventListener('transitionend', handler);
            this.remove(); // Remove the paragraph after it fades out
            if (currentIndex < paragraphs.length - 1) {
              currentIndex++;
              startTyping();
            } else {
              animateChicharra();
            }
          });
        }, 2000); // Time before starting to fade out
      }
    }
  
    function startTyping() {
      if (currentIndex < paragraphs.length) {
        paragraphs[currentIndex].style.display = 'block';
        paragraphs[currentIndex].style.opacity = '1';
        typeWriter(paragraphs[currentIndex].textContent, 0);
      }
    }
    function animateChicharra() {
      chicharraDiv.style.transform = 'translateY(75vh)'; // Move the chicharra to the bottom
      footer.style.transform = 'translateY(200px)'; // Initial move for the footer
      welcomeDiv.style.opacity = "1";
    
      chicharraDiv.addEventListener('transitionend', () => {
        // Start the opacity transition after chicharra has finished moving
        welcomeDiv.style.transition = 'opacity 2s';
        welcomeDiv.style.opacity = "0";
    
        // Move the footer back after chicharra finishes its transition
        footer.style.transition = 'transform 2s';
        footer.style.transform = 'translateY(0px)';
    
        setTimeout(() => {
          welcomeDiv.remove();
        }, 2000); // Delay before removing the welcome message

      }, { once: true }); // Ensures the listener is removed after execution
    }
    
  
    startTyping();
  }
});


// Open and close footer
document.addEventListener("DOMContentLoaded", function() {
  function closeIntro() {
    console.log("Closing intro");
    const intro = document.getElementById("footer");
    const chicharraContainer = document.getElementById('chicharra-container');
    const chicharraContainerHeight = chicharraContainer ? chicharraContainer.clientHeight : 0;
    intro.classList.remove('top-0');
    intro.style.transition = "top 2s ease-in-out";
    intro.style.top = `${window.innerHeight - chicharraContainerHeight}px`;  // Adjust based on container height
    intro.classList.add('closed');
    intro.classList.remove('open');
  }

  function openIntro() {
    console.log("Opening intro");
    const intro = document.getElementById("footer");
    intro.style.transition = "top 2s ease-in-out";
    const chicharraContainer = document.getElementById('chicharra-container');
    const chicharraContainerHeight = chicharraContainer ? chicharraContainer.clientHeight : 0;
    intro.style.top = `${window.innerHeight - chicharraContainerHeight}px`;  // Adjust based on container height
    // call new thing after 1 second timeout
    setTimeout(function() {
      intro.style.top = '0px';
    }, 10);
    intro.classList.add('open');
    intro.classList.remove('closed');
    intro.classList.remove('h3');
    intro.classList.remove('bottom-0');

  }

  const chicharra = document.getElementById("chicharra");
  if (chicharra) {
    chicharra.addEventListener("click", () => {
      const intro = document.getElementById("footer");
      if (intro) {
        if (intro.classList.contains('open')) {
          closeIntro();
        } else if (intro.classList.contains('closed')) {
          openIntro();
        } else {
        console.log("Intro is neither open nor closed.");
        }
      } else {
        console.error("The element with ID 'intro' was not found.");
      }
    });
  } else {
    console.error("The element with ID 'chicharra' was not found.");
  }
});

// Homepage Observer
document.addEventListener('DOMContentLoaded', () => {
  const options = {
      root: null,
      rootMargin: '100px 0px',
      threshold: 0.01
  };

  const languageAnimationMap = {};

  const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
          const elementId = entry.target.id;

          if (entry.isIntersecting) {
              if (!entry.target.classList.contains('inView')) {
                const bgimg = entry.target.querySelector('a > img');
                if (bgimg) {
                  const imglink = bgimg.getAttribute('imagelink');
                  if (imglink) {
                    bgimg.src = imglink;
                  }
                }
                  languageAnimationMap[elementId] = loopThroughLanguages(entry.target);
                  applyScrollingAnimation(entry.target);
                  applyMistAnimation(entry.target);
                  entry.target.classList.add('inView');
              }
          } else {
              if (entry.target.classList.contains('inView')) {
                  if (languageAnimationMap[elementId]) {
                      languageAnimationMap[elementId](); // Stop the language animation
                      delete languageAnimationMap[elementId];
                  }
                  entry.target.querySelectorAll('.noRep div, .noSpeciesName div').forEach(element => element.style.animation = '');
                  entry.target.querySelectorAll('.morphing-path').forEach(element => element.style.animation = '');
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

//Complimentary color converter
document.addEventListener("DOMContentLoaded", () => {
  // Function to convert RGB color to Hex
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
  }).join('');

  // Function to calculate the complementary color
  function getComplementaryColor(hex) {
      // Remove the hash at the start if it's there
      hex = hex.replace('#', '');

      // Convert hex to RGB
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);

      // Calculate the complementary color
      r = (255 - r).toString(16).padStart(2, '0');
      g = (255 - g).toString(16).padStart(2, '0');
      b = (255 - b).toString(16).padStart(2, '0');

      // Return the complementary color with a hash if you want the common names to appear in a complimentary color
     // return `#${r}${g}${b}`;
      return `#fff`;
  }

  // Apply the complementary color to all elements with the 'comp-color' class
  const elements = document.querySelectorAll('.comp-color');

  elements.forEach(el => {
      // Get the current text color of the element
      const currentColor = window.getComputedStyle(el).color;

      // Convert the color to hexadecimal if it's in rgb(a) format
      const rgbValues = currentColor.match(/\d+/g).map(Number);
      const hexColor = rgbValues.length >= 3 ? rgbToHex(...rgbValues) : currentColor;

      // Set the complementary color as the new text color
      el.style.color = getComplementaryColor(hexColor);
  });
});

// On load of image gallery, move a random gallery image to the center and apply eventlisteners to gallery-items
document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.getElementById('gallery');
  let items = document.querySelectorAll('.gallery-item');
  const titleContainer = document.querySelector('.svg-container');
  const bgstroke = document.querySelector('.bgstroke');

  if (titleContainer) {
    // animatePathToCursor(bgstroke, 1000);  // 1000 ms delay increment between points
    applyMistAnimation(document.getElementById('image-container'));
  }
  

  if (items.length > 0) {
    // Generate a random index
    let randomIndex = Math.floor(Math.random() * items.length);

    // Call moveToCenter with the randomly selected item
    moveToCenter(items[randomIndex]);
    
    // Full screen the centered image
    for (let i = 0; i < items.length; i++) {
      items[i].addEventListener('click', function() {
        // check if the item is already centered
        if (this.classList.contains('centered')) {
          // create overlay
          const overlay = document.createElement('div');
          overlay.className = 'fullscreen-overlay';
          document.body.appendChild(overlay);
    
          // clone and append image to overlay
          const img = this.querySelector('img');
          if (img) {
            const clone = img.cloneNode(true);
            overlay.appendChild(clone);
    
            // add click event to hide overlay on image click
            clone.addEventListener('click', function() {
              overlay.style.display = 'none';
            });
          }
        } else {
          moveToCenter(this);
        }
      });
    }
    
  }

  window.addEventListener('resize', function() {
    if (document.querySelector('.centered')) {
      moveToCenter(document.querySelector('.centered')); // Re-center the currently centered item when window is resized
    }
  });
});

