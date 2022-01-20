const puppeteer = require('puppeteer');

const testingBoolean = false;
const ticketSearchURL = "https://exactix.sunshine811.com/findTicketByNumberAndPhone";
const phoneNumber = "5615018160"

async function getTicketStatus(ticketNumber) {
  let slowMoRate = 50;
  if (testingBoolean) {
    slowMoRate = 150;
  }
  const browser = await puppeteer.launch({
    headless: !testingBoolean,
    slowMo: slowMoRate,
  });

  const page = await browser.newPage();
  await page.goto(ticketSearchURL);

  let ticketInputBar = await page.waitForSelector('#mat-input-0');
  await ticketInputBar.type(ticketNumber);

  let phoneNumberInputBar = await page.waitForSelector('#iq-phone-0 > input');
  await phoneNumberInputBar.type(phoneNumber);

  let findButton = await page.waitForSelector("body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > div.page-content > div:nth-child(1) > div > button > span.mat-button-wrapper");
  await findButton.click();

  await page.waitForSelector("body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > div.page-content > div:nth-child(3) > ticket-anon-simple-view > div > ticket-details-printing-text-and-service-areas > iq-view-list > div.iq-list-items")

  let ticketStatusObj = await page.evaluate((ticketNumber) => {
    let tableElement = document.querySelector("body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > div.page-content > div:nth-child(3) > ticket-anon-simple-view > div > ticket-details-printing-text-and-service-areas > iq-view-list > div.iq-list-items");
    let tableRows = tableElement.querySelectorAll(".iq-list-item");
    let utilityStatusObj = {};
    for (const row of tableRows) {
      let cells = row.querySelectorAll(".column-fixed");
      if (cells.length == 7) {
        if (cells[0].textContent.trim() == "Yes" || cells[0].textContent.trim() == "No") {
          utilityStatusObj[cells[1].textContent.trim()] = {
            ticketNumber: ticketNumber,
            case: 1,
            utilityType: cells[2].textContent.trim(),
            response: cells[6].textContent.trim(),
            notes: "",
            contact: cells[3].textContent.trim(),
            alternateContact: cells[4].textContent.trim(),
            emergencyContact: cells[5].textContent.trim(),
          };
        } else {
          utilityStatusObj[cells[0].textContent.trim()] = {
            ticketNumber: ticketNumber,
            case: 2,
            utilityType: cells[1].textContent.trim(),
            response: cells[5].textContent.trim(),
            notes: cells[6].textContent.trim(),
            contact: "UPDATECASE",
          };
        }
      }
      else if (cells.length == 9) {
        utilityStatusObj[cells[2].textContent.trim()] = {
          ticketNumber: ticketNumber,
          case: 3,
          utilityType: cells[3].textContent.trim(),
          response: cells[7].textContent.trim(),
          notes: cells[8].textContent.trim(),
          contact: cells[4].textContent.trim(),
          alternateContact: cells[5].textContent.trim(),
          emergencyContact: cells[6].textContent.trim(),
        };
      }
      else if (cells.length == 8) {
        if (cells[1].textContent.trim() == "Yes" || cells[1].textContent.trim() == "No") {
          utilityStatusObj[cells[2].textContent.trim()] = {
            ticketNumber: ticketNumber,
            case: 4,
            utilityType: cells[3].textContent.trim(),
            response: cells[7].textContent.trim(),
            notes: "",
            contact: cells[4].textContent.trim(),
            alternateContact: cells[5].textContent.trim(),
            emergencyContact: cells[6].textContent.trim(),
          };
        } else {
          utilityStatusObj[cells[1].textContent.trim()] = {
            ticketNumber: ticketNumber,
            case: 5,
            utilityType: cells[2].textContent.trim(),
            response: cells[6].textContent.trim(),
            notes: cells[7].textContent.trim(),
            contact: cells[3].textContent.trim(),
            alternateContact: cells[4].textContent.trim(),
            emergencyContact: cells[5].textContent.trim(),
          };
        }
      } else {
        utilityStatusObj[cells[0].textContent.trim()] = {
          ticketNumber: ticketNumber,
          case: 6,
          utilityType: cells[1].textContent.trim(),
          response: cells[5].textContent.trim(),
          notes: "",
          contact: "UPDATECASE",
        };
      }
    }
    return utilityStatusObj;
  }, ticketNumber);
  if (testingBoolean) {
    setTimeout(async (browser) => {
      await browser.close();
    }, 25000, browser);
  } else {
    await browser.close();
  }
  return ticketStatusObj;
}



module.exports = getTicketStatus;