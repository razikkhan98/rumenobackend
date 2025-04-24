const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalVaccine = require("../../model/framData/vaccineModal");
const ChildAnimal = require("../../model/framData/childFromModal");
const moment = require("moment");
const {
  getAlert,
  sendWhatsappMessage,
  getSchedule,
  getVaccineSchedule,
  getSchedule_final,
  calculateVaccineSchedule,
} = require("../../utils/helper");

// exports.addVaccine = asyncHandler(async (req, res) => {
//   // Validate request body
//   if (Object.keys(req.body).length === 0) {
//     return res.status(400).json({ message: "No data provided" });
//   }

//   try {
//     const { parentUniqueId, childUniqueId, vaccineName, vaccineDate, uId } =
//       req.body;
//     if (!parentUniqueId && !childUniqueId) {
//       return res.status(400).json({
//         message: "Either parentUniqueId or childUniqueId is required.",
//       });
//     }

//     // Check if Uid
//     if (!uId) {
//       return res.status(400).json({ message: "Uid is required." });
//     }

//     let parentExists = null;
//     let childExists = null;

//     // Check if Parent exists
//     if (parentUniqueId) {
//       parentExists = await Animal.findOne({ uniqueId: parentUniqueId });
//       if (!parentExists) {
//         return res.status(404).json({ message: "Parent not found." });
//       }
//     }

//     // Check if Child exists
//     if (childUniqueId) {
//       childExists = await ChildAnimal.findOne({ uniqueId: childUniqueId });
//       if (!childExists) {
//         return res.status(404).json({ message: "Child not found." });
//       }
//     }

//     const vaccineId = parentUniqueId || childUniqueId;

//     // Create new Post WEAN data
//     const AnimalVaccineData = await AnimalVaccine.create({
//       vaccineId,
//       vaccineName,
//       vaccineDate,
//       uId,
//     });

//     // Push Milk Data into Parent Record
//     const updatedParent = await Animal.findOneAndUpdate(
//       { uniqueId: parentUniqueId },
//       { $push: { vaccine: AnimalVaccineData } },
//       { new: true }
//     );

//     // Push Child Data into Parent Record
//     const updatedChild = await ChildAnimal.findOneAndUpdate(
//       { uniqueId: childUniqueId },
//       { $push: { vaccine: AnimalVaccineData } },
//       { new: true }
//     );

//     res.status(201).json({
//       message: "Vaccine added successfully",
//       data: AnimalVaccineData,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server Error. Failed to add Post Wean data.",
//       error: error.message,
//     });
//   }
// });

// Update Vaccine Parent and Child

exports.updateVaccine = asyncHandler(async (req, res) => {
  let { vaccineId } = req.params;

  // If vaccineId is numeric or a custom string, skip ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(vaccineId) && !isNaN(vaccineId)) {
    return res.status(400).json({ message: "Invalid vaccineId format" });
  }

  try {
    const { vaccineName, vaccineDate } = req.body;

    const updatedPostWean = await AnimalPostWean.findOneAndUpdate(
      { vaccineId }, // ✅ Match `vaccineId` directly
      { vaccineName, vaccineDate },
      { new: true }
    );

    if (!updatedPostWean) {
      return res.status(404).json({ message: "Vaccine not found." });
    }

    res.json({
      message: "Vaccine updated successfully",
      data: updatedPostWean,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to update Vaccine data.",
      error: error.message,
    });
  }
});

// Delete Post Wean Parent and Child
exports.deleteVaccine = asyncHandler(async (req, res) => {
  const { vaccineId } = req.params;

  if (!vaccineId) {
    return res.status(400).json({ message: "No vaccineId provided" });
  }

  try {
    // Find Post Wean Entry
    const vaccineId = await AnimalVaccine.findOne({ vaccineId: vaccineId });
    if (!vaccineId) {
      return res.status(404).json({ message: "Post Wean not found" });
    }

    // Remove references from Parent & Child
    await Animal.updateMany(
      { uniqueId: vaccineId },
      { $pull: { vaccine: vaccineId } }
    );
    await ChildAnimal.updateMany(
      { uniqueId: vaccineId },
      { $pull: { vaccine: vaccineId } }
    );

    // Delete Post Wean Entry
    await AnimalVaccine.deleteOne({ vaccineId: vaccineId });

    res.json({ message: "vaccineId deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

// -------------------------------------- updated code -----------------------------------------------------------

exports.addVaccine = asyncHandler(async (req, res) => {
  try {
    const { vaccineName, vaccineDate, uId, tagId, animalBirthDate } = req.body;

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
      uId,
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
      uId: userId,
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
    console.log('error: ', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Register a new animal and set up its complete vaccination schedule
 */
exports.registerAnimal = async (req, res) => {
  try {
    const { animalTagId, birthDate, uId } = req.body;

    if (!animalTagId || !birthDate || !uId) {
      return res.status(400).json({
        error:
          "Missing required fields: animalTagId, birthDate, and uId are required",
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
          uId,
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
        uId: vaccine.uId,
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
