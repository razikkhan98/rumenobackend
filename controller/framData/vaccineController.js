const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalVaccine = require("../../model/framData/vaccineModal");
const ChildAnimal = require("../../model/framData/childFromModal");
const moment = require("moment");
const { getAlert, sendWhatsappMessage } = require("../../utils/helper");

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
    const { vaccineName, vaccineDate, uId, tagId } = req.body;

    const alertData = getAlert(vaccineName, vaccineDate);

    const newVaccine = new Vaccine({
      vaccineName,
      vaccineDate,
      dueDate: alertData.due,
      booster: alertData.booster,
      repeat: alertData.repeat,
      uId,
      tagId,
    });

    await newVaccine.save();
    res.status(201).json({ message: "Vaccine added", vaccine: newVaccine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.checkReminders = asyncHandler(async (req, res) => {
  // router.get("/check-reminders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const today = moment().format("YYYY-MM-DD");
    const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

    // testing
    // const today = "2025-04-27";
    // const tomorrow = "2025-04-31";
    const vaccines = await AnimalVaccine.find({ uId: userId });

    let remindersSent = [];

    for (let vac of vaccines) {
      const isPaused =
        vac.pauseUntil && moment(today).isBefore(moment(vac.pauseUntil));

      if (isPaused) continue;

      const oneDayBefore =
        vac.nextReminderDate && vac.nextReminderDate === tomorrow;
      const isDue =
        vac.dueDate && moment(today).isSameOrAfter(moment(vac.dueDate));
      const needsReminder =
        vac.nextReminderDate &&
        moment(today).isSameOrAfter(moment(vac.nextReminderDate));

      if (oneDayBefore) {
        await sendWhatsappMessage(
          "+91XXXXXXXXXX",
          ` Reminder: Vaccine "${vac.vaccineName}" due tomorrow for tag ${vac.tagId}`
        );
        continue;
      }

      if (!vac.isCompleted && isDue && needsReminder) {
        await sendWhatsappMessage(
          "+91XXXXXXXXXX",
          `Missed Vaccine Alert!\nVaccine: ${vac.vaccineName}\nTag ID: ${vac.tagId}\nDue on: ${vac.dueDate}`
        );
        vac.nextReminderDate = moment().add(3, "days").format("YYYY-MM-DD");
        await vac.save();
        remindersSent.push(vac);
      }
    }

    res.json({ message: "Reminders processed", count: remindersSent.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
