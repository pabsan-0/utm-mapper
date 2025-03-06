const textArea = document.getElementById("coordinates");

textArea.value = localStorage.getItem("cachedText") || "";

textArea.addEventListener("input", () => {
    localStorage.setItem("cachedText", textArea.value);
});


console.log(textArea.value)
if (!textArea.value) {
    textArea.value = `\
# UTM WAYPOINT RENDERER AND GPX EXPORTER

# Enter your UTM coordinates here (Zone, Easting, Northing)
# Blank lines and lines starting with # will be ignored
# Adjust your coordinates format to one of the following styles 

29 631500 4691400
29 631200 4691975
29 631200 4692475

29T 627650E 4694200N
29T 626575E 4693325N
29T 629725E 4692300N

WP1: 29 T 630450 4692625
WP2: 29 T 628950 4692825
WP3: 29 T 628375 4692575




# Alternatively, advanced users may edit regex to fit their coordinates:
# - Focusing the regex text box below will highlight matches
# - Edit the regex placing Zone, Easting and Northing in capture groups
# - Optionally, use a fourth capture group for waypoint descriptions
`
}
