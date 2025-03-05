// geoutils.js
function utmToLatLng(zone, easting, northing) {
    proj4.defs(`EPSG:326${zone}`, `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`);
    return proj4(`EPSG:326${zone}`, "EPSG:4326", [easting, northing]);
}

function latLngToUTM(lat, lon) {
    let zone = Math.floor((lon + 180) / 6) + 1;
    proj4.defs(`EPSG:326${zone}`, `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`);
    const [easting, northing] = proj4("EPSG:4326", `EPSG:326${zone}`, [lon, lat]);
    return { zone, easting: easting.toFixed(2), northing: northing.toFixed(2) };
}


// utm-coordinates.js
function parseUtmCoordinates(lines) {
    const coordinates = [];

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);

        const [zone, easting, northing] = parts.map(Number);
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



// map.js

const map = L.map('map', {
    maxZoom: 17, // IGN wont load for higher zoom
})

const layer = L.tileLayer('https://tms-mapa-raster.ign.es/1.0.0/mapa-raster/{z}/{x}/{-y}.jpeg', {
    attribution: '© Instituto Geográfico Nacional de España',
    tms: true
})

const markers = L.featureGroup()


function coordinatesDraw() {
    markers.clearLayers();

    readParseUtmCoordinates().forEach(coord => {
        const marker = L.marker([coord.lat, coord.lon])

        marker.addTo(markers)
        marker.bindPopup(`${coord.utmZone} ${coord.utmEasting} ${coord.utmNorthing}`)
        marker.bindTooltip(`${coord.idx}`).openTooltip();
    });

    if (markers.getLayers().length > 0) {
        map.fitBounds(markers.getBounds());
    }
}


function updateMapInfo(e) {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const utm = latLngToUTM(center.lat, center.lng);
    let mouseUTM = "-";
    if (e) {
        const mouse = latLngToUTM(e.latlng.lat, e.latlng.lng);
        mouseUTM = `${mouse.zone} ${Math.round(mouse.easting)} ${Math.round(mouse.northing)}`;
    }

    // centerUTM = `| Center: ${utm.zone} ${utm.easting} ${utm.northing}`;
    document.getElementById("info").innerText = `Mouse: ${mouseUTM}  | Zoom: ${zoom} | Datum: ETRS89`;
}


map.setView([40, -3], 5);
layer.addTo(map);
markers.addTo(map);

map.on('mousemove', updateMapInfo);
map.on('moveend', updateMapInfo);
map.on('zoomend', updateMapInfo);
updateMapInfo();



// buttons.js
function btnPlotOnMap() {
    return coordinatesDraw();
}

function btnGenerateGPX() {
    return coordinatesDownload;
}


// cache.js
const textArea = document.getElementById("coordinates");

textArea.value = localStorage.getItem("cachedText") || "";

textArea.addEventListener("input", () => {
    localStorage.setItem("cachedText", textArea.value);
});



// gpx_io.js

function coordinatesDownload() {
    let gpxData = { "type": "FeatureCollection", "features": [] };

    readParseUtmCoordinates().forEach(coord => {
        gpxData.features.push({
            "type": "Feature",
            "geometry": { "type": "Point", "coordinates": [coord.lon, coord.lat] },
            "properties": { "name": `Point ${coord.idx}` }
        coord.idx
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
