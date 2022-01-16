const fs = require('fs');

function parseCoords(txt) {
  let split = txt.split("\n");
  let coords = [];

  for (const row of split) {
    let [a, b, c] = row.split(",");
    coords.push({
      a: a.trim(),
      b: b.trim(),
      c: c.trim(),
    });
  }
  return coords;
}

function parseKML(filepath) {
  let text = fs.readFileSync(filepath, 'utf8');

  let coordinateRegex = /<coordinates>\s*(-\d{2}\.\d*,\d{2}\.\d*,0\s*-\d{2}\.\d*,\d{2}\.\d*,0)\s*<\/coordinates>/g;
  let coordinateResult = text.matchAll(coordinateRegex);
  let coordSets = [...coordinateResult];

  let ticketRegex = /<name>(\d*)<\/name>/g;
  let ticketResult = text.matchAll(ticketRegex);
  let ticks = [...ticketResult];

  let data = {};

  if (ticketResult.length != coordinateResult.length) {
    console.log('different number of coordinate sets and ticket number');
  }


  let coordinateSets = [];


  for (let i = 0; i < ticks.length; i++) {
    let coordinateSet = {
      coords: parseCoords(coordSets[i][1]),
      ticket_number: ticks[i][1]
    }
    coordinateSets.push(coordinateSet);
  }

  console.log(coordinateSets[0].coords);





  return { test: 'test' }
}


parseKML("/mnt/4AB454E6B454D653/Users/Gustavo/Google Drive/locate stuff/orl 2/Fibertech/2022/REQ579945/Locates.kml")


// module.exports = parseKML;