const moment = require("moment");

function getSchedule(vaccineName, vaccineDate) {
  const date = moment(vaccineDate);

  switch (vaccineName.toLowerCase()) {
    case "de worming":
      return {
        alertDate: date.clone().add(75, "days").format("YYYY-MM-DD"),
        dueDate: date.clone().add(75, "days").format("YYYY-MM-DD"),
        repeatDate: null,
      };

    case "ppr":
      return {
        dueDate: date.clone().add(85, "days").format("YYYY-MM-DD"),
        boosterDate: date.clone().add(30, "days").format("YYYY-MM-DD"),
        repeatDate: date.clone().add(2, "years").format("YYYY-MM-DD"),
      };

    case "enterotoxaemia (et) + tt":
      return {
        dueDate: date.clone().add(15, "days").format("YYYY-MM-DD"),
        boosterDate: date.clone().add(20, "days").format("YYYY-MM-DD"),

        repeatDate: date
          .clone()
          .add(30 + 180, "days")
          .format("YYYY-MM-DD"), // 6 months after booster
      };

    case "hemorrhagic septicaemia (hs)":
      return {
        alertDate: date.clone().add(15, "days").format("YYYY-MM-DD"),
        dueDate: date.clone().add(20, "days").format("YYYY-MM-DD"),
        boosterDate: date.clone().add(30, "days").format("YYYY-MM-DD"),
        repeatDate: date
          .clone()
          .add(30 + 180, "days")
          .format("YYYY-MM-DD"),
      };

    case "foot and mouth disease (fmd)":
      return {
        alertDate: date.clone().add(15, "days").format("YYYY-MM-DD"),
        dueDate: date.clone().add(20, "days").format("YYYY-MM-DD"),
        boosterDate: date.clone().add(30, "days").format("YYYY-MM-DD"),
        repeatDate: date
          .clone()
          .add(30 + 365, "days")
          .format("YYYY-MM-DD"),
      };

    case "goat pox":
      return {
        alertDate: date.clone().add(15, "days").format("YYYY-MM-DD"),
        dueDate: date.clone().add(20, "days").format("YYYY-MM-DD"),

        boosterDate: date
          .clone()
          .add(30 + 365, "days")
          .format("YYYY-MM-DD"),
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
        due: date.clone().add(75, "days").format("YYYY-MM-DD"),
        booster: "No booster required",
        repeat: date.clone().add(2, "years").format("YYYY-MM-DD"),
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
        due: date.clone().add(30, "days").format("YYYY-MM-DD"),
        booster: "30 days after Goat Pox",
        repeat: "1 year after booster",
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

// Define the schedule for each vaccine
const vaccineSchedules = {
  "de worming": {
    alertDays: 75,
    repeat: { interval: 2, unit: "years" },
  },
  ppr: {
    dueDays: 85,
    booster: { daysAfter: 30 },
    repeat: { interval: 6, unit: "months" },
    alertDays: 15,
  },
  "enterotoxaemia (et) + tt": {
    dueDays: 20, // days after PPR
    booster: { daysAfter: 30 },
    repeat: { interval: 6, unit: "months" },
    alertDays: 15,
  },
  "hemorrhagic septicaemia (hs)": {
    alertDays: 15,
    dueBeforeNext: true,
    booster: { daysAfter: 30 },
    repeat: { interval: 6, unit: "months" },
  },
  "foot and mouth disease (fmd)": {
    alertDays: 15,
    dueBeforeNext: true,
    booster: { daysAfter: 30 },
    repeat: { interval: 1, unit: "years" },
  },
  "goat pox": {
    alertDays: 15,
    dueBeforeNext: true,
  },
};

// Function to calculate vaccine dates based on the given schedule
function getVaccineSchedule(vaccineName, vaccineDate) {
  const date = moment(vaccineDate);
  const schedule = vaccineSchedules[vaccineName.toLowerCase()];

  if (!schedule) return {};

  const alertDate = schedule.alertDays
    ? date.clone().add(schedule.alertDays, "days").format("YYYY-MM-DD")
    : null;

  const dueDate = schedule.dueDays
    ? date.clone().add(schedule.dueDays, "days").format("YYYY-MM-DD")
    : null;

  const boosterDate = schedule.booster
    ? date.clone().add(schedule.booster.daysAfter, "days").format("YYYY-MM-DD")
    : null;

  const repeatDate = schedule.repeat
    ? date
        .clone()
        .add(schedule.repeat.interval, schedule.repeat.unit)
        .format("YYYY-MM-DD")
    : null;

  return {
    alertDate,
    dueDate,
    boosterDate,
    repeatDate,
  };
}

// --------------------------------new latest-------------------- 22-april-25

/**
 * Calculate vaccine schedule dates based on animal's age or previous vaccine date
 * @param {string} vaccineName - Name of the vaccine
 * @param {string} referenceDate - Date of birth or previous vaccine date
 * @param {boolean} isFromBirth - Whether referenceDate is birth date or previous vaccine date
 * @returns {Object} - Schedule with alert, due, booster and repeat dates
 */
function getSchedule_final(vaccineName, referenceDate, isFromBirth = false) {
  const date = moment(referenceDate);
  const schedule = {};

  switch (vaccineName.toLowerCase()) {
    case "de worming":
      schedule.alertDate = date.clone().add(75, "days").format("YYYY-MM-DD");
      schedule.dueDate = date.clone().add(75, "days").format("YYYY-MM-DD");
      schedule.repeatDate = null;
      break;

    case "ppr":
      schedule.alertDate = isFromBirth
        ? date.clone().add(82, "days").format("YYYY-MM-DD")
        : date.clone().add(82, "days").format("YYYY-MM-DD");
      schedule.dueDate = isFromBirth
        ? date.clone().add(85, "days").format("YYYY-MM-DD")
        : date.clone().add(85, "days").format("YYYY-MM-DD");
      schedule.boosterDate = date.clone().add(30, "days").format("YYYY-MM-DD");
      schedule.repeatDate = date.clone().add(2, "years").format("YYYY-MM-DD");
      break;

    case "enterotoxaemia (et) + tt":
      // According to the table, ET+TT is due 20 days after PPR vaccine
      schedule.alertDate = date.clone().add(15, "days").format("YYYY-MM-DD");
      schedule.dueDate = date.clone().add(20, "days").format("YYYY-MM-DD");
      schedule.boosterDate = date.clone().add(30, "days").format("YYYY-MM-DD");
      schedule.repeatDate = date
        .clone()
        .add(30 + 180, "days")
        .format("YYYY-MM-DD"); // 6 months after booster
      break;

    case "hemorrhagic septicaemia (hs)":
      // 15 days from ET TT vaccine
      schedule.alertDate = date.clone().add(15, "days").format("YYYY-MM-DD");
      schedule.dueDate = date.clone().add(15, "days").format("YYYY-MM-DD"); // "Before next vaccine" interpreted as same as alert
      schedule.boosterDate = date.clone().add(30, "days").format("YYYY-MM-DD");
      schedule.repeatDate = date
        .clone()
        .add(30 + 180, "days")
        .format("YYYY-MM-DD"); // 6 months after booster
      break;

    case "foot and mouth disease (fmd)":
      // 15 days from HS vaccine
      schedule.alertDate = date.clone().add(15, "days").format("YYYY-MM-DD");
      schedule.dueDate = date.clone().add(15, "days").format("YYYY-MM-DD"); // "Before next vaccine" interpreted as same as alert
      schedule.boosterDate = date.clone().add(30, "days").format("YYYY-MM-DD");
      schedule.repeatDate = date
        .clone()
        .add(30 + 180, "days")
        .format("YYYY-MM-DD"); // 6 months after booster

      break;

    case "goat pox":
      // 15 days from HS vaccine (as per table)
      schedule.alertDate = date.clone().add(15, "days").format("YYYY-MM-DD");
      schedule.dueDate = date.clone().add(15, "days").format("YYYY-MM-DD"); // "Before next vaccine" interpreted as same as alert
      schedule.boosterDate = date.clone().add(30, "days").format("YYYY-MM-DD");
      schedule.repeatDate = date
        .clone()
        .add(30 + 365, "days")
        .format("YYYY-MM-DD"); // 1 year after booster
      break;

    default:
      // Return empty object for unknown vaccines
      break;
  }

  return schedule;
}

/**
 * Calculate the appropriate dates for a vaccine sequence given an animal's birth date
 * @param {string} animalBirthDate - Animal's birth date (YYYY-MM-DD)
 * @returns {Object} - Complete vaccine schedule for the animal
 */
function calculateVaccineSchedule(animalBirthDate) {
  const birthDate = moment(animalBirthDate);

  // Calculate all vaccine schedules from birth
  const deWormingSchedule = getSchedule("de worming", animalBirthDate, true);
  const pprSchedule = getSchedule("ppr", animalBirthDate, true);

  // For subsequent vaccines, we calculate based on the previous vaccine's due date
  const etSchedule = getSchedule(
    "enterotoxaemia (et) + tt",
    pprSchedule.dueDate
  );
  const hsSchedule = getSchedule(
    "hemorrhagic septicaemia (hs)",
    etSchedule.dueDate
  );
  const fmdSchedule = getSchedule(
    "foot and mouth disease (fmd)",
    hsSchedule.dueDate
  );
  const goatPoxSchedule = getSchedule("goat pox", fmdSchedule.dueDate);

  return {
    "de worming": deWormingSchedule,
    ppr: pprSchedule,
    "enterotoxaemia (et) + tt": etSchedule,
    "hemorrhagic septicaemia (hs)": hsSchedule,
    "foot and mouth disease (fmd)": fmdSchedule,
    "goat pox": goatPoxSchedule,
  };
}

/**
 * Send a WhatsApp message to a user
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message content to send
 */
async function sendWhatsappMessage(phoneNumber, message) {
  try {
    // Implement the actual WhatsApp message sending logic here
    console.log(`Sending WhatsApp message to ${phoneNumber}: ${message}`);
    // Return success status or response from WhatsApp API
    return true;
  } catch (error) {
    console.error(`Failed to send WhatsApp message: ${error.message}`);
    return false;
  }
}

module.exports = {
  getSchedule,
  getAlert,
  sendWhatsappMessage,
  getVaccineSchedule,
  getSchedule_final,
  calculateVaccineSchedule,
};
