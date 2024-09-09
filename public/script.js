window.onload = function () {
  let tag = document.getElementById("result");
  let btn = document.getElementById("btn-submit");
  function setColor() {
    if (btn.disabled == true) {
      btn.style.backgroundColor = "gray";
    } else {
      btn.style.backgroundColor = "#6a64f1";
    }
  }

  setColor();

  // Initialize variables
  let mouseSpeed = 0;
  let totalDistance = 0;
  let clickCount = 0;
  let timeBetweenClicksTotal = 0;
  let clickTimes = [];
  let totalScrollDepth = 0;
  let startTime = Date.now();
  let keyPressTimes = [];
  let formStartTime = null;
  let formFillTime = 0;
  let focusChanges = 0;
  let lastActivityTime = Date.now();
  let idleTimeTotal = 0;
  let mouseDeviation = 0;
  let lastMousePosition = null;

  let idleTimeout = null;
  let idleStartTime = null;

  // Mouse movement speed and path deviation
  const handleMouseMove = (e) => {
    const currentTime = Date.now();
    if (lastMousePosition) {
      const dx = e.clientX - lastMousePosition.x;
      const dy = e.clientY - lastMousePosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const timeElapsed = (currentTime - lastMousePosition.time) / 1000; // Convert to seconds

      // Calculate speed (pixels per second)
      if (timeElapsed > 0) {
        mouseSpeed =
          (mouseSpeed * totalDistance + distance / timeElapsed) /
          (totalDistance + distance);
      }

      // Calculate deviation from straight line (simplified as distance moved)
      mouseDeviation += distance;
      totalDistance += distance;
    }

    lastMousePosition = { x: e.clientX, y: e.clientY, time: currentTime };
  };

  // Click rate and time between clicks
  const handleClick = () => {
    const currentTime = Date.now();
    clickCount++;

    if (clickTimes.length > 0) {
      const timeBetweenClicks =
        (currentTime - clickTimes[clickTimes.length - 1]) / 1000; // Convert to seconds
      timeBetweenClicksTotal += timeBetweenClicks;
    }

    clickTimes.push(currentTime);
  };

  // Scroll depth
  const handleScroll = () => {
    totalScrollDepth += Math.abs(window.pageYOffset - totalScrollDepth);
  };

  // Time on page
  const updateTimeOnPage = () => {
    const timeOnPage = Math.floor((Date.now() - startTime) / 1000); // in seconds
    return timeOnPage;
  };

  // Key press speed
  const handleKeyPress = () => {
    const currentTime = Date.now();

    if (keyPressTimes.length > 0) {
      const timeBetweenKeyPresses =
        (currentTime - keyPressTimes[keyPressTimes.length - 1]) / 1000; // Convert to seconds
      keyPressTimes.push(timeBetweenKeyPresses);
    }

    keyPressTimes.push(currentTime);
  };

  // Track form fill time
  const handleFormFocus = () => {
    formStartTime = Date.now();
  };

  const handleFormBlur = () => {
    if (formStartTime) {
      formFillTime += Math.floor((Date.now() - formStartTime) / 1000); // in seconds
    }
  };

  // Window focus changes
  const handleWindowFocus = () => {
    focusChanges += 1;
  };

  // Idle time tracking
  const resetIdleTime = () => {
    clearTimeout(idleTimeout);
    if (idleStartTime) {
      idleTimeTotal += (Date.now() - idleStartTime) / 1000; // in seconds
    }
    lastActivityTime = Date.now();
    idleStartTime = null;

    idleTimeout = setTimeout(() => {
      idleStartTime = Date.now();
    }, 3000); // 3 seconds of inactivity
  };

  // Add event listeners

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("click", handleClick);
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("keypress", handleKeyPress);
  window.addEventListener("focus", handleWindowFocus);
  window.addEventListener("blur", handleWindowFocus);
  window.addEventListener("focus", resetIdleTime);
  window.addEventListener("mousemove", resetIdleTime);
  window.addEventListener("click", resetIdleTime);
  window.addEventListener("scroll", resetIdleTime);
  window.addEventListener("keypress", resetIdleTime);

  // Form focus listeners
  const formElement = document.querySelector("form");
  if (formElement) {
    formElement.addEventListener("focus", handleFormFocus, true);
    formElement.addEventListener("blur", handleFormBlur, true);
  }

  // Periodically print the data to console in JSON format
  setTimeout(() => {
    const timeOnPage = updateTimeOnPage();
    const averageClickRate = (clickCount / timeOnPage) * 60; // Clicks per minute
    const averageTimeBetweenClicks =
      clickCount > 1 ? timeBetweenClicksTotal / (clickCount - 1) : 0;
    const averageKeyPressSpeed =
      keyPressTimes.length > 1
        ? keyPressTimes.reduce((a, b) => a + b, 0) / (keyPressTimes.length - 1)
        : 0;

    const behaviorData = {
      mouseSpeed: mouseSpeed.toFixed(2), // pixels per second
      clickRate: averageClickRate.toFixed(2), // clicks per minute
      timeBetweenClicks: averageTimeBetweenClicks.toFixed(2), // seconds
      scrollDepth: totalScrollDepth.toFixed(2), // pixels
      timeOnPage: timeOnPage, // seconds
      mousePathDeviation: mouseDeviation.toFixed(2), // pixels
      keyPressSpeed: averageKeyPressSpeed.toFixed(2), // seconds
      formFillTime: formFillTime, // seconds
      focusChanges: focusChanges, // count
      idleTime: idleTimeTotal.toFixed(2), // seconds
    };

    console.log(JSON.stringify(behaviorData, null, 2));

    // Send AJAX request to the backend to verify user interactions
    fetch("/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(behaviorData, null, 2),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.prediction);
        if (data.prediction > 0.95) {
          tag.innerHTML = `<div
              class="alert alert-success d-flex align-items-center"
              role="alert"
              style="width:30rem;"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="d-none">
            <symbol id="check-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </symbol>
            </svg>
              <svg
                class="bi flex-shrink-0 me-2"
                style="height:20px; width:80px;"
                role="img"
                aria-label="Success:"
              >
                <use xlink:href="#check-circle-fill" />
              </svg>
              <div> Captcha Verified Successfully</div>
            </div>`;

          btn.disabled = false;
          setColor();
        } else if (data.prediction < 0.1) {
          tag.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="d-none">
  <symbol id="exclamation-triangle-fill" viewBox="0 0 16 16">
    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </symbol>
</svg>
<div class="alert alert-danger d-flex align-items-center" role="alert"
style="width:30rem;">
  <svg class="bi flex-shrink-0 me-2" role="img" aria-label="Danger:"
  style="height:20px; width:80px;"
  ><use xlink:href="#exclamation-triangle-fill"/></svg>
  <div>
    Not Verified
  </div>
</div>
`;
          setColor();
        } else {
          tag.innerHTML = "UNCERTAIN BEHAVIOUR";
        }
      })
      .catch((error) => console.error("Error:", error));
  }, 5000); // Print every 5 seconds

  setTimeout(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("click", handleClick);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("keypress", handleKeyPress);
    window.removeEventListener("focus", handleWindowFocus);
    window.removeEventListener("blur", handleWindowFocus);
    window.removeEventListener("mousemove", resetIdleTime);
    window.removeEventListener("click", resetIdleTime);
    window.removeEventListener("scroll", resetIdleTime);
    window.removeEventListener("keypress", resetIdleTime);
  }, 6000); // 7 seconds
};
