const regexInput = document.getElementById("regexInput");
const coordinatesTextArea = document.getElementById("coordinates");
const regexOverlay = document.getElementById("regex-overlay");

let coordinateParsingRegex = "([0-9]+[A-Z]?)\\s+([0-9]+)\\s+([0-9]+)"
regexInput.value = coordinateParsingRegex

function parseUtmCoordinates(lines) {
    const coordinates = [];
    console.log(coordinateParsingRegex)

    // Regex: /([0-9]+[A-Z]?)\s+([0-9]+)\s+([0-9]+)\s*:\s*(.*)$/
    lines.forEach(line => {

        const match = line.trim().match(coordinateParsingRegex);
        if (!match) {
            throw new Error("Poorly defined regex, could not parse.");
        }

        const [_, zone, easting, northing] = match.map(Number); // Convert to numbers
        const [lon, lat] = utmToLatLng(zone, easting, northing);

        const coord = {
            utmZone: zone, 
            utmEasting: easting, 
            utmNorthing: northing,
            lon: lon,
            lat: lat,
            idx: coordinates.length,
        };

        coordinates.push(coord)
    })
        
    return coordinates;
}

function readParseUtmCoordinates() {
    const lines = document.getElementById("coordinates").value.trim().split("\n");
    const coordinates = parseUtmCoordinates(lines)

    return coordinates;
}


// Function to highlight the regex matches
function highlightRegexMatches(regexText) {

    // Original text and regex-parsing utils
    const text = coordinatesTextArea.value;
    let match;
    let htmlContent = '';
    let lastIndex = 0;

    // Prevent empty or pseudo empty regex from lagging browser
    const regexTextSanitized = regexText.replace("()", "");

    if (regexTextSanitized) {
        // Regex errors will be frequent due to checking as-you-type
        try {
            const regex = new RegExp(regexTextSanitized, 'g');

            while ((match = regex.exec(text)) !== null) {
                // Add text before the match
                htmlContent += text.slice(lastIndex, match.index);

                // Highlight the full match once (entire match)
                htmlContent += `<span class="highlight">`;

                // Now we need to break the full match down into the original text + capture groups
                let matchWithGroups = match[0]; // Start with the full match

                // Loop through the capture groups and add them to the match
                for (let i = 1; i < match.length; i++) {
                    const captureGroup = match[i] || '';  // Safeguard for empty capture groups
                    matchWithGroups = matchWithGroups.replace(captureGroup, `<span class="capture-group">${captureGroup}</span>`);
                }

                // Add the processed match with highlighted groups inside the full match span
                htmlContent += matchWithGroups;

                htmlContent += `</span>`; // End the highlight span
                lastIndex = regex.lastIndex; // Update the index for the next match
            }

        } catch (e) {
            console.debug("REGEX ERROR:\n", e)
        }
    }

    // Add any remaining text after the last match
    htmlContent += text.slice(lastIndex);
    return htmlContent;
}

// When regex input changes
regexInput.addEventListener("input", function () {
    const regexText = regexInput.value.trim();

    // If there's no regex input, hide the overlay
    if (!regexText) {
        regexOverlay.innerHTML = ''; // Clear the overlay
        coordinatesTextArea.style.color = ""; // Reset text color
        return;
    }

    // Otherwise, show the overlay with the highlighted matches
    const highlightedText = highlightRegexMatches(regexText);
    regexOverlay.innerHTML = highlightedText;

    // Make the text in the textarea transparent so the overlay is visible
    coordinatesTextArea.style.color = "transparent";
});

// When the regex input is focused, display the overlay with the original text
regexInput.addEventListener("focus", function () {
    // Copy the current content of the text area to the overlay, without highlighting
    const originalText = coordinatesTextArea.value.replace(/\n/g, '<br>'); // Preserve newlines
    regexOverlay.innerHTML = originalText;

    // Dynamically read the text properties from the textarea and apply them to the overlay
    const computedStyles = window.getComputedStyle(coordinatesTextArea);

    regexOverlay.style.fontFamily = computedStyles.fontFamily;
    regexOverlay.style.fontSize = computedStyles.fontSize;
    regexOverlay.style.lineHeight = computedStyles.lineHeight;
    regexOverlay.style.padding = computedStyles.padding;
    regexOverlay.style.border = computedStyles.border;

    // Ensure the overlay is positioned correctly over the textarea
    const rect = coordinatesTextArea.getBoundingClientRect();
    regexOverlay.style.top = `${rect.top}px`;
    regexOverlay.style.left = `${rect.left}px`;
    regexOverlay.style.width = `${rect.width}px`;
    regexOverlay.style.height = `${rect.height}px`;
});

// When the regex input loses focus, hide the overlay and reset the text color
regexInput.addEventListener("blur", function () {
    regexOverlay.innerHTML = ''; // Hide the overlay completely
    coordinatesTextArea.style.color = ""; // Reset the text color

    coordinateParsingRegex = regexInput.value
});

