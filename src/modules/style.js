// style.js
// This module exports the style sheet and blur effect functions

import { emitEvent, listenToEvent } from "./helpers.js";
import { settings, shouldDetect, isBlurryStartMode } from "./settings.js";

const BLURRY_START_MODE_TIMEOUT = 7000; // TODO: make this a setting maybe?
let hbStyleSheet, blurryStartStyleSheet;

const initStylesheets = () => {
	// console.log("HB==INIT STYLESHEETS")
	hbStyleSheet = document.createElement("style");
	hbStyleSheet.id = "hb-stylesheet";
	document.head.appendChild(hbStyleSheet);
	initBlurryMode();
};

const initBlurryMode = () => {
	if (!shouldDetect() || !isBlurryStartMode()) return;
	blurryStartStyleSheet = document.createElement("style");
	blurryStartStyleSheet.id = "hb-blurry-start-stylesheet";
	blurryStartStyleSheet.innerHTML = `
	  img, video{
		filter: blur(${settings.blurAmount}px) grayscale(100%) !important;
		transition: filter 0.1s ease !important;
		opacity: unset !important;
	  }

	  img:hover, video:hover{
		filter: blur(0px) grayscale(0%) !important;
		transition: filter 0.5s ease !important;
		transition-delay: 0.5s !important;
	  }
	`;

	document.head.appendChild(blurryStartStyleSheet);

	// issue event turn off blurry start mode after 1 second
	setTimeout(() => {
		if (!blurryStartStyleSheet?.innerHTML) return; // if blurryStartStyleSheet wasn't instantiated/was removed, return
		emitEvent("blurryStartModeTimeout", "timeout");
	}, BLURRY_START_MODE_TIMEOUT);
};

const setStyle = () => {
	// console.log("HB==SET STYLE")
	if (!hbStyleSheet) {
		initStylesheets();
	}
	if (!shouldDetect()) {
		hbStyleSheet.innerHTML = "";
		return;
	}
	const shouldBlurImages = settings.blurImages;
	const shouldBlurVideos = settings.blurVideos;
	const shouldUnblurImagesOnHover = settings.unblurImages;
	const shouldUnblurVideosOnHover = settings.unblurVideos;

	let blurSelectors = [];
	if (shouldBlurImages) blurSelectors.push("img" + ".hb-blur");
	if (shouldBlurVideos) blurSelectors.push("video" + ".hb-blur");
	blurSelectors = blurSelectors.join(", ");

	let unblurSelectors = [];
	if (shouldUnblurImagesOnHover)
		unblurSelectors.push("img" + ".hb-blur:hover");
	if (shouldUnblurVideosOnHover)
		unblurSelectors.push("video" + ".hb-blur:hover");
	unblurSelectors = unblurSelectors.join(", ");
	hbStyleSheet.innerHTML = `
    ${blurSelectors} {
      filter: blur(${settings.blurAmount}px) grayscale(100%) !important;
      transition: filter 0.1s ease !important;
      opacity: unset !important;
    }
	
${unblurSelectors} {
      filter: blur(0px) grayscale(0%) !important;
      transition: filter 0.5s ease !important;
      transition-delay: 1s !important;
    }

	.hb-blur-temp { 
		animation: hb-blur-temp ${BLURRY_START_MODE_TIMEOUT}ms ease-in-out forwards !important;
	}

	@keyframes hb-blur-temp {
		0% { filter: blur(${settings.blurAmount}px) grayscale(100%); }
		95% { filter: blur(${settings.blurAmount}px) grayscale(100%); }
		100% { filter: blur(0px) grayscale(0%); }
	}
  `;
};

const turnOffBlurryStart = (e) => {
	if (!blurryStartStyleSheet?.innerHTML) return; // if blurryStartStyleSheet wasn't instantiated/was removed, return
	blurryStartStyleSheet.innerHTML = "";
};

const applyBlurryStart = (node) => {
	if (!isBlurryStartMode()) return;
	node.classList.add("hb-blur-temp");
};

const attachStyleListener = () => {
	listenToEvent("settingsLoaded", initStylesheets);
	listenToEvent("toggleOnOffStatus", setStyle);
	listenToEvent("changeBlurAmount", setStyle);
	listenToEvent("observationStarted", turnOffBlurryStart);
	listenToEvent("detectionStarted", turnOffBlurryStart);
	listenToEvent("blurryStartModeTimeout", turnOffBlurryStart);
};

export { attachStyleListener, applyBlurryStart };
