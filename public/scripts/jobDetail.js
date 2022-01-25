// so many global variables... 😅
let locateLayerGroup = "";
let boreLayerGroup = "";
let vaultLayerGroup = "";
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

function hideBoresAndVaults() {
  removeLayerGroup(2);
  removeLayerGroup(3);
}

function setCheckboxOnclicks() {
  let locates = document.getElementById("checkLocates");
  let bores = document.getElementById("checkBores");
  let vaults = document.getElementById("checkVaults");


  locates.addEventListener('change', (event) => {
    if (event.target.checked) {
      addLayerGroup(1);
    } else {
      removeLayerGroup(1);
    }
  });

  bores.addEventListener('change', (event) => {
    if (event.target.checked) {
      addLayerGroup(2);
    } else {
      removeLayerGroup(2);
    }
  });
}

/**
 * @param {int} type - which of the three layer groups to delete
 * 1 = locateLayerGroup
 * 2 = boreLayerGroup
 * 3 = vaultLayerGroup
 * first check if layerGroup = ""
 */
function removeLayerGroup(type) {
  let group = "";
  switch (type) {
    case 1:
      group = locateLayerGroup;
      break;
    case 2:
      group = boreLayerGroup;
      break;
    case 3:
      group = vaultLayerGroup;
      break;
  }

  for (const layer in group._layers) {
    group._layers[layer].removeFrom(map);
  }
}

/**
 * opposite of {@link removeLayerGroup}
 * works the same way. this way it can be toggled on and off
 */
function addLayerGroup(type) {
  // i think this is a nicer way to do it than the switch statement.. 
  let groups = [locateLayerGroup, boreLayerGroup, vaultLayerGroup];
  let group = groups[type - 1];

  for (const layer in group._layers) {
    group._layers[layer].addTo(map);
  }
}

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
 * takes in the same input as {@link drawPolyLines}
 * and fits the map after everything has been drawn
 * so all the job shows up correctly
 * 
 */
function fitMap(polylines) {
  let pointsArr = [];
  for (const ticket in polylines) {
    let points = polylines[ticket].points;
    for (const point of points) {
      pointsArr.push([point.b, point.a]);
    }
  }
  map.fitBounds(pointsArr)
}

/**
 * formats date string into date object
 * returned as string expressed MM/DD/YYYY
 */
function formatDate(date) {
  date = new Date(date);
  let day = String(date.getDate()).padStart(2, "0");
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

/**
 * takes in an object that is like a dictionary
 * {ticketId: { points: [{a: number, b: number, p: number}], ticket_status: boolean}
 * a & b are GPS coordinates, p is a place because it's a polygon/line that has various points
 * a = lat b = lng
 * a+ -> north a- -> south
 * b+ -> east b- -> west
 * so this way the function draws the line in the correct order
 * 
 * @param {int} type - 3 types.. vault / bore / locates 
 * depending which it is, depends which variable we save the layer
 * group to
 * 1 = locate
 * 2 = bore
 * 3 = vault
 */
function drawPolylines(polylines, type, colorDictionary) {
  // weird result of express & stringify.. need to remove
  // the &quot; because JSON.parse() can't read it
  let step = polylines.replaceAll("&quot;", `"`);
  polylines = JSON.parse(step);
  if (colorDictionary) {
    step = colorDictionary.replaceAll("&quot;", `"`);
    colorDictionary = JSON.parse(step);
  }

  let group = L.layerGroup();

  for (const ticket in polylines) {
    let points = polylines[ticket].points;
    // default color we change for each separate thing
    let color = "blue"
    // switch cases are weird
    let popupText = ""

    switch (type) {
      case 1:
        if (polylines[ticket].ticket_status) {
          color = "green";
        } else {
          color = "red";
        }
        popupText = `Ticket: ${polylines[ticket].ticket_number} Clear? ${polylines[ticket].ticket_status}`;
        break;
      case 2:
        color = colorDictionary[polylines[ticket].crewName]
        // @todo add some formatting to the date string
        popupText = `Crew: ${polylines[ticket].crewName} Date: ${formatDate(polylines[ticket].workDate)} Footage: ${polylines[ticket].footage}`;
        break;
    }
    let polyline = drawPolyline(points, color, popupText);
    group.addLayer(polyline);
  }

  fitMap(polylines);

  switch (type) {
    case 1:
      locateLayerGroup = group;
      break;
    case 2:
      boreLayerGroup = group;
      break;
    case 3:
      vaultLayerGroup = group;
      break;
  }
}

/**
 * draws a line, binds a popup to it with bindPopup()
 * and then uses map.fitBounds() to set the map location to the line/polygon
 * @̶t̶o̶d̶o̶ ̶c̶r̶e̶a̶t̶e̶ ̶n̶e̶w̶ ̶m̶a̶p̶ ̶f̶i̶t̶b̶o̶u̶n̶d̶ ̶f̶u̶n̶c̶t̶i̶o̶n̶ ̶t̶h̶a̶t̶ ̶a̶c̶c̶o̶u̶n̶t̶s̶ ̶f̶o̶r̶ ̶a̶l̶l̶ ̶p̶o̶i̶n̶t̶s̶
̶ */
function drawPolyline(points, color, popupText) {
  let arr = [];
  for (const point of points) {
    let row = [point.b, point.a];
    arr.push(row);
  }


  let polygon = L.polyline(arr, { "color": color, "weight": 6, "fill": true }).addTo(map);
  polygon.bindPopup(popupText);
  return polygon;
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


