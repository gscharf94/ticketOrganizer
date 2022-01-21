const { countReset } = require('console');
const fs = require('fs');

function parseCoords(txt) {
  let split = txt.trim().split("\n");
  let coords = [];

  let counter = 0;
  for (const row of split) {
    let [a, b, c] = row.split(",");
    coords.push({
      a: a.trim(),
      b: b.trim(),
      c: c.trim(),
      p: counter,
    });
    counter++;
  }
  return coords;
}

function parseBoreKml(filepath) {
  let text = fs.readFileSync(filepath, 'utf8');

  let coordinateRegex = /<coordinates>([\s.\d,-]*)/g;
  let coordinateResult = text.matchAll(coordinateRegex);
  let coords = [...coordinateResult];

  let dateRegex = /<name>([\d.-]*)<\/name>/g;
  let dateResult = text.matchAll(dateRegex);
  let dates = [...dateResult];

  let descriptionRegex = /<description>([\w\s-]*)<\/description>/g;
  let descriptionResult = text.matchAll(descriptionRegex);
  let descriptions = [...descriptionResult];

  if (coords.length != dates.length && coords.length != descriptions) {
    console.log('different number of dates / coords / names. something is wrong');
    console.log('exiting prematurely');
    return;
  }

  let coordinateSets = [];
  for (let i = 0; i < coords.length; i++) {
    let boreCoords = parseCoords(coords[i][1]);
    let splitDescription = descriptions[i][1].split("-");
    let name = splitDescription[0].trim();
    let footage = splitDescription[1].trim().slice(0, -2);
    let date = dates[i][1];

    coordinateSets.push({
      coords: boreCoords,
      date: date,
      crew: name,
      footage: footage,
    });
  }

  return coordinateSets;
}

function parseLocateKml(filepath) {
  let text = fs.readFileSync(filepath, 'utf8');

  let coordinateRegex = /<coordinates>([\s.\d,-]*)/g;
  let coordinateResult = text.matchAll(coordinateRegex);
  let coordSets = [...coordinateResult];

  let ticketRegex = /<name>(\d*)<\/name>/g;
  let ticketResult = text.matchAll(ticketRegex);
  let ticks = [...ticketResult];

  let data = {};

  if (ticketResult.length != coordinateResult.length) {
    console.log('different number of coordinate sets and ticket number. something is wrong');
    console.log('exiting prematurely');
    return;
  }

  let coordinateSets = [];
  for (let i = 0; i < ticks.length; i++) {
    let coordinateSet = {
      coords: parseCoords(coordSets[i][1]),
      ticket_number: ticks[i][1]
    }
    coordinateSets.push(coordinateSet);
  }
  return coordinateSets;
}


// let x = parseKML("/mnt/4AB454E6B454D653/Users/Gustavo/Google Drive/locate stuff/orl 2/Fibertech/2022/JB846385/Locates.kml")

// for (const set of x) {
// console.log(set);
// }


module.exports = {
  parseLocateKml,
  parseBoreKml,
} 