window.onload = function () {
  let tag = document.getElementById("result");

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
            tag.innerHTML = "CAPTCHA VERIFIED";
        }else if(data.prediction < 0.10){
            tag.innerHTML = "ACCESS DENIED";
        }else{
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
