let map = L.map('map');

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);


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
    drawPolyline(points, color);
  }
}

function drawPolyline(points, color) {
  let arr = [];
  for (const point of points) {
    let row = [point.b, point.a];
    arr.push(row);
  }

  let polygon = L.polyline(arr, { "color": color }).addTo(map);
  map.fitBounds(polygon.getBounds());
}



var polygon = L.polyline([
  [28.4166552, -81.4176226],
  [28.4169289, -81.417746],
]).addTo(map);

map.fitBounds(polygon.getBounds());