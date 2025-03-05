function parseUtmCoordinates(lines) {
    const coordinates = [];

    // Regex: /([0-9]+[A-Z]?)\s+([0-9]+)\s+([0-9]+)\s*:\s*(.*)$/
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
