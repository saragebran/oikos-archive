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

// Do when DOM has loaded
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
