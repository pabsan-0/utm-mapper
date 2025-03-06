// Create map object
const map = L.map('map', {
    maxZoom: 17, // IGN wont load for higher zoom
})

// Create tiled layer from IGN's WMS 
const layer = L.tileLayer('https://tms-mapa-raster.ign.es/1.0.0/mapa-raster/{z}/{x}/{-y}.jpeg', {
    attribution: '© Instituto Geográfico Nacional de España',
    tms: true
})

// Create a feature layer to store markers
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

const zoomLevelDisplay = document.querySelector("#info-top .right")
const cursorCoordsDisplay = document.querySelector("#info-top .left")
const centerCoordsDisplay = document.querySelector("#info-bot .left")

function updateMapInfo(e) {
    const zoom = map.getZoom();

    const center = map.getCenter();
    const utm = latLngToUTM(center.lat, center.lng);
    centerUTM = `${utm.zone} ${utm.easting} ${utm.northing}`;

    let cursorUTM = "-";
    if (e) {
        const mouse = latLngToUTM(e.latlng.lat, e.latlng.lng);
        cursorUTM = `${mouse.zone} ${Math.round(mouse.easting)} ${Math.round(mouse.northing)}`;
    }

    zoomLevelDisplay.innerText = `Zoom level: ${zoom}`
    cursorCoordsDisplay.innerText = `Cursor: ${cursorUTM}`
    centerCoordsDisplay.innerText = `Center: ${centerUTM}`
}


// Set default view and join map and created elements
map.setView([40, -3], 5);
layer.addTo(map);
markers.addTo(map);

// External lib cursor
L.control.mapCenterCoord().addTo(map);

// Map events linked to update function, plus call
map.on('mousemove', updateMapInfo);
map.on('moveend', updateMapInfo);
map.on('zoomend', updateMapInfo);
updateMapInfo();
