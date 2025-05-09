const asyncHandler = require("express-async-handler");
const AnimalVaccine = require("../../model/framData/vaccineModal");
const moment = require("moment");
const {
  sendWhatsappMessage,
  getSchedule_final,
  calculateVaccineSchedule,
} = require("../../utils/helper");
const Animal = require("../../model/framData/parentFromModal");
const vaccineModal = require("../../model/framData/vaccineModal");
const registerModel = require("../../model/user/registerModel");

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

// ===================================================================================================================
exports.addVaccineToAnimal = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      uid,
      animalUniqueId,
      vaccineName,
      vaccineDate,
      boosterName,
      boosterDate,
    } = req.body;

    if (!uid)
      return res.status(400).json({ message: "uid is a required field" });

    if (!vaccineName && !boosterName)
      return res
        .status(400)
        .json({ message: "Either vaccineName or boosterName is required" });

    if ((vaccineName && !vaccineDate) || (boosterName && !boosterDate))
      return res.status(400).json({
        message: "Date is required when providing a vaccine or booster name",
      });

    const animal = await Animal.findOne({ uniqueId: animalUniqueId });
    if (!animal) return res.status(404).json({ message: "Animal not found" });

    const vaccineRecord = await vaccineModal.findOne({ animalUniqueId });
    if (!vaccineRecord) {
      return res.status(404).json({ message: "Vaccine record not found" });
    }

    if (vaccineName && vaccineDate) {
      // Check if the same vaccine already exists for this date
      const vaccineExists = vaccineRecord.vaccineData.some((vaccine) => {
        if (Array.isArray(vaccine)) {
          return (
            vaccine[0].toLowerCase() === vaccineName.toLowerCase() &&
            vaccine[1] === vaccineDate
          );
        } else if (typeof vaccine === "object") {
          return (
            vaccine.vaccineName.toLowerCase() === vaccineName.toLowerCase() &&
            vaccine.vaccineDate === vaccineDate
          );
        }
        return false;
      });

      if (vaccineExists) {
        return res.status(400).json({
          message: `Vaccine ${vaccineName} already exists for this date (${vaccineDate})`,
          success: false,
        });
      }

      const newVaccineDate = new Date(vaccineDate);

      // Special validation for deworming (if vaccineName includes "deworming" or "ppr")
      const vaccineLower = vaccineName.toLowerCase();
      const isDeworming = vaccineLower.includes("deworming");
      const isPPR = vaccineLower.includes("ppr");

      if (isDeworming) {
        // Check if animal has date of birth for deworming validation
        if (!animal.dateOfBirth) {
          return res.status(400).json({
            message:
              "Animal's date of birth is required for deworming validation",
            success: false,
          });
        }

        const birthDate = new Date(animal.dateOfBirth);

        // Get all deworming entries from vaccineData
        const dewormingEntries = vaccineRecord.vaccineData.filter((vaccine) => {
          if (Array.isArray(vaccine)) {
            return vaccine[0].toLowerCase().includes("deworming");
          } else if (typeof vaccine === "object") {
            return vaccine.vaccineName.toLowerCase().includes("deworming");
          }
          return false;
        });

        // First deworming validation: Must be at least 85 days after birth
        if (dewormingEntries.length === 0) {
          const timeDiff = Math.abs(newVaccineDate - birthDate);
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          if (daysDiff < 85) {
            return res.status(400).json({
              message: `First deworming can only be added 85 days after birth. Current age: ${daysDiff} days`,
              success: false,
            });
          }
        }
        // Second deworming validation: Must be at least 75 days after birth
        else if (dewormingEntries.length === 1) {
          const timeDiff = Math.abs(newVaccineDate - birthDate);
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          if (daysDiff < 75) {
            return res.status(400).json({
              message: `Second deworming can only be added 75 days after birth. Current age: ${daysDiff} days`,
              success: false,
            });
          }
        }
      }

      // PPR validation: Must be at least 85 days after last vaccine
      else if (isPPR) {
        // Get the latest vaccine date
        let lastVaccineDate = null;
        if (vaccineRecord.vaccineData && vaccineRecord.vaccineData.length > 0) {
          const vaccineDates = vaccineRecord.vaccineData
            .map((vaccine) => {
              if (Array.isArray(vaccine)) {
                return new Date(vaccine[1]);
              } else if (typeof vaccine === "object") {
                return new Date(vaccine.vaccineDate);
              }
              return null;
            })
            .filter((date) => date !== null);

          if (vaccineDates.length > 0) {
            lastVaccineDate = new Date(Math.max(...vaccineDates));
          }
        }

        // If there's a last vaccine date, check the 85-day rule
        if (lastVaccineDate) {
          const timeDiff = Math.abs(newVaccineDate - lastVaccineDate);
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          if (daysDiff < 85) {
            return res.status(400).json({
              message: `PPR vaccine can only be added 85 days after the last vaccine. Days since last vaccine: ${daysDiff}`,
              success: false,
            });
          }
        }
      }
      // Regular vaccine validation: Must be at least 7 days apart from other vaccines
      else {
        // Get all vaccine dates
        const existingVaccineDates = vaccineRecord.vaccineData
          .map((vaccine) => {
            if (Array.isArray(vaccine)) {
              return vaccine[1];
            } else if (typeof vaccine === "object") {
              return vaccine.vaccineDate;
            }
            return null;
          })
          .filter((date) => date !== null);

        // Check if the new vaccine date is within 7 days of any existing vaccine
        for (const existingDate of existingVaccineDates) {
          const existingDateObj = new Date(existingDate);
          const timeDiff = Math.abs(newVaccineDate - existingDateObj);
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          if (daysDiff < 7) {
            return res.status(400).json({
              message: `New vaccine cannot be added within 7 days of an existing vaccine (${existingDate})`,
              success: false,
            });
          }
        }
      }

      // Add the new vaccine record
      vaccineRecord.vaccineData.push({
        vaccineName,
        vaccineDate,
      });
    }

    if (boosterName && boosterDate) {
      const boosterExists = vaccineRecord.boosterData.some((booster) => {
        if (Array.isArray(booster)) {
          return (
            booster[0].toLowerCase() === boosterName.toLowerCase() &&
            booster[1] === boosterDate
          );
        } else if (typeof booster === "object") {
          return (
            booster.boosterName.toLowerCase() === boosterName.toLowerCase() &&
            booster.boosterDate === boosterDate
          );
        }
        return false;
      });

      if (boosterExists) {
        return res.status(400).json({
          message: `Booster ${boosterName} already exists for this date (${boosterDate})`,
          success: false,
        });
      }

      // Check if there's a recent booster within 7 days
      if (vaccineRecord.boosterData.length > 0) {
        // Get all booster dates
        const existingBoosterDates = vaccineRecord.boosterData
          .map((booster) => {
            if (Array.isArray(booster)) {
              return booster[1];
            } else if (typeof booster === "object") {
              return booster.boosterDate;
            }
            return null;
          })
          .filter((date) => date !== null);

        // Convert all dates to Date objects for comparison
        const newBoosterDate = new Date(boosterDate);

        // Check if the new booster date is within 7 days of any existing booster
        for (const existingDate of existingBoosterDates) {
          const existingDateObj = new Date(existingDate);
          const timeDiff = Math.abs(newBoosterDate - existingDateObj);
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          if (daysDiff < 7) {
            return res.status(400).json({
              message: `New booster cannot be added within 7 days of an existing booster (${existingDate})`,
              success: false,
            });
          }
        }
      }

      vaccineRecord.boosterData.push({
        boosterName,
        boosterDate,
      });
    }

    await vaccineRecord.save();

    res.status(200).json({
      message: "Vaccine data added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add vaccine data.",
      error: error.message,
    });
  }
});

/**
 * Check and log vaccine alerts for animals
 * @param {Array} animals - List of animal objects with vaccineData
 */
exports.sendVaccineAlerts = asyncHandler(async (req, res) => {
  try {
    const today = moment();

    const animals = await vaccineModal.find({ uid: req?.query?.uid });

    animals.forEach((animal) => {
      const { uid, animalUniqueId, dateOfBirth, vaccineData } = animal;
      console.log("animal?.dateOfBirth: ", animal?.dateOfBirth);

      const dob = moment(dateOfBirth);
      const daysSinceDOB = today.diff(dob, "days");

      const deworming = vaccineData.find(
        (v) => v.vaccineName.toLowerCase() === "deworming"
      );
      const ppr = vaccineData.find(
        (v) => v.vaccineName.toLowerCase() === "ppr"
      );

      //  Step 1: Deworming Alert — 75 days after DOB if not done
      if (!deworming && daysSinceDOB === 75) {
        console.log(` ${uid}: Alert — Give *Deworming* (75 days after DOB)`);
      }

      //  Step 2: PPR Alert — 85 days after Deworming or DOB if not done
      if (!ppr) {
        if (deworming) {
          const dewormingDate = moment(deworming.vaccineDate);
          const daysSinceDeworming = today.diff(dewormingDate, "days");
          if (daysSinceDeworming === 85) {
            console.log(
              ` ${uid}: Alert — Give *PPR* (85 days after Deworming)`
            );
          }
        } else if (daysSinceDOB === 85) {
          console.log(
            ` ${uid}: Alert — Give *PPR* (85 days after DOB, Deworming not found)`
          );
        }
      }

      //  Step 3: After PPR — Send alerts for each vaccine 15 days after its date
      if (ppr) {
        const pprDate = moment(ppr.vaccineDate);
        const vaccinesAfterPPR = vaccineData.filter((v) =>
          moment(v.vaccineDate).isAfter(pprDate)
        );

        vaccinesAfterPPR.forEach((vaccine) => {
          const vaccineDate = moment(vaccine.vaccineDate);
          const daysSinceVaccine = today.diff(vaccineDate, "days");

          if (daysSinceVaccine > 0 && daysSinceVaccine % 15 === 0) {
            console.log(
              ` ${uid}: Follow-up alert — ${vaccine.vaccineName} booster due (15 days after ${vaccine.vaccineDate})`
            );
          }
        });
      }
    });

    res.status(200).json({
      message: "Vaccine alert successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to alert vaccine data.",
      error: error.message,
    });
  }
});

// --------------------------------------------------------------------------

// Function to check and send vaccine alerts to users
exports.checkAndSendVaccineAlerts = asyncHandler(async () => {
  // try {
  //   // Get all animals with their vaccine records
  //   const animals = await Animal.find({}).select("uniqueId name birthDate uid");

  //   // Current date for comparison
  //   // const currentDate = new Date();
  //   const currentDate = "2021-04-25";

  //   // Track alerts to send
  //   const alertsToSend = [];

  //   // Process each animal
  //   for (const animal of animals) {
  //     // Skip if no date of birth
  //     if (!animal.birthDate) continue;

  //     const birthDate = new Date(animal.birthDate);
  //     const ageInDays = Math.ceil(
  //       (currentDate - birthDate) / (1000 * 60 * 60 * 24)
  //     );

  //     // Get vaccine record for this animal
  //     const vaccineRecord = await vaccineModal.findOne({
  //       animalUniqueId: animal.uniqueId,
  //     });

  //     if (!vaccineRecord) {
  //       // No vaccine record found, check if first deworming is due
  //       if (ageInDays >= 80 && ageInDays <= 85) {
  //         // First deworming due in 5 days or less
  //         alertsToSend.push({
  //           userId: animal.uid,
  //           animalId: animal.uniqueId,
  //           animalName: animal.name,
  //           alertType: "First Deworming",
  //           message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
  //           dueDate: new Date(birthDate.getTime() + 85 * 24 * 60 * 60 * 1000),
  //         });
  //         console.log(
  //           `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`
  //         );
  //       }
  //       continue;
  //     }

  //     // Check deworming status
  //     const dewormingEntries = vaccineRecord.vaccineData.filter((vaccine) => {
  //       if (Array.isArray(vaccine)) {
  //         return vaccine[0].toLowerCase().includes("deworming");
  //       } else if (typeof vaccine === "object") {
  //         return vaccine.vaccineName.toLowerCase().includes("deworming");
  //       }
  //       return false;
  //     });

  //     // Check if first deworming is needed (at 85 days)
  //     if (dewormingEntries.length === 0 && ageInDays >= 80 && ageInDays <= 85) {
  //       alertsToSend.push({
  //         userId: animal.uid,
  //         animalId: animal.uniqueId,
  //         animalName: animal.name,
  //         alertType: "First Deworming",
  //         message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
  //         dueDate: new Date(birthDate.getTime() + 85 * 24 * 60 * 60 * 1000),
  //       });
  //       console.log(
  //         `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`
  //       );
  //     }

  //     // Check if second deworming is needed (at 75 days)
  //     if (dewormingEntries.length === 1 && ageInDays >= 70 && ageInDays <= 75) {
  //       alertsToSend.push({
  //         userId: animal.uid,
  //         animalId: animal.uniqueId,
  //         animalName: animal.name,
  //         alertType: "Second Deworming",
  //         message: `Your animal ${animal.name} is due for second deworming. It should be done at 75 days of age.`,
  //         dueDate: new Date(birthDate.getTime() + 75 * 24 * 60 * 60 * 1000),
  //       });

  //       console.log(
  //         `Your animal ${animal.name} is due for second deworming. It should be done at 75 days of age.`
  //       );
  //     }

  //     // Get the latest vaccine date for PPR scheduling
  //     let lastVaccineDate = null;
  //     if (vaccineRecord.vaccineData && vaccineRecord.vaccineData.length > 0) {
  //       const vaccineDates = vaccineRecord.vaccineData
  //         .map((vaccine) => {
  //           if (Array.isArray(vaccine)) {
  //             return new Date(vaccine[1]);
  //           } else if (typeof vaccine === "object") {
  //             return new Date(vaccine.vaccineDate);
  //           }
  //           return null;
  //         })
  //         .filter((date) => date !== null);

  //       if (vaccineDates.length > 0) {
  //         lastVaccineDate = new Date(Math.max(...vaccineDates));
  //       }
  //     }

  //     // Check if there's a PPR vaccine already
  //     const hasPPR = vaccineRecord.vaccineData.some((vaccine) => {
  //       if (Array.isArray(vaccine)) {
  //         return vaccine[0].toLowerCase().includes("ppr");
  //       } else if (typeof vaccine === "object") {
  //         return vaccine.vaccineName.toLowerCase().includes("ppr");
  //       }
  //       return false;
  //     });

  //     // If there's a last vaccine date and no PPR yet, check if PPR is due (85 days after last vaccine)
  //     if (lastVaccineDate && !hasPPR) {
  //       const daysSinceLastVaccine = Math.ceil(
  //         (currentDate - lastVaccineDate) / (1000 * 60 * 60 * 24)
  //       );

  //       if (daysSinceLastVaccine >= 80 && daysSinceLastVaccine <= 85) {
  //         alertsToSend.push({
  //           userId: animal.uid,
  //           animalId: animal.uniqueId,
  //           animalName: animal.name,
  //           alertType: "PPR Vaccine",
  //           message: `Your animal ${animal.name} is due for PPR vaccine. It should be done 85 days after the last vaccine.`,
  //           dueDate: new Date(
  //             lastVaccineDate.getTime() + 85 * 24 * 60 * 60 * 1000
  //           ),
  //         });

  //         console.log(
  //           `Your animal ${animal.name} is due for PPR vaccine. It should be done 85 days after the last vaccine.`
  //         );
  //       }
  //     }
  //   }

  //   // Send alerts to users
  //   for (const alert of alertsToSend) {
  //     // Find the user to get notification preferences
  //     const user = await registerModel.findById(alert.uid);

  //     if (!user) continue;

  //     // // Store alert in database
  //     // await Alert.create({
  //     //   userId: alert.userId,
  //     //   animalId: alert.animalId,
  //     //   alertType: alert.alertType,
  //     //   message: alert.message,
  //     //   dueDate: alert.dueDate,
  //     //   isRead: false,
  //     //   createdAt: new Date(),
  //     // });

  //     // Send notification based on user preferences

  //     if (user) {
  //       // await sendEmail({
  //       //   email: user.email,
  //       //   subject: `Vaccination Alert for ${alert.animalName}`,
  //       //   message: alert.message,
  //       // });
  //       console.log("alert.message: ", alert.message);
  //     }

  //     // if (user.notificationPreferences?.email) {
  //     //   await sendEmail({
  //     //     email: user.email,
  //     //     subject: `Vaccination Alert for ${alert.animalName}`,
  //     //     message: alert.message,
  //     //   });
  //     // }

  //     // if (user.notificationPreferences?.sms && user.phone) {
  //     //   await sendSMS({
  //     //     phone: user.phone,
  //     //     message: alert.message,
  //     //   });
  //     // }

  //     // // Push notification can be sent if you have a mobile app
  //     // if (user.notificationPreferences?.push && user.deviceToken) {
  //     //   await sendPushNotification({
  //     //     deviceToken: user.deviceToken,
  //     //     title: `Vaccination Alert for ${alert.animalName}`,
  //     //     body: alert.message,
  //     //   });
  //     // }
  //   }

  //   return {
  //     success: true,
  //     alertsSent: alertsToSend.length,
  //     message: `Successfully checked and sent ${alertsToSend.length} vaccination alerts`,
  //   };
  // } catch (error) {
  //   console.error("Error sending vaccine alerts:", error);
  //   return {
  //     success: false,
  //     message: `Failed to send vaccination alerts: ${error.message}`,
  //   };
  // }

  // try {
  //   // Get all animals with their vaccine records
  //   const animals = await Animal.find({}).select("uniqueId name birthDate uid");

  //   // Current date for comparison
  //   const currentDate = moment("2021-05-06");

  //   // Track alerts to send
  //   const alertsToSend = [];

  //   // Process each animal
  //   for (const animal of animals) {
  //     // Skip if no date of birth
  //     if (!animal.birthDate) continue;

  //     const birthDate = moment(animal.birthDate);
  //     const ageInDays = currentDate.diff(birthDate, "days");

  //     // Get vaccine record for this animal
  //     const vaccineRecord = await vaccineModal.findOne({
  //       animalUniqueId: animal.uniqueId,
  //     });

  //     if (!vaccineRecord) {
  //       // No vaccine record found, check if first deworming is due
  //       if (ageInDays >= 80 && ageInDays <= 85) {
  //         alertsToSend.push({
  //           userId: animal.uid,
  //           animalId: animal.uniqueId,
  //           animalName: animal.name,
  //           alertType: "First Deworming",
  //           message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
  //           dueDate: birthDate.clone().add(85, "days").toDate(),
  //         });
  //         console.log(
  //           `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`
  //         );
  //       }
  //       continue;
  //     }

  //     // Check deworming status
  //     const dewormingEntries = vaccineRecord.vaccineData.filter((vaccine) => {
  //       if (Array.isArray(vaccine)) {
  //         return vaccine[0].toLowerCase().includes("deworming");
  //       } else if (typeof vaccine === "object") {
  //         return vaccine.vaccineName.toLowerCase().includes("deworming");
  //       }
  //       return false;
  //     });

  //     // First deworming
  //     if (dewormingEntries.length === 0 && ageInDays >= 80 && ageInDays <= 85) {
  //       alertsToSend.push({
  //         userId: animal.uid,
  //         animalId: animal.uniqueId,
  //         animalName: animal.name,
  //         alertType: "First Deworming",
  //         message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
  //         dueDate: birthDate.clone().add(85, "days").toDate(),
  //       });
  //       console.log(
  //         `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`
  //       );
  //     }

  //     // Second deworming
  //     if (dewormingEntries.length === 1 && ageInDays >= 70 && ageInDays <= 75) {
  //       alertsToSend.push({
  //         userId: animal.uid,
  //         animalId: animal.uniqueId,
  //         animalName: animal.name,
  //         alertType: "Second Deworming",
  //         message: `Your animal ${animal.name} is due for second deworming. It should be done at 75 days of age.`,
  //         dueDate: birthDate.clone().add(75, "days").toDate(),
  //       });
  //       console.log(
  //         `Your animal ${animal.name} is due for second deworming. It should be done at 75 days of age.`
  //       );
  //     }

  //     // // PPR vaccine check
  //     // let lastVaccineDate = null;
  //     // if (vaccineRecord.vaccineData && vaccineRecord.vaccineData.length > 0) {
  //     //   const vaccineDates = vaccineRecord.vaccineData
  //     //     .map((vaccine) => {
  //     //       if (Array.isArray(vaccine)) {
  //     //         return moment(vaccine[1]);
  //     //       } else if (typeof vaccine === "object") {
  //     //         return moment(vaccine.vaccineDate);
  //     //       }
  //     //       return null;
  //     //     })
  //     //     .filter((date) => date && date.isValid());

  //     //   if (vaccineDates.length > 0) {
  //     //     lastVaccineDate = moment.max(vaccineDates);
  //     //   }
  //     // }

  //     // const hasPPR = vaccineRecord.vaccineData.some((vaccine) => {
  //     //   if (Array.isArray(vaccine)) {
  //     //     return vaccine[0].toLowerCase().includes("ppr");
  //     //   } else if (typeof vaccine === "object") {
  //     //     return vaccine.vaccineName.toLowerCase().includes("ppr");
  //     //   }
  //     //   return false;
  //     // });

  //     // if (lastVaccineDate && !hasPPR) {
  //     //   const daysSinceLastVaccine = currentDate.diff(lastVaccineDate, "days");

  //     //   if (daysSinceLastVaccine >= 80 && daysSinceLastVaccine <= 85) {
  //     //     alertsToSend.push({
  //     //       userId: animal.uid,
  //     //       animalId: animal.uniqueId,
  //     //       animalName: animal.name,
  //     //       alertType: "PPR Vaccine",
  //     //       message: `Your animal ${animal.name} is due for PPR vaccine. It should be done 85 days after the last vaccine.`,
  //     //       dueDate: lastVaccineDate.clone().add(85, "days").toDate(),
  //     //     });
  //     //     console.log(
  //     //       `Your animal ${animal.uniqueId} is due for PPR vaccine. It should be done 85 days after the last vaccine.`
  //     //     );
  //     //   }
  //     // }

  //   }

  //   // Send alerts to users
  //   for (const alert of alertsToSend) {
  //     const user = await registerModel.findOne({ uid: alert.userId });
  //     if (!user) continue;

  //     // Store alert in DB (optional)
  //     // await Alert.create({
  //     //   userId: alert.userId,
  //     //   animalId: alert.animalId,
  //     //   alertType: alert.alertType,
  //     //   message: alert.message,
  //     //   dueDate: alert.dueDate,
  //     //   isRead: false,
  //     //   createdAt: new Date(),
  //     // });

  //     // Send notification
  //     console.log("alert.message: ", alert.userId);

  //     // Optional: send via email, SMS, push if required
  //   }

  //   return {
  //     success: true,
  //     alertsSent: alertsToSend.length,
  //     message: `Successfully checked and sent ${alertsToSend.length} vaccination alerts`,
  //   };
  // } catch (error) {
  //   console.error("Error sending vaccine alerts:", error);
  //   return {
  //     success: false,
  //     message: `Failed to send vaccination alerts: ${error.message}`,
  //   };
  // }

  // final tested
  // try {
  //   // Get all animals with their vaccine records
  //   const animals = await Animal.find({}).select("uniqueId name birthDate uid");

  //   // Current date for comparison
  //   const currentDate = moment("2021-05-06");

  //   // Track alerts to send
  //   const alertsToSend = [];

  //   // Process each animal
  //   for (const animal of animals) {
  //     // Skip if no date of birth
  //     if (!animal.birthDate) continue;

  //     const birthDate = moment(animal.birthDate);
  //     const ageInDays = currentDate.diff(birthDate, "days");

  //     // Get vaccine record for this animal
  //     const vaccineRecord = await vaccineModal.findOne({
  //       animalUniqueId: animal.uniqueId,
  //     });

  //     if (!vaccineRecord) {
  //       // No vaccine record found, check if first deworming is due
  //       if (ageInDays >= 80 && ageInDays <= 85) {
  //         alertsToSend.push({
  //           userId: animal.uid,
  //           animalId: animal.uniqueId,
  //           animalName: animal.name,
  //           alertType: "First Deworming",
  //           message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
  //           dueDate: birthDate.clone().add(85, "days").toDate(),
  //         });
  //         console.log(
  //           `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`
  //         );
  //       }
  //       continue;
  //     }

  //     // Ensure vaccineData exists and is an array
  //     const vaccineData = Array.isArray(vaccineRecord.vaccineData)
  //       ? vaccineRecord.vaccineData
  //       : [];

  //     // Check deworming status
  //     const dewormingEntries = vaccineData.filter((vaccine) => {
  //       if (Array.isArray(vaccine)) {
  //         return vaccine[0]?.toLowerCase().includes("deworming");
  //       } else if (typeof vaccine === "object") {
  //         return vaccine.vaccineName?.toLowerCase().includes("deworming");
  //       }
  //       return false;
  //     });

  //     // Check for deworming based on age if no deworming records exist
  //     if (ageInDays >= 80 && ageInDays <= 85) {
  //       // Either no deworming records found or the array is empty
  //       if (dewormingEntries.length === 0) {
  //         alertsToSend.push({
  //           userId: animal.uid,
  //           animalId: animal.uniqueId,
  //           animalName: animal.name,
  //           alertType: "First Deworming",
  //           message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
  //           dueDate: birthDate.clone().add(85, "days").toDate(),
  //         });
  //         console.log(
  //           `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`
  //         );
  //       }
  //     }

  //     // Second deworming (only check if first deworming exists)
  //     if (dewormingEntries.length === 1 && ageInDays >= 70 && ageInDays <= 75) {
  //       alertsToSend.push({
  //         userId: animal.uid,
  //         animalId: animal.uniqueId,
  //         animalName: animal.name,
  //         alertType: "Second Deworming",
  //         message: `Your animal ${animal.name} is due for second deworming. It should be done at 75 days of age.`,
  //         dueDate: birthDate.clone().add(75, "days").toDate(),
  //       });
  //       console.log(
  //         `Your animal ${animal.name} is due for second deworming. It should be done at 75 days of age.`
  //       );
  //     }

  //     // PPR vaccine check - handle case where vaccineData may not exist
  //     const pprEntries = (vaccineRecord.vaccineData || []).filter((vaccine) => {
  //       if (Array.isArray(vaccine)) {
  //         return vaccine[0]?.toLowerCase().includes("ppr");
  //       } else if (typeof vaccine === "object") {
  //         return vaccine.vaccineName?.toLowerCase().includes("ppr");
  //       }
  //       return false;
  //     });

  //     // Check for first PPR vaccine
  //     const hasPPR = pprEntries.length > 0;

  //     // Check if second PPR vaccine is needed (15 days after first PPR)
  //     if (hasPPR && pprEntries.length === 1) {
  //       let firstPPRDate = null;

  //       // Get the date of the first PPR vaccine
  //       if (Array.isArray(pprEntries[0])) {
  //         firstPPRDate = moment(pprEntries[0][1]);
  //       } else if (typeof pprEntries[0] === "object") {
  //         firstPPRDate = moment(pprEntries[0].vaccineDate);
  //       }

  //       if (firstPPRDate) {
  //         const daysSinceFirstPPR = currentDate.diff(firstPPRDate, "days");

  //         // Alert if between 13-15 days since first PPR
  //         if (daysSinceFirstPPR >= 13 && daysSinceFirstPPR <= 15) {
  //           alertsToSend.push({
  //             userId: animal.uid,
  //             animalId: animal.uniqueId,
  //             animalName: animal.name,
  //             alertType: "Second PPR Vaccine",
  //             message: `Your animal ${animal.name} is due for the second PPR vaccine. It should be done 15 days after the first PPR vaccine.`,
  //             dueDate: firstPPRDate.clone().add(15, "days").toDate(),
  //           });
  //           console.log(
  //             `Your animal ${animal.name} is due for the second PPR vaccine. It should be done 15 days after the first PPR vaccine.`
  //           );
  //         }
  //       }
  //     }

  //     // Check if animal needs first PPR vaccine
  //     let lastVaccineDate = null;
  //     if (
  //       vaccineRecord.vaccineData &&
  //       Array.isArray(vaccineRecord.vaccineData) &&
  //       vaccineRecord.vaccineData.length > 0
  //     ) {
  //       const vaccineDates = vaccineRecord.vaccineData
  //         .map((vaccine) => {
  //           if (Array.isArray(vaccine) && vaccine.length > 1) {
  //             return moment(vaccine[1]);
  //           } else if (typeof vaccine === "object" && vaccine.vaccineDate) {
  //             return moment(vaccine.vaccineDate);
  //           }
  //           return null;
  //         })
  //         .filter((date) => date && date.isValid());

  //       if (vaccineDates.length > 0) {
  //         lastVaccineDate = moment.max(vaccineDates);
  //       }
  //     }

  //     if (lastVaccineDate && !hasPPR) {
  //       const daysSinceLastVaccine = currentDate.diff(lastVaccineDate, "days");

  //       if (daysSinceLastVaccine >= 80 && daysSinceLastVaccine <= 85) {
  //         alertsToSend.push({
  //           userId: animal.uid,
  //           animalId: animal.uniqueId,
  //           animalName: animal.name,
  //           alertType: "PPR Vaccine",
  //           message: `Your animal ${animal.name} is due for PPR vaccine. It should be done 85 days after the last vaccine.`,
  //           dueDate: lastVaccineDate.clone().add(85, "days").toDate(),
  //         });
  //         console.log(
  //           `Your animal ${animal.uniqueId} is due for PPR vaccine. It should be done 85 days after the last vaccine.`
  //         );
  //       }
  //     }
  //   }

  //   // Send alerts to users
  //   for (const alert of alertsToSend) {
  //     const user = await registerModel.findOne({ uid: alert.userId });
  //     if (!user) continue;

  //     // Store alert in DB (optional)
  //     // await Alert.create({
  //     //   userId: alert.userId,
  //     //   animalId: alert.animalId,
  //     //   alertType: alert.alertType,
  //     //   message: alert.message,
  //     //   dueDate: alert.dueDate,
  //     //   isRead: false,
  //     //   createdAt: new Date(),
  //     // });

  //     // Send notification
  //     console.log("alert.message: ", alert.userId);

  //     // Optional: send via email, SMS, push if required
  //   }

  //   return {
  //     success: true,
  //     alertsSent: alertsToSend.length,
  //     message: `Successfully checked and sent ${alertsToSend.length} vaccination alerts`,
  //   };
  // } catch (error) {
  //   console.error("Error sending vaccine alerts:", error);
  //   return {
  //     success: false,
  //     message: `Failed to send vaccination alerts: ${error.message}`,
  //   };
  // }

  // try {
  //   // Get all animals with their vaccine records
  //   const animals = await Animal.find({}).select("uniqueId name birthDate uid");

  //   // Current date for comparison
  //   const currentDate = moment("2021-05-06");

  //   // Track alerts to send
  //   const alertsToSend = [];

  //   // Process each animal
  //   for (const animal of animals) {
  //     // Skip if no date of birth
  //     if (!animal.birthDate) continue;

  //     const birthDate = moment(animal.birthDate);
  //     const ageInDays = currentDate.diff(birthDate, "days");

  //     // Get vaccine record for this animal
  //     const vaccineRecord = await vaccineModal.findOne({
  //       animalUniqueId: animal.uniqueId,
  //     });

  //     if (!vaccineRecord) {
  //       // No vaccine record found, check if first deworming is due
  //       if (ageInDays >= 80 && ageInDays <= 85) {
  //         alertsToSend.push({
  //           userId: animal.uid,
  //           animalId: animal.uniqueId,
  //           animalName: animal.name,
  //           alertType: "First Deworming",
  //           message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
  //           dueDate: birthDate.clone().add(85, "days").toDate(),
  //         });
  //         console.log(
  //           `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`
  //         );
  //       }
  //       continue;
  //     }

  //     // Ensure vaccineData exists and is an array
  //     const vaccineData = Array.isArray(vaccineRecord.vaccineData)
  //       ? vaccineRecord.vaccineData
  //       : [];

  //     // ========================
  //     // DEWORMING CHECKS (FIRST)
  //     // ========================

  //     // Check deworming status
  //     const dewormingEntries = vaccineData.filter((vaccine) => {
  //       if (Array.isArray(vaccine)) {
  //         return vaccine[0]?.toLowerCase().includes("deworming");
  //       } else if (typeof vaccine === "object") {
  //         return vaccine.vaccineName?.toLowerCase().includes("deworming");
  //       }
  //       return false;
  //     });

  //     // Check for deworming based on age if no deworming records exist
  //     if (ageInDays >= 80 && ageInDays <= 85) {
  //       // Either no deworming records found or the array is empty
  //       if (dewormingEntries.length === 0) {
  //         alertsToSend.push({
  //           userId: animal.uid,
  //           animalId: animal.uniqueId,
  //           animalName: animal.name,
  //           alertType: "First Deworming",
  //           message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
  //           dueDate: birthDate.clone().add(85, "days").toDate(),
  //         });
  //         console.log(
  //           `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`
  //         );
  //       }
  //     }

  //     // Second deworming (only check if first deworming exists)
  //     if (dewormingEntries.length === 1 && ageInDays >= 70 && ageInDays <= 75) {
  //       alertsToSend.push({
  //         userId: animal.uid,
  //         animalId: animal.uniqueId,
  //         animalName: animal.name,
  //         alertType: "Second Deworming",
  //         message: `Your animal ${animal.name} is due for second deworming. It should be done at 75 days of age.`,
  //         dueDate: birthDate.clone().add(75, "days").toDate(),
  //       });
  //       console.log(
  //         `Your animal ${animal.name} is due for second deworming. It should be done at 75 days of age.`
  //       );
  //     }

  //     // ===================
  //     // PPR VACCINE CHECKS
  //     // ===================

  //     // PPR vaccine check - handle case where vaccineData may not exist
  //     const pprEntries = (vaccineRecord.vaccineData || []).filter((vaccine) => {
  //       if (Array.isArray(vaccine)) {
  //         return vaccine[0]?.toLowerCase().includes("ppr");
  //       } else if (typeof vaccine === "object") {
  //         return vaccine.vaccineName?.toLowerCase().includes("ppr");
  //       }
  //       return false;
  //     });

  //     // Check for first PPR vaccine
  //     const hasPPR = pprEntries.length > 0;

  //     // Check if second PPR vaccine is needed (15 days after first PPR)
  //     if (hasPPR && pprEntries.length === 1) {
  //       let firstPPRDate = null;

  //       // Get the date of the first PPR vaccine
  //       if (Array.isArray(pprEntries[0])) {
  //         firstPPRDate = moment(pprEntries[0][1]);
  //       } else if (typeof pprEntries[0] === "object") {
  //         firstPPRDate = moment(pprEntries[0].vaccineDate);
  //       }

  //       if (firstPPRDate) {
  //         const daysSinceFirstPPR = currentDate.diff(firstPPRDate, "days");

  //         // Alert if between 13-15 days since first PPR
  //         if (daysSinceFirstPPR >= 13 && daysSinceFirstPPR <= 15) {
  //           alertsToSend.push({
  //             userId: animal.uid,
  //             animalId: animal.uniqueId,
  //             animalName: animal.name,
  //             alertType: "Second PPR Vaccine",
  //             message: `Your animal ${animal.name} is due for the second PPR vaccine. It should be done 15 days after the first PPR vaccine.`,
  //             dueDate: firstPPRDate.clone().add(15, "days").toDate(),
  //           });
  //           console.log(
  //             `Your animal ${animal.name} is due for the second PPR vaccine. It should be done 15 days after the first PPR vaccine.`
  //           );
  //         }
  //       }
  //     }

  //     // Check if animal needs first PPR vaccine
  //     let lastVaccineDate = null;
  //     if (
  //       vaccineRecord.vaccineData &&
  //       Array.isArray(vaccineRecord.vaccineData) &&
  //       vaccineRecord.vaccineData.length > 0
  //     ) {
  //       const vaccineDates = vaccineRecord.vaccineData
  //         .map((vaccine) => {
  //           if (Array.isArray(vaccine) && vaccine.length > 1) {
  //             return moment(vaccine[1]);
  //           } else if (typeof vaccine === "object" && vaccine.vaccineDate) {
  //             return moment(vaccine.vaccineDate);
  //           }
  //           return null;
  //         })
  //         .filter((date) => date && date.isValid());

  //       if (vaccineDates.length > 0) {
  //         lastVaccineDate = moment.max(vaccineDates);
  //       }
  //     }

  //     if (lastVaccineDate && !hasPPR) {
  //       const daysSinceLastVaccine = currentDate.diff(lastVaccineDate, "days");

  //       if (daysSinceLastVaccine >= 80 && daysSinceLastVaccine <= 85) {
  //         alertsToSend.push({
  //           userId: animal.uid,
  //           animalId: animal.uniqueId,
  //           animalName: animal.name,
  //           alertType: "PPR Vaccine",
  //           message: `Your animal ${animal.name} is due for PPR vaccine. It should be done 85 days after the last vaccine.`,
  //           dueDate: lastVaccineDate.clone().add(85, "days").toDate(),
  //         });
  //         console.log(
  //           `Your animal ${animal.uniqueId} is due for PPR vaccine. It should be done 85 days after the last vaccine.`
  //         );
  //       }
  //     }

  //     // ===============================
  //     // OTHER VACCINES (CHECKED LAST)
  //     // ===============================

  //     // Define list of known vaccines we already checked
  //     const knownVaccineTypes = ["ppr", "deworming"];

  //     // Find any other vaccines that might need boosters
  //     const otherVaccines = (vaccineRecord.vaccineData || []).filter(
  //       (vaccine) => {
  //         const vaccineName = Array.isArray(vaccine)
  //           ? (vaccine[0] || "").toLowerCase()
  //           : ((vaccine && vaccine.vaccineName) || "").toLowerCase();

  //         // Filter out vaccines we've already handled
  //         return (
  //           vaccineName &&
  //           !knownVaccineTypes.some((type) => vaccineName.includes(type))
  //         );
  //       }
  //     );

  //     // Process other vaccines
  //     for (const vaccine of otherVaccines) {
  //       const vaccineName = Array.isArray(vaccine)
  //         ? vaccine[0]
  //         : vaccine.vaccineName;

  //       const vaccineDate = Array.isArray(vaccine)
  //         ? moment(vaccine[1])
  //         : moment(vaccine.vaccineDate);

  //       if (vaccineDate && vaccineDate.isValid()) {
  //         // Default booster interval of 180 days (6 months) for other vaccines
  //         // You might want to customize this based on specific vaccine types
  //         const boosterDueDate = vaccineDate.clone().add(180, "days");
  //         const daysUntilBooster = boosterDueDate.diff(currentDate, "days");

  //         // Alert if booster is due within the next 7 days
  //         if (daysUntilBooster >= 0 && daysUntilBooster <= 7) {
  //           alertsToSend.push({
  //             userId: animal.uid,
  //             animalId: animal.uniqueId,
  //             animalName: animal.name,
  //             alertType: `${vaccineName} Booster`,
  //             message: `Your animal ${animal.name} is due for ${vaccineName} booster. It should be done 180 days after the previous dose.`,
  //             dueDate: boosterDueDate.toDate(),
  //           });
  //           console.log(
  //             `Your animal ${animal.name} is due for ${vaccineName} booster. It should be done 180 days after the previous dose.`
  //           );
  //         }
  //       }
  //     }
  //   }

  //   // Send alerts to users
  //   for (const alert of alertsToSend) {
  //     const user = await registerModel.findOne({ uid: alert.userId });
  //     if (!user) continue;

  //     // Store alert in DB (optional)
  //     // await Alert.create({
  //     //   userId: alert.userId,
  //     //   animalId: alert.animalId,
  //     //   alertType: alert.alertType,
  //     //   message: alert.message,
  //     //   dueDate: alert.dueDate,
  //     //   isRead: false,
  //     //   createdAt: new Date(),
  //     // });

  //     // Send notification
  //     console.log("alert.message: ", alert.userId);

  //     // Optional: send via email, SMS, push if required
  //   }

  //   return {
  //     success: true,
  //     alertsSent: alertsToSend.length,
  //     message: `Successfully checked and sent ${alertsToSend.length} vaccination alerts`,
  //   };
  // } catch (error) {
  //   console.error("Error sending vaccine alerts:", error);
  //   return {
  //     success: false,
  //     message: `Failed to send vaccination alerts: ${error.message}`,
  //   };
  // }
  await processAlerts();
});

// Function to manually trigger alerts for a specific animal
exports.sendVaccineAlertForAnimal = asyncHandler(async (req, res) => {
  const { animalUniqueId } = req.params;

  try {
    const animal = await Animal.findOne({ uniqueId: animalUniqueId });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    // Check vaccination status
    const birthDate = new Date(animal.dateOfBirth);
    const currentDate = new Date();
    const ageInDays = Math.ceil(
      (currentDate - birthDate) / (1000 * 60 * 60 * 24)
    );

    const vaccineRecord = await vaccineModal.findOne({ animalUniqueId });

    // Determine next required vaccines
    const requiredVaccines = [];

    // Check for deworming
    const dewormingEntries =
      vaccineRecord?.vaccineData?.filter((vaccine) => {
        if (Array.isArray(vaccine)) {
          return vaccine[0].toLowerCase().includes("deworming");
        } else if (typeof vaccine === "object") {
          return vaccine.vaccineName.toLowerCase().includes("deworming");
        }
        return false;
      }) || [];

    if (dewormingEntries.length === 0) {
      if (ageInDays < 85) {
        requiredVaccines.push({
          type: "First Deworming",
          dueDate: new Date(birthDate.getTime() + 85 * 24 * 60 * 60 * 1000),
          daysUntilDue: 85 - ageInDays,
        });
      } else {
        requiredVaccines.push({
          type: "First Deworming",
          dueDate: "Overdue",
          daysOverdue: ageInDays - 85,
        });
      }
    } else if (dewormingEntries.length === 1) {
      if (ageInDays < 75) {
        requiredVaccines.push({
          type: "Second Deworming",
          dueDate: new Date(birthDate.getTime() + 75 * 24 * 60 * 60 * 1000),
          daysUntilDue: 75 - ageInDays,
        });
      } else {
        requiredVaccines.push({
          type: "Second Deworming",
          dueDate: "Overdue",
          daysOverdue: ageInDays - 75,
        });
      }
    }

    // Check for PPR vaccine
    const hasPPR =
      vaccineRecord?.vaccineData?.some((vaccine) => {
        if (Array.isArray(vaccine)) {
          return vaccine[0].toLowerCase().includes("ppr");
        } else if (typeof vaccine === "object") {
          return vaccine.vaccineName.toLowerCase().includes("ppr");
        }
        return false;
      }) || false;

    // Get latest vaccine date
    let lastVaccineDate = null;
    if (vaccineRecord?.vaccineData && vaccineRecord.vaccineData.length > 0) {
      const vaccineDates = vaccineRecord.vaccineData
        .map((vaccine) => {
          if (Array.isArray(vaccine)) {
            return new Date(vaccine[1]);
          } else if (typeof vaccine === "object") {
            return new Date(vaccine.vaccineDate);
          }
          return null;
        })
        .filter((date) => date !== null);

      if (vaccineDates.length > 0) {
        lastVaccineDate = new Date(Math.max(...vaccineDates));
      }
    }

    if (lastVaccineDate && !hasPPR) {
      const daysSinceLastVaccine = Math.ceil(
        (currentDate - lastVaccineDate) / (1000 * 60 * 60 * 24)
      );
      const daysUntilPPR = 85 - daysSinceLastVaccine;

      if (daysUntilPPR > 0) {
        requiredVaccines.push({
          type: "PPR Vaccine",
          dueDate: new Date(
            lastVaccineDate.getTime() + 85 * 24 * 60 * 60 * 1000
          ),
          daysUntilDue: daysUntilPPR,
        });
      } else {
        requiredVaccines.push({
          type: "PPR Vaccine",
          dueDate: "Overdue",
          daysOverdue: -daysUntilPPR,
        });
      }
    }

    // Send alert if there are required vaccines
    if (requiredVaccines.length > 0) {
      // Find the user
      const user = await registerModel.findById(animal.uid);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Owner not found",
        });
      }

      // Create alert messages
      for (const vaccine of requiredVaccines) {
        let message = "";

        if (vaccine.dueDate === "Overdue") {
          message = `Your animal ${animal.name} is overdue for ${vaccine.type} by ${vaccine.daysOverdue} days.`;
        } else {
          message = `Your animal ${animal.name} will be due for ${
            vaccine.type
          } in ${
            vaccine.daysUntilDue
          } days (${vaccine.dueDate.toDateString()}).`;
        }

        // Store alert in database
        await Alert.create({
          userId: user._id,
          animalId: animal.uniqueId,
          alertType: vaccine.type,
          message: message,
          dueDate:
            vaccine.dueDate !== "Overdue" ? vaccine.dueDate : currentDate,
          isRead: false,
          createdAt: new Date(),
        });

        // Send notification based on user preferences
        if (user.notificationPreferences?.email) {
          await sendEmail({
            email: user.email,
            subject: `Vaccination Alert for ${animal.name}`,
            message: message,
          });
        }

        if (user.notificationPreferences?.sms && user.phone) {
          await sendSMS({
            phone: user.phone,
            message: message,
          });
        }

        if (user.notificationPreferences?.push && user.deviceToken) {
          await sendPushNotification({
            deviceToken: user.deviceToken,
            title: `Vaccination Alert for ${animal.name}`,
            body: message,
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Successfully sent ${requiredVaccines.length} vaccination alerts for animal ${animal.name}`,
        requiredVaccines,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `No vaccination alerts needed for animal ${animal.name}`,
        requiredVaccines: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to send vaccination alerts: ${error.message}`,
    });
  }
});

// Mock data: animals
const animals = [
  {
    uniqueId: "gree-01",
    name: "Bessie",
    birthDate: "2025-01-01",
    uid: "RAZ1234",
  },
  // {
  //   uniqueId: "gree-02",
  //   name: "Daisy",
  //   birthDate: "2021-03-22",
  //   uid: "RAZ1233",
  // },
  // {
  //   uniqueId: "gree-03",
  //   name: "MooMoo",
  //   birthDate: "2021-04-10",
  //   uid: "RAZ1235",
  // },
  // {
  //   uniqueId: "gree-04",
  //   name: "Lulu",
  //   birthDate: "2021-01-01",
  //   uid: "RAZ1236",
  // },
  // {
  //   uniqueId: "gree-05",
  //   name: "Bella",
  //   birthDate: null,
  //   uid: "RAZ1237",
  // },
  // {
  //   uniqueId: "gree-06",
  //   name: "Tommy",
  //   birthDate: "2021-02-15",
  //   uid: "RAZ1238",
  // },
];

// Mock vaccine records
// const vaccineRecords = [
//   {
//     animalUniqueId: "gree-01",
//     vaccineData: [],
//   },
//   {
//     animalUniqueId: "gree-02",
//     vaccineData: [
//       { vaccineName: "PPR", vaccineDate: "2023-08-15" },
//       { vaccineName: "Hepatitis", vaccineDate: "2022-11-01" },
//     ],
//   },
//   {
//     animalUniqueId: "gree-03",
//     vaccineData: [{ vaccineName: "Deworming", vaccineDate: "2021-04-10" }],
//   },
//   {
//     animalUniqueId: "gree-04",
//     vaccineData: [{ vaccineName: "Deworming", vaccineDate: "2021-01-01" }],
//   },
//   {
//     animalUniqueId: "gree-06",
//     vaccineData: [{ vaccineName: "Rabies", vaccineDate: "2022-11-01" }],
//   },
// ];
const vaccineRecords = [
  // {
  //   animalUniqueId: "gree-01",
  //   vaccineData: [
  //     // No vaccines yet, will trigger first deworming alert at ~85 days
  //   ],
  // },
  {
    animalUniqueId: "gree-01",
    vaccineData: [
      { vaccineName: "Deworming", vaccineDate: "2025-03-17" },
      { vaccineName: "PPR", vaccineDate: "2025-03-24" },
      { vaccineName: "Rabies", vaccineDate: "2022-04-01" },
    ],
  },
  // {
  //   animalUniqueId: "gree-03",
  //   vaccineData: [
  //     { vaccineName: "Deworming", vaccineDate: "2024-12-30" },
  //     { vaccineName: "PPR", vaccineDate: "2025-02-01" },
  //     { vaccineName: "ET + TT", vaccineDate: "2025-03-02" },
  //     { vaccineName: "HS", vaccineDate: "2025-03-20" },
  //     { vaccineName: "FMD", vaccineDate: "2025-04-15" },
  //   ],
  // },
  // {
  //   animalUniqueId: "gree-04",
  //   vaccineData: [
  //     { vaccineName: "Deworming", vaccineDate: "2025-01-01" },
  //     { vaccineName: "PPR", vaccineDate: "2023-05-01" },
  //     { vaccineName: "ET + TT", vaccineDate: "2023-05-16" },
  //     // No HS or FMD yet, should trigger booster alerts close to due date
  //   ],
  // },
  // {
  //   animalUniqueId: "gree-06",
  //   vaccineData: [
  //     { vaccineName: "Rabies", vaccineDate: "2022-11-01" },
  //     { vaccineName: "PPR", vaccineDate: "2023-01-15" },
  //     // No booster yet, can test booster alerts
  //   ],
  // },
];

// Helper: get vaccine record for an animal
function getVaccineRecord(animalId) {
  return (
    vaccineRecords.find((rec) => rec.animalUniqueId === animalId) || {
      vaccineData: [],
    }
  );
}

// Main function
async function processAlerts() {
  const currentDate = moment("2025-04-06");
  const alertsToSend = [];

  for (const animal of animals) {
    if (!animal.birthDate) continue; // skip if no DOB
    const birthDate = moment(animal.birthDate);
    const ageInDays = currentDate.diff(birthDate, "days");
    const vaccineRecord = getVaccineRecord(animal.uniqueId);
    const vaccineData = Array.isArray(vaccineRecord.vaccineData)
      ? vaccineRecord.vaccineData
      : [];

    // Check if vaccine record exists
    if (vaccineData.length === 0) {
      // No vaccine record, check for first deworming
      if (ageInDays >= 75 && ageInDays <= 77) {
        alertsToSend.push({
          userId: animal.uid,
          animalId: animal.uniqueId,
          animalName: animal.name,
          alertType: "First Deworming",
          message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
          dueDate: birthDate.clone().add(85, "days").toDate(),
        });
        console.log(
          `Alert: ${animal.name} due for first deworming at 85 days.`
        );
      }
      continue;
    }

    // Check deworming
    const dewormingRecords = vaccineData.filter((v) => {
      const name = (v.vaccineName || "").toLowerCase();
      return name.includes("deworming");
    });
    // First deworming check
    if (ageInDays >= 70 && ageInDays <= 75 && dewormingRecords.length === 0) {
      alertsToSend.push({
        userId: animal.uid,
        animalId: animal.uniqueId,
        animalName: animal.name,
        alertType: "First Deworming",
        message: ` Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
        dueDate: birthDate.clone().add(85, "days").toDate(),
      });
      console.log(`Alert: ${animal.name} due for first deworming at 85 days.`);
    }

    // PPR vaccine checks
    const pprRecordsFilter = vaccineData.filter((v) => {
      const name = (v.vaccineName || "").toLowerCase();
      return name.includes("ppr");
    });
    const hasPPR = pprRecordsFilter.length > 0;

    // Check if animal needs first PPR vaccine (if no PPR yet)
    if (!hasPPR) {
      // Use date of birth instead of last vaccine date
      const birthDate = moment(animal.birthDate);
      const ageInDays = currentDate.diff(birthDate, "days");

      if (ageInDays >= 82 && ageInDays <= 85) {
        alertsToSend.push({
          userId: animal.uid,
          animalId: animal.uniqueId,
          animalName: animal.name,
          alertType: "PPR Vaccine",
          message: `Your animal ${animal.name} is due for PPR vaccine. It should be done at 85 days of age.`,
          dueDate: birthDate.clone().add(85, "days").toDate(),
        });
        console.log(
          `Alert: ${animal.name} due for PPR vaccine (85 days after birth).`
        );
      }
    }

    // Find PPR records by name for second PPR check
    const pprRecords = vaccineData.filter(
      (record) => record.vaccineName === "PPR"
    );

    // Loop through all PPR records to check for second PPR vaccine
    for (const pprRecord of pprRecords) {
      const pprDate = moment(pprRecord.vaccineDate);
      const daysSincePPR = currentDate.diff(pprDate, "days");

      if (daysSincePPR >= 13 && daysSincePPR <= 15) {
        alertsToSend.push({
          userId: animal.uid,
          animalId: animal.uniqueId,
          animalName: animal.name,
          alertType: "Second PPR Vaccine",
          message: `Your animal ${animal.name} is due for the second PPR vaccine. It should be done 15 days after the first PPR vaccine.`,
          dueDate: pprDate.clone().add(15, "days").toDate(),
        });
        console.log(
          `Alert: ${animal.name} due for second PPR vaccine (15 days after first).`
        );
      }
    }

    // Find ET + TT records by name for check after PPR
    const etTtRecords = vaccineData.filter(
      (record) => record.vaccineName === "ET + TT"
    );

    // Check for ET + TT vaccine (should be given 15 days after PPR)
    for (const pprRecord of pprRecords) {
      const pprDate = moment(pprRecord.vaccineDate);
      const daysSincePPR = currentDate.diff(pprDate, "days");

      // Check if ET + TT is already given for this PPR
      const hasEtTtAfterPpr = etTtRecords.some((record) => {
        const etTtDate = moment(record.vaccineDate);
        return (
          etTtDate.isAfter(pprDate) && etTtDate.diff(pprDate, "days") >= 15
        );
      });

      if (!hasEtTtAfterPpr && daysSincePPR >= 13 && daysSincePPR <= 15) {
        alertsToSend.push({
          userId: animal.uid,
          animalId: animal.uniqueId,
          animalName: animal.name,
          alertType: "ET + TT Vaccine",
          message: `Your animal ${animal.name} is due for ET + TT vaccine. It should be done 15 days after the PPR vaccine.`,
          dueDate: pprDate.clone().add(15, "days").toDate(),
        });
        console.log(
          `Alert: ${animal.name} due for ET + TT vaccine (15 days after PPR)`
        );
      }
    }

    // Find HS records by name for check after ET + TT
    const hsRecords = vaccineData.filter(
      (record) => record.vaccineName === "HS"
    );

    // Check for HS vaccine (should be given 15 days after ET + TT)
    for (const etTtRecord of etTtRecords) {
      const etTtDate = moment(etTtRecord.vaccineDate);
      const daysSinceEtTt = currentDate.diff(etTtDate, "days");

      // Check if HS is already given for this ET + TT
      const hasHsAfterEtTt = hsRecords.some((record) => {
        const hsDate = moment(record.vaccineDate);
        return hsDate.isAfter(etTtDate) && hsDate.diff(etTtDate, "days") >= 15;
      });

      if (!hasHsAfterEtTt && daysSinceEtTt >= 13 && daysSinceEtTt <= 15) {
        alertsToSend.push({
          userId: animal.uid,
          animalId: animal.uniqueId,
          animalName: animal.name,
          alertType: "HS Vaccine",
          message: `Your animal ${animal.name} is due for HS vaccine. It should be done 15 days after the ET + TT vaccine.`,
          dueDate: etTtDate.clone().add(15, "days").toDate(),
        });
        console.log(
          `Alert: ${animal.name} due for HS vaccine (15 days after ET + TT).`
        );
      }
    }

    // Find FMD records by name for check after HS
    const fmdRecords = vaccineData.filter(
      (record) => record.vaccineName === "FMD"
    );

    // Check for FMD vaccine (should be given 15 days after HS)
    for (const hsRecord of hsRecords) {
      const hsDate = moment(hsRecord.vaccineDate);
      const daysSinceHs = currentDate.diff(hsDate, "days");

      // Check if FMD is already given for this HS
      const hasFmdAfterHs = fmdRecords.some((record) => {
        const fmdDate = moment(record.vaccineDate);
        return fmdDate.isAfter(hsDate) && fmdDate.diff(hsDate, "days") >= 15;
      });

      if (!hasFmdAfterHs && daysSinceHs >= 13 && daysSinceHs <= 15) {
        alertsToSend.push({
          userId: animal.uid,
          animalId: animal.uniqueId,
          animalName: animal.name,
          alertType: "FMD Vaccine",
          message: `Your animal ${animal.name} is due for FMD vaccine. It should be done 15 days after the HS vaccine.`,
          dueDate: hsDate.clone().add(15, "days").toDate(),
        });
        console.log(
          `Alert: ${animal.name} due for FMD vaccine (15 days after HS`
        );
      }
    }
  }

  // Output all alerts
  for (const alert of alertsToSend) {
    console.log(`Sending alert to user ${alert.userId}: ${alert.message}`);
  }

  return {
    success: true,
    alertsCount: alertsToSend.length,
    message: `Processed ${alertsToSend.length} alerts.`,
  };
}
