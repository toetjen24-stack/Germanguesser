// ================= ORTE =================
const easyLocations = [
 { name: "Bremer Wheinachtsmarkt (Bremen)", lat: 53.0754, lon: 8.8075, heading: 180 },
 { name: "Brandenburger Tor (Berlin)",     lat: 52.5163,   lon: 13.3777, heading: 180 },
 { name: "Maximilianstraße (München)",    lat: 48.1393,   lon: 11.5793, heading: 180 },
 { name: "Reichstag (Berlin)", lat: 52.5186, lon: 13.3762, heading: 180 },
 { name: "Frauenkirche (München, Bayern)", lat: 48.1386, lon: 11.5730, heading: 180 },
 { name: "Kölner Dom (Köln)", lat: 50.9423,   lon: 6.9581 },
 { name: "Gendarmenmarkt, Berlin", lat: 52.5138, lon: 13.3923, heading: 180 },
 { name: "Potsdamer Platz, Berlin", lat: 52.5096, lon: 13.3759, heading: 180 },
 { name: "Alexanderplatz, Berlin", lat: 52.5219, lon: 13.4132, heading: 180 },
 { name: "Olympiastadion, Berlin", lat: 52.5145, lon: 13.2399, heading: 90 },
 { name: "Signal Iduna Park, Dortmund", lat: 51.4926, lon: 7.4510, heading: 90 },
 {name:"Marienplatz München",lat:48.1372,lon:11.5761,heading:0},
 {name:"Hamburger Rathaus",lat:53.5503,lon:9.9920,heading:120},
 { name: "Allianz Arena, München", lat: 48.2188, lon: 11.6247, heading: 90 },
 {name:"Bremen Domsheide",lat:53.0740,lon:8.8072,heading:100},
 { name: "Berliner Dom, Berlin", lat: 52.5194, lon: 13.4010, heading: 180 },
];

const hardLocations = [
 { name: "Gendarmenmarkt, Berlin", lat: 52.5138, lon: 13.3923, heading: 180 },
 { name: "Bremer Wheinachtsmarkt (Bremen)", lat: 53.0754, lon: 8.8075, heading: 180 },
 { name: "Schloss Charlottenburg (Berlin)", lat: 52.5206, lon: 13.2956, heading: 180 },
 { name: "Berliner Philharmonie (Berlin)", lat: 52.5141, lon: 13.3694, heading: 180 },
 { name: "Schloss Neuschwanstein (Schwangau, Bayern)", lat: 47.5576, lon: 10.7498, heading: 180 },
 { name: "Schloss Heidelberg (Heidelberg, Baden-Württemberg)", lat: 49.4106, lon: 8.7150, heading: 180 },
 { name: "Schloss Schwerin (Mecklenburg-Vorpommern)", lat: 53.6296, lon: 11.4142, heading: 180 },
 { name: "Zugspitze (Gipfel)",                lat: 47.4212,   lon: 10.9863 },
 { name: "Nürburgring",                       lat: 50.3350,   lon: 6.9470 },
 { name: "Schloss Bellevue (Berlin)",         lat: 52.5185,   lon: 13.3501 },
 { name: "Schloss Nymphenburg (München)",     lat: 48.1590,   lon: 11.5030 },
 { name: "Hockenheimring",                    lat: 49.3270,   lon: 8.5650 },
 { name: "Hamburger Hafen",                   lat: 53.5411,   lon: 9.9840 },
 { name: "Brocken (Harz Gipfel)",             lat: 51.7990,   lon: 10.6160 },
 { name: "Münchener Hauptbahnhof",            lat: 48.1402,   lon: 11.5581 },
 { name: "Rotes Rathaus (Berlin)", lat: 52.5186, lon: 13.4130, heading: 180 }
];
    
// ================= VARIABLEN =================
let difficulty = null;
let locations = [];
let score = 0;
let round = 1;
let currentPlace;
let map, userMarker = null;
let time = 45, timer;
let line, correctMarker = null;
let panorama; // Street View

const redCrossIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828665.png', 
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const blackMarkerIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// ================= SCHWIERIGKEIT =================
document.getElementById("easy-btn").onclick = () => selectDifficulty("easy");
document.getElementById("hard-btn").onclick = () => selectDifficulty("hard");

function selectDifficulty(diff){
    difficulty = diff;
    document.getElementById("easy-btn").classList.remove("selected");
    document.getElementById("hard-btn").classList.remove("selected");

    if(diff === "easy") document.getElementById("easy-btn").classList.add("selected");
    else document.getElementById("hard-btn").classList.add("selected");
}

// ================= START =================
document.getElementById("start-btn").onclick = () => {
    if(!difficulty){
        alert("Bitte wähle zuerst Leicht oder Schwer!");
        return;
    }

    const bgMusic = document.getElementById("bg-music");
    bgMusic.volume = 0.3;
    bgMusic.play();

    locations = difficulty === "easy"
        ? [...easyLocations]
        : [...hardLocations];

    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

    const modeIndicator = document.getElementById("mode-indicator");
    if(difficulty === "easy"){
        modeIndicator.innerText = "Modus: Leicht";
        modeIndicator.className = "mode-easy";
    } else {
        modeIndicator.innerText = "Modus: Schwer";
        modeIndicator.className = "mode-hard";
    }

    initMap();
    startRound();
};

// ================= MAP =================
function initMap(){
    map = L.map("map",{zoomControl:false}).setView([51,10],6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    map.on("click",e=>{
        if(userMarker) map.removeLayer(userMarker);
        userMarker = L.marker(e.latlng).addTo(map);
    });
}

// ================= RUNDE =================
function startRound(){
    clearInterval(timer);
    time = 30;
    updateUI();

    if(userMarker){ map.removeLayer(userMarker); userMarker=null;}
    if(correctMarker){ map.removeLayer(correctMarker); correctMarker=null;}
    if(line){ map.removeLayer(line); line=null;}

    map.setView([51, 10], 6); 

    currentPlace = locations.splice(Math.floor(Math.random()*locations.length),1)[0];

    // Interaktives Street View
    if(panorama){
        panorama.setPosition({lat: currentPlace.lat, lng: currentPlace.lon});
        panorama.setPov({heading: currentPlace.heading, pitch: 0});
    } else {
        panorama = new google.maps.StreetViewPanorama(
            document.getElementById("streetview"), {
                position: {lat: currentPlace.lat, lng: currentPlace.lon},
                pov: {heading: currentPlace.heading, pitch: 0},
                visible: true,
                disableDefaultUI: true,
                motionTracking: false,
                linksControl: true,
            }
        );
    }

    timer = setInterval(()=>{
        time--;
        document.getElementById("timer").innerText = `Zeit: ${time}`;
        if(time <= 0){
            clearInterval(timer);
            showResult(0, null, true);
        }
    },1000);
}

// ================= GUESS =================
document.getElementById("guess-btn").onclick = () => {
    if(!userMarker) return alert("Bitte wähle einen Ort!");

    clearInterval(timer);

    const d = distance(
        userMarker.getLatLng().lat,
        userMarker.getLatLng().lng,
        currentPlace.lat,
        currentPlace.lon
    );

    const pts = Math.max(0, Math.round(5000*(1-d/200)));
    score += pts;

    if(line) map.removeLayer(line);
    if(correctMarker) map.removeLayer(correctMarker);

    correctMarker = L.marker([currentPlace.lat, currentPlace.lon], {icon: blackMarkerIcon}).addTo(map);
    userMarker.setIcon(redCrossIcon);

    line = L.polyline([userMarker.getLatLng(), [currentPlace.lat, currentPlace.lon]], {color: 'blue'}).addTo(map);

    showResult(pts, Math.round(d), false);
};

// ================= ERGEBNIS =================
function showResult(points, dist, timeUp = false) {
    const popupSound = document.getElementById("popup-sound");
    popupSound.volume = 0.5;
    popupSound.play();

    let text = "";
    text += `<span style="color:#2196f3;font-weight:bold;">Gesuchter Ort:</span><br>`;
    text += `<b>${currentPlace.name}</b><br><br>`;

    if(timeUp) {
        text += `<span style="color:#4caf50;">Punkte:</span> <b>0</b><br>`;
        text += `<span style="color:#f44336;font-weight:bold;">Zeit abgelaufen!</span>`;
    } else {
        text += `<span style="color:#f44336;">Entfernung:</span> <b>${dist} km</b><br>`;
        text += `<span style="color:#4caf50;">Punkte:</span> <b>+${points}</b>`;
    }

    document.getElementById("popup-text").innerHTML = text;
    document.getElementById("points").innerText = `Punkte: ${score}`;
    document.getElementById("result-popup").style.display = "flex";
}

// ================= WEITER =================
document.getElementById("popup-close").onclick = () => {
    // Popup ausblenden
    document.getElementById("result-popup").style.display = "none";

    round++;
    if (round > 15) {
        // Spiel beendet → Endseite anzeigen
        document.getElementById("game-screen").style.display = "none";

        // Sicherstellen, dass Endscreen sichtbar ist
        const endScreen = document.getElementById("end-screen");
        endScreen.style.display = "flex";  // Flex = gleiche wie Startscreen
        endScreen.style.flexDirection = "column"; 
        endScreen.style.alignItems = "center"; 
        endScreen.style.justifyContent = "center";

        // Punkte auf Endscreen aktualisieren
        document.getElementById("end-text").innerText = `Du hast alle 15 Runden abgeschlossen. Punkte: ${score}`;

        return; // keine neue Runde starten
    }

    // Neue Runde starten
    startRound();
};

// Zurück zur Startseite + Musik stoppen
document.getElementById("restart-btn").onclick = () => {
    document.getElementById("end-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "block";
    score = 0;
    round = 1;
    document.getElementById("points").innerText = `Punkte: ${score}`;

};

// ================= DISTANZ =================
function distance(lat1, lon1, lat2, lon2){
    const R = 6371;
    const dLat = (lat2-lat1)*Math.PI/180;
    const dLon = (lon2-lon1)*Math.PI/180;
    const a =
        Math.sin(dLat/2)**2 +
        Math.cos(lat1*Math.PI/180) *
        Math.cos(lat2*Math.PI/180) *
        Math.sin(dLon/2)**2;
    return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function updateUI(){
    document.getElementById("rounds").innerText = `Runde: ${round}/15`;
    document.getElementById("points").innerText = `Punkte: ${score}`;
}

// ================= BUTTON SOUND FÜR ALLE BUTTONS =================
const clickSound = document.getElementById("popup-sound");
document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
        clickSound.currentTime = 0;
        clickSound.volume = 0.5;
        clickSound.play();
    });
});
