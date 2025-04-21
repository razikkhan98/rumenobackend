const moment = require("moment");

function getSchedule(vaccineName, vaccineDate) {
  const date = moment(vaccineDate);

  switch (vaccineName.toLowerCase()) {
    case "de worming":
      return {
        alertDate: date.clone().add(75, "days").toDate(),
        dueDate: date.clone().add(75, "days").toDate(),
        repeatDate: date.clone().add(2, "years").toDate(),
      };

    case "ppr":
      return {
        dueDate: date.clone().add(85, "days").toDate(),
        boosterDate: date.clone().add(30, "days").toDate(),
        repeatDate: date
          .clone()
          .add(30 + 180, "days")
          .toDate(), // 6 months after booster
        alertDate: date.clone().add(15, "days").toDate(),
      };

    case "enterotoxaemia (et) + tt":
      return {
        dueDate: date.clone().add(20, "days").toDate(),
        boosterDate: date.clone().add(30, "days").toDate(),
        repeatDate: date
          .clone()
          .add(30 + 180, "days")
          .toDate(),
      };

    case "hemorrhagic septicaemia (hs)":
      return {
        alertDate: date.clone().add(15, "days").toDate(),
        dueDate: date.clone().add(20, "days").toDate(),
        boosterDate: date.clone().add(30, "days").toDate(),
        repeatDate: date
          .clone()
          .add(30 + 180, "days")
          .toDate(),
      };

    case "foot and mouth disease (fmd)":
      return {
        alertDate: date.clone().add(15, "days").toDate(),
        dueDate: date.clone().add(20, "days").toDate(),
        boosterDate: date.clone().add(30, "days").toDate(),
        repeatDate: date
          .clone()
          .add(30 + 365, "days")
          .toDate(),
      };

    case "goat pox":
      return {
        alertDate: date.clone().add(15, "days").toDate(),
        dueDate: date.clone().add(20, "days").toDate(),
      };

    default:
      return {};
  }
}

function getAlert_old(vaccineName, vaccineDate) {
  const date = moment(vaccineDate);

  switch (vaccineName.toLowerCase()) {
    case "de worming":
      return { due: date.clone().add(75, "days").format("YYYY-MM-DD") };
    case "ppr":
      return { due: date.clone().add(85, "days").format("YYYY-MM-DD") };
    case "enterotoxaemia (et) + tt":
      return { due: date.clone().add(20, "days").format("YYYY-MM-DD") };
    case "hemorrhagic septicaemia (hs)":
    case "foot and mouth disease (fmd)":
    case "goat pox":
      return { due: date.clone().add(30, "days").format("YYYY-MM-DD") };
    default:
      return { due: null };
  }
}

function getAlert(vaccineName, vaccineDate) {
  const date = moment(vaccineDate);
  const lowerName = vaccineName.toLowerCase();

  switch (lowerName) {
    case "ppr":
      return {
        due: date.clone().add(85, "days").format("YYYY-MM-DD"),
        booster: "30 days after ET",
        repeat: "6 months after booster",
      };
    case "enterotoxaemia (et) + tt":
      return {
        due: date.clone().add(20, "days").format("YYYY-MM-DD"),
        booster: "30 days after HS",
        repeat: "6 months after booster",
      };
    case "hemorrhagic septicaemia (hs)":
      return {
        due: date.clone().add(30, "days").format("YYYY-MM-DD"),
        booster: "30 days after FMD",
        repeat: "6 months after booster",
      };
    case "foot and mouth disease (fmd)":
      return {
        due: date.clone().add(30, "days").format("YYYY-MM-DD"),
        booster: "30 days after Goat Pox",
        repeat: "1 year after booster",
      };
    case "goat pox":
      return {
        due: date.clone().add(75, "days").format("YYYY-MM-DD"),
        booster: "No booster required",
        repeat: date.clone().add(2, "years").format("YYYY-MM-DD"),
      };

    default:
      return {
        due: null,
        booster: null,
        repeat: null,
      };
  }
}

async function sendWhatsappMessage(number, message) {
  console.log(" WhatsApp sent to:", number);
  console.log(" Message:", message);
  return message;
}

module.exports = { getSchedule, getAlert, sendWhatsappMessage };
