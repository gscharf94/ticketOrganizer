let jobCheckInterval = "";
let map = L.map('map');

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);

/**
 * stops the jobCheckInterval (saved in a global variable)
 * when the conditions are met in {@link checkIfJobUpdateReady}
 */
function stopInterval() {
  clearInterval(jobCheckInterval);
  document.getElementById('loadingIcon')
    .style.display = "none";
  document.getElementById('buttonHeader')
    .style.display = "block";
  document.getElementById('refreshLink')
    .style.display = "block";
}

/**
 * sends a POST request to /updateJob/ which responds
 * with the last time a random ticket in that job was updated
 * this is then compared {@link compareTimes}
 * and if passes comparison, we stop the interval
 * with {@link stopInterval}
 *  */
function checkIfJobUpdateReady(jobId) {
  let req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState === 4) {
      if (compareTimes(req.response)) {
        stopInterval();
      }
    }
  }
  req.open("POST", `/updateJob/${jobId}/1`);
  req.send();
}

/**
 * this is what triggers when user clicks on the update button
 * it sends a request first telling the server to update that specific job
 * and then after it starts an interval of {@link checkIfJobUpdateReady}
 * and that keeps going until the job is updated
 */
function sendUpdateRequest(jobId) {
  // first we show the loading icon
  document.getElementById('loadingIcon')
    .style.display = "block";

  let updateRequest = new XMLHttpRequest();
  updateRequest.onreadystatechange = () => {
    if (updateRequest.readyState === 4) {
      jobCheckInterval = setInterval(checkIfJobUpdateReady, 5000, jobId);
    }
  }
  updateRequest.open("POST", `/updateJob/${jobId}/0`);
  updateRequest.send();
}

/**
 * gets the current time and subtracts it from
 * the time in the response from the server
 * if that is less than 25 seconds, the job is 
 * considered updated and returns true
 */
function compareTimes(timeString) {
  let time = new Date(JSON.parse(timeString));
  let currentTime = new Date();
  if (Math.abs(currentTime - time < 25000)) {
    return true;
  } else {
    return false;
  }
}


/**
 * takes in an object that is like a dictionary
 * {ticketId: { points: [{a: number, b: number, p: number}], ticket_status: boolean}
 * a & b are GPS coordinates, p is a place because it's a polygon/line that has various points
 * so this way the function draws the line in the correct order
 */
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

/**
 * draws a line, binds a popup to it with bindPopup()
 * and then uses map.fitBounds() to set the map location to the line/polygon
 * @todo create new map fitbound function that accounts for all points
 */
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

/**
 * creates the canvasses, gives them a size which is based on the average
 * of all row heights. these are placed in a container prelabeld in pug
 */
function createCanvases(ticketCounts) {
  let step = ticketCounts.replaceAll("&quot;", `"`);
  let count = JSON.parse(step);

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
    let container = document.getElementById(`canvasContainer${ticket}`);
    let canvas = document.createElement('canvas');

    canvas.setAttribute('width', container.clientWidth * .85);
    canvas.setAttribute('height', average * .3);
    canvas.setAttribute('id', `canvas${ticket}`);
    canvas.setAttribute('class', 'percentCanvas');
    canvas.style.backgroundColor = "red";

    canvasDict[ticket] = canvas;
  }

  // important to add the canvas AFTER, because once we add we change
  // the height of the row and the width of the column, and that creates
  // this weird effect where each canvas is bigger than the last

  for (const id in canvasDict) {
    let container = document.getElementById(`canvasContainer${id}`);
    container.appendChild(canvasDict[id]);

    let percent = count[id].clear / count[id].total;
    fillInCanvas(id, percent);
  }
}


/**
 * used with {@link createCanvases}
 * in order to fill in the progress bars horizontally
 * based on a percentage
 */
function fillInCanvas(id, percent) {
  let canvas = document.getElementById(`canvas${id}`);
  let canv = canvas.getContext("2d");

  let width = canvas.clientWidth;
  let height = canvas.clientHeight;

  canv.fillStyle = "green";
  canv.fillRect(0, 0, width * percent, height);
}