let map = L.map('map');

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);

function sendUpdateRequest(jobId) {
  let updateRequest = new XMLHttpRequest();
  updateRequest.open("POST", `/updateJob/${jobId}`);
  updateRequest.send();
}

function drawPolylines(polylines) {
  // weird result of express & stringify.. need to remove
  // the &quot; because JSON.parse() can't read it
  let step = polylines.replaceAll("&quot;", `"`);
  polylines = JSON.parse(step);

  for (const ticket in polylines) {
    let points = polylines[ticket].points;
    if (polylines[ticket].ticket_status) {
      var color = "green"
    } else {
      var color = "red"
    }
    drawPolyline(points, color, polylines[ticket].ticket_number, polylines[ticket].ticket_status);
  }
}

function drawPolyline(points, color, ticketNumber, ticketStatus) {
  let arr = [];
  for (const point of points) {
    let row = [point.b, point.a];
    arr.push(row);
  }


  let polygon = L.polyline(arr, { "color": color, "weight": 6, "fill": true }).addTo(map);
  if (ticketStatus) {
    ticketStatus = "Clear";
  } else {
    ticketStatus = "Pending";
  }
  polygon.bindPopup(`Ticket: ${ticketNumber} Status: ${ticketStatus}`)
  map.fitBounds(polygon.getBounds());
}

function createCanvases(ticketCounts) {
  let step = ticketCounts.replaceAll("&quot;", `"`);
  let count = JSON.parse(step);

  console.log(count);

  let canvasDict = {};

  let average = 0;
  let c = 0;
  for (const ticket in count) {
    let container = document.getElementById(`canvasContainer${ticket}`);
    let height = container.clientHeight;
    average += height;
    c++;
  }

  average = average / c;

  for (const ticket in count) {
    console.log(`canvasContainer${ticket}`);
    let container = document.getElementById(`canvasContainer${ticket}`);
    let canvas = document.createElement('canvas');

    canvas.setAttribute('width', container.clientWidth * .85);
    canvas.setAttribute('height', average * .3);
    canvas.setAttribute('id', `canvas${ticket}`);
    canvas.setAttribute('class', 'percentCanvas');
    canvas.style.backgroundColor = "red";
    // canvas.style.float = "right";

    canvasDict[ticket] = canvas;
  }

  for (const id in canvasDict) {
    let container = document.getElementById(`canvasContainer${id}`);
    container.appendChild(canvasDict[id]);

    let percent = count[id].clear / count[id].total;
    fillInCanvas(id, percent);
  }
}

function fillInCanvas(id, percent) {
  console.log(`id ${id} - percent ${percent}`);

  let canvas = document.getElementById(`canvas${id}`);
  let canv = canvas.getContext("2d");

  let width = canvas.clientWidth;
  let height = canvas.clientHeight;

  canv.fillStyle = "green";
  canv.fillRect(0, 0, width * percent, height);
}


var polygon = L.polyline([
  [28.4166552, -81.4176226],
  [28.4169289, -81.417746],
]).addTo(map);

map.fitBounds(polygon.getBounds());