const asyncHandler = require("express-async-handler");
const AnimalVaccine = require("../../model/framData/vaccineModal");
const moment = require("moment");
const {
  sendWhatsappMessage,
  getSchedule_final,
  calculateVaccineSchedule,
} = require("../../utils/helper");

// -------------------------------------- updated code -----------------------------------------------------------

exports.addVaccine = asyncHandler(async (req, res) => {
  try {
    const { vaccineName, vaccineDate, uid, tagId, animalBirthDate } = req.body;

    // Get schedule for this specific vaccine
    const data = getSchedule_final(vaccineName, vaccineDate);

    // Set next reminder date (1 day before due date)
    const nextReminderDate = data.dueDate
      ? moment(data.dueDate).subtract(1, "day").format("YYYY-MM-DD")
      : null;

    const newVaccine = new AnimalVaccine({
      vaccineName,
      vaccineDate,
      dueDate: data.dueDate,
      alertDate: data.alertDate,
      boosterDate: data.boosterDate,
      repeatDate: data.repeatDate,
      nextReminderDate,
      uid,
      tagId,
    });

    await newVaccine.save();
    res.status(201).json({
      message: "Vaccine added successfully",
      vaccine: newVaccine,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Check and process vaccine reminders for a user
 */
exports.checkReminders = async (req, res) => {
  try {
    const { userId } = req.params;
    // const today = moment().format("YYYY-MM-DD");
    // const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
    const today = "2025-03-16";
    const tomorrow = "2025-03-17";

    const vaccines = await AnimalVaccine.find({
      uid: userId,
      isCompleted: false,
    });

    let remindersSent = [];
    let reminderErrors = [];

    for (let vaccine of vaccines) {
      // Skip if reminders are paused
      if (
        vaccine.pauseUntil &&
        moment(today).isBefore(moment(vaccine.pauseUntil))
      ) {
        continue;
      }

      try {
        // 1. Send tomorrow's due date reminders
        if (vaccine.dueDate && moment(vaccine.dueDate).isSame(tomorrow)) {
          const messageSent = await sendWhatsappMessage(
            `+91${userId}`, // Assuming userId is the phone number without country code
            `REMINDER: Vaccine "${vaccine.vaccineName}" is due TOMORROW for animal with tag ${vaccine.tagId}.`
          );

          if (messageSent) {
            remindersSent.push({
              vaccineId: vaccine._id,
              type: "due-tomorrow",
              message: `Reminder sent for ${vaccine.vaccineName}`,
            });
          }
        }

        // 2. Send overdue reminders
        const isDue =
          vaccine.dueDate && moment(today).isAfter(moment(vaccine.dueDate));
        const needsReminder =
          vaccine.nextReminderDate &&
          moment(today).isSameOrAfter(moment(vaccine.nextReminderDate));

        if (isDue && needsReminder) {
          const messageSent = await sendWhatsappMessage(
            `+91${userId}`, // Assuming userId is the phone number without country code
            `OVERDUE ALERT: Vaccine "${vaccine.vaccineName}" for animal with tag ${vaccine.tagId} was due on ${vaccine.dueDate} and is now OVERDUE. Please vaccinate as soon as possible.`
          );

          if (messageSent) {
            // Update next reminder date to 3 days later
            vaccine.nextReminderDate = moment()
              .add(3, "days")
              .format("YYYY-MM-DD");
            await vaccine.save();

            remindersSent.push({
              vaccineId: vaccine._id,
              type: "overdue",
              message: `Overdue reminder sent for ${vaccine.vaccineName}`,
            });
          }
        }

        // 3. Send booster reminders
        if (
          vaccine.boosterDate &&
          moment(vaccine.boosterDate).isSame(tomorrow)
        ) {
          const messageSent = await sendWhatsappMessage(
            `+91${userId}`,
            `BOOSTER REMINDER: Booster dose for "${vaccine.vaccineName}" is due TOMORROW for animal with tag ${vaccine.tagId}.`
          );

          if (messageSent) {
            remindersSent.push({
              vaccineId: vaccine._id,
              type: "booster-tomorrow",
              message: `Booster reminder sent for ${vaccine.vaccineName}`,
            });
          }
        }
      } catch (error) {
        reminderErrors.push({
          vaccineId: vaccine._id,
          error: error.message,
        });
      }
    }

    res.json({
      message: "Reminders processed",
      remindersSent,
      reminderErrors,
      totalSent: remindersSent.length,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Register a new animal and set up its complete vaccination schedule
 */
exports.registerAnimal = async (req, res) => {
  try {
    const { animalTagId, birthDate, uid } = req.body;

    if (!animalTagId || !birthDate || !uid) {
      return res.status(400).json({
        error:
          "Missing required fields: animalTagId, birthDate, and uid are required",
      });
    }

    // Calculate complete vaccination schedule
    const completeSchedule = calculateVaccineSchedule(birthDate);

    // Create vaccine records for all scheduled vaccines
    const vaccinePromises = Object.entries(completeSchedule).map(
      ([vaccineName, schedule]) => {
        const nextReminderDate = schedule.alertDate || schedule.dueDate;

        return new AnimalVaccine({
          vaccineName,
          vaccineDate: null, // Will be filled when vaccine is administered
          dueDate: schedule.dueDate,
          alertDate: schedule.alertDate,
          boosterDate: schedule.boosterDate,
          repeatDate: schedule.repeatDate,
          nextReminderDate: moment(nextReminderDate)
            .subtract(1, "day")
            .format("YYYY-MM-DD"),
          uid,
          tagId: animalTagId,
          isCompleted: false,
        }).save();
      }
    );

    const savedVaccines = await Promise.all(vaccinePromises);

    res.status(201).json({
      message: "Animal registered and vaccination schedule created",
      animalTagId,
      vaccineSchedule: savedVaccines,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mark a vaccine as completed
 */
exports.completeVaccine = async (req, res) => {
  try {
    const { vaccineId } = req.params;
    const { administeredDate } = req.body;

    const vaccine = await AnimalVaccine.findById(vaccineId);

    if (!vaccine) {
      return res.status(404).json({ error: "Vaccine record not found" });
    }

    // Update vaccine record
    vaccine.isCompleted = true;
    vaccine.vaccineDate = administeredDate || moment().format("YYYY-MM-DD");

    // Check if there's a booster needed
    if (vaccine.boosterDate) {
      // Create a booster reminder record
      const boosterVaccine = new AnimalVaccine({
        vaccineName: `${vaccine.vaccineName} (Booster)`,
        vaccineDate: null,
        dueDate: vaccine.boosterDate,
        alertDate: moment(vaccine.boosterDate)
          .subtract(1, "day")
          .format("YYYY-MM-DD"),
        nextReminderDate: moment(vaccine.boosterDate)
          .subtract(1, "day")
          .format("YYYY-MM-DD"),
        uid: vaccine.uid,
        tagId: vaccine.tagId,
        isCompleted: false,
      });

      await boosterVaccine.save();
    }

    // Save the updated vaccine record
    await vaccine.save();

    res.json({
      message: "Vaccine marked as completed",
      vaccine,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Pause reminders for a specific vaccine
 */
exports.pauseReminders = async (req, res) => {
  try {
    const { vaccineId } = req.params;
    const { pauseUntil } = req.body;

    if (!pauseUntil) {
      return res.status(400).json({ error: "pauseUntil date is required" });
    }

    const vaccine = await AnimalVaccine.findById(vaccineId);

    if (!vaccine) {
      return res.status(404).json({ error: "Vaccine record not found" });
    }

    vaccine.pauseUntil = pauseUntil;
    await vaccine.save();

    res.json({
      message: "Reminders paused until " + pauseUntil,
      vaccine,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateVaccineById = asyncHandler(async (req, res) => {
  // router.put("/vaccine/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const vaccine = await AnimalVaccine.findById(id);

    vaccine.isCompleted = true;
    vaccine.pauseUntil = moment().add(3, "days").format("YYYY-MM-DD");

    await vaccine.save();
    res.json({
      message: "Vaccine marked as completed. Reminders paused for 3 days.",
      vaccine,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.getAllVaccine = async (req, res) => {
  try {
    const { uid, tagId } = req.query;
    if (!uid || !tagId)
      return res.status(400).json({
        success: false,
        message: "uid and tagId are required",
      });
    const vaccine = await AnimalVaccine.find({ uid, tagId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: vaccine });
  } catch (error) {
    console.error("Error fetching postwean records:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch postwean records",
        error: error.message,
      });
  }
};
