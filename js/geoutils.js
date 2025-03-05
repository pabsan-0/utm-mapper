function utmToLatLng(zone, easting, northing) {
    proj4.defs(`EPSG:326${zone}`, `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`);
    return proj4(`EPSG:326${zone}`, "EPSG:4326", [easting, northing]);
}

function latLngToUTM(lat, lon) {
    let zone = Math.floor((lon + 180) / 6) + 1;
    proj4.defs(`EPSG:326${zone}`, `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`);
    const [easting, northing] = proj4("EPSG:4326", `EPSG:326${zone}`, [lon, lat]);
    return { zone, easting: easting.toFixed(0), northing: northing.toFixed(0) };
}
