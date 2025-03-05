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


// Set default view and join map and created elements
map.setView([40, -3], 5);
layer.addTo(map);
markers.addTo(map);

// Map events linked to update function, plus call
map.on('mousemove', updateMapInfo);
map.on('moveend', updateMapInfo);
map.on('zoomend', updateMapInfo);
updateMapInfo();
