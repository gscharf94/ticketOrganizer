

const formatDate = (date) => {
  let day = String(date.getDate()).padStart(2, '0');
  let month = String(date.getMonth() + 1).padStart(2, '0');
  let year = date.getFullYear() - 2000;

  return `${month}/${day}/${year}`;
}

const formatTimestamp = (timestamp) => {
  let dateString = formatDate(timestamp);

  // let hours = String(timestamp.getHours()).padStart(2, "0");
  // let minutes = String(timestamp.getMinutes()).padStart(2, "0");
  // let seconds = String(timestamp.getSeconds()).padStart(2, "0");


  let hours = timestamp.getHours();
  let minutes = timestamp.getMinutes();
  let seconds = timestamp.getSeconds();

  if (hours > 12) {
    hours -= 12;
    var amPM = "PM"
  } else {
    var amPM = "AM"
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${amPM} ${dateString}`;
}

const formatFootage = (ftg) => {
  let ftgSplit = String(ftg).split("");

  let backwardString = "";

  let c = 0;
  for (let i = ftgSplit.length - 1; i >= 0; i--) {
    if (c == 3) {
      backwardString += ",";
      c = 0;
    }
    backwardString += ftgSplit[i];
    c++;
  }

  let output = "";

  for (let i = backwardString.length - 1; i >= 0; i--) {
    output += backwardString[i];
  }

  return output + "ft";
}

module.exports = {
  formatDate,
  formatFootage,
  formatTimestamp,
}