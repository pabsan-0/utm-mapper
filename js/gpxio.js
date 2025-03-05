function coordinatesDownload() {
    let gpxData = { "type": "FeatureCollection", "features": [] };

    readParseUtmCoordinates().forEach(coord => {
        gpxData.features.push({
            "type": "Feature",
            "geometry": { "type": "Point", "coordinates": [coord.lon, coord.lat] },
            "properties": { "name": `Point ${coord.idx}` }
        });
    });

    // Download gpx formatted file
    const gpx = togpx(gpxData);
    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "coordinates.gpx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

var gpx; // parser object
function handleGPXUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            gpx = new gpxParser();
            gpx.parse(e.target.result);

            let newText = `# Loaded GPX: ${file.name}\n`;
            gpx.waypoints.forEach(wpt => {
                const { zone, easting, northing } = latLngToUTM(wpt.lat, wpt.lon);
                newText += `${zone} ${easting} ${northing}\n`;
            });

            textArea.value += (textArea.value ? "\n" : "") + newText;
            localStorage.setItem("cachedText", textArea.value);

            // Reset file input to allow re-uploading the same file
            event.target.value = "";
        } catch (error) {
            console.error("Failed to process GPX file:", error);
            alert("An error occurred while processing the GPX file.");
        }
    };
    reader.readAsText(file);
}

// Hide the file input and trigger it via button
document.getElementById("gpxUploadButton").addEventListener("click", () => {
    document.getElementById("gpxFileInput").click();
});

document.getElementById("gpxFileInput").addEventListener("change", handleGPXUpload);
