const { pool } = require('./db');
const { parseBoreKml } = require('./parseKML');


let testDirectory = "/mnt/4AB454E6B454D653/Users/Gustavo/Google Drive/locate stuff/infinite/053A_pon"


let result = parseBoreKml(`${testDirectory}/Bore.kml`);


console.log(result);