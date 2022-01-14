const formatDate = (date) => {
  let day = String(date.getDate()).padStart(2, '0');
  let month = String(date.getMonth() + 1).padStart(2, '0');
  let year = date.getFullYear() - 2000;

  return `${month}/${day}/${year}`;
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
}