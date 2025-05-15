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

    // === PROCESS VACCINE DATA ===
    if (vaccineName && vaccineDate) {
      const momentVaccineDate = moment(vaccineDate);

      if (!momentVaccineDate.isValid()) {
        return res.status(400).json({
          message: "Invalid vaccine date format",
          success: false,
        });
      }

      const formattedVaccineDate = momentVaccineDate.format("YYYY-MM-DD");

      const vaccineExists = vaccineRecord.vaccineData.some((vaccine) => {
        if (Array.isArray(vaccine)) {
          return (
            vaccine[0].toLowerCase() === vaccineName.toLowerCase() &&
            moment(vaccine[1]).format("YYYY-MM-DD") === formattedVaccineDate
          );
        } else if (typeof vaccine === "object") {
          return (
            vaccine.vaccineName.toLowerCase() === vaccineName.toLowerCase() &&
            moment(vaccine.vaccineDate).format("YYYY-MM-DD") ===
              formattedVaccineDate
          );
        }
        return false;
      });

      if (vaccineExists) {
        return res.status(400).json({
          message: `Vaccine ${vaccineName} already exists for this date (${formattedVaccineDate})`,
          success: false,
        });
      }

      const existingVaccineMoments = vaccineRecord.vaccineData
        .map((vaccine) => {
          if (Array.isArray(vaccine)) return moment(vaccine[1]);
          if (typeof vaccine === "object") return moment(vaccine.vaccineDate);
          return null;
        })
        .filter((date) => date && date.isValid());

      for (const existingMoment of existingVaccineMoments) {
        const daysDiff = Math.abs(
          momentVaccineDate.diff(existingMoment, "days")
        );
        if (daysDiff < 7) {
          return res.status(400).json({
            message: `New vaccine cannot be added within 7 days of an existing vaccine (${existingMoment.format(
              "YYYY-MM-DD"
            )})`,
            success: false,
          });
        }
      }

      vaccineRecord.vaccineData.push({
        vaccineName,
        vaccineDate: formattedVaccineDate,
      });

      if (Array.isArray(vaccineRecord.vaccineDataAlert)) {
        const alertIndex = vaccineRecord.vaccineDataAlert.findIndex(
          (alert) =>
            alert.alertType?.toLowerCase() === vaccineName.toLowerCase()
        );

        if (alertIndex !== -1) {
          vaccineRecord.vaccineDataAlert[alertIndex].status = "completed";
        }
      }
    }

    // === PROCESS BOOSTER DATA ===
    if (boosterName && boosterDate) {
      const momentBoosterDate = moment(boosterDate);

      if (!momentBoosterDate.isValid()) {
        return res.status(400).json({
          message: "Invalid booster date format",
          success: false,
        });
      }

      const formattedBoosterDate = momentBoosterDate.format("YYYY-MM-DD");

      const boosterExists = vaccineRecord.boosterData.some((booster) => {
        if (Array.isArray(booster)) {
          return (
            booster[0].toLowerCase() === boosterName.toLowerCase() &&
            moment(booster[1]).format("YYYY-MM-DD") === formattedBoosterDate
          );
        } else if (typeof booster === "object") {
          return (
            booster.boosterName.toLowerCase() === boosterName.toLowerCase() &&
            moment(booster.boosterDate).format("YYYY-MM-DD") ===
              formattedBoosterDate
          );
        }
        return false;
      });

      if (boosterExists) {
        return res.status(400).json({
          message: `Booster ${boosterName} already exists for this date (${formattedBoosterDate})`,
          success: false,
        });
      }

      const existingBoosterMoments = vaccineRecord.boosterData
        .map((booster) => {
          if (Array.isArray(booster)) return moment(booster[1]);
          if (typeof booster === "object") return moment(booster.boosterDate);
          return null;
        })
        .filter((date) => date && date.isValid());

      for (const existingMoment of existingBoosterMoments) {
        const daysDiff = Math.abs(
          momentBoosterDate.diff(existingMoment, "days")
        );
        if (daysDiff < 7) {
          return res.status(400).json({
            message: `New booster cannot be added within 7 days of an existing booster (${existingMoment.format(
              "YYYY-MM-DD"
            )})`,
            success: false,
          });
        }
      }

      vaccineRecord.boosterData.push({
        boosterName,
        boosterDate: formattedBoosterDate,
      });
    }

    await vaccineRecord.save();

    res.status(200).json({
      message: "Vaccine data added successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error adding vaccine data:", error);
    res.status(500).json({
      message: "Server Error. Failed to add vaccine data.",
      error: error.message,
    });
  }
});

// Function to check and send vaccine alerts to users
exports.checkAndSendVaccineAlerts = asyncHandler(async (req, res) => {
  try {
    await processAlerts();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
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

// ----------------------------------=================================----------------------------------------
// const animals = [
//   // Example with purchase date
//   {
//     uniqueId: "gree-01",
//     name: "Billy",
//     birthDate: null,
//     purchaseDate: "2025-03-01", // Animal was purchased, no birth date
//     uid: "RAZ1235",
//   },
//   // More animals can be added here
// ];

// const vaccineRecordsa = [
//   // Bessie - Newborn with no vaccines yet
//   {
//     animalUniqueId: "goat-01",
//     vaccineData: [{ vaccineName: "Deworming", vaccineDate: "2025-03-10" }],
//     boosterData: [],
//   },
// ];

// // Helper: get vaccine record for an animal
async function getVaccineRecord(animalId) {
  const vaccineRecord = await vaccineModal.find({
    animalUniqueId: animalId,
  });

  return (
    vaccineRecord.find((rec) => rec.animalUniqueId === animalId) || {
      vaccineData: [],
      boosterData: [],
    }
  );
}

// // Helper: check if booster exists for a primary vaccine
// function hasBooster(boosterData, primaryVaccineName, primaryVaccineDate) {
//   const primaryDate = moment(primaryVaccineDate);

//   return boosterData.some((booster) => {
//     return (
//       booster.vaccineName === `${primaryVaccineName} Booster` &&
//       moment(booster.vaccineDate).isAfter(primaryDate.clone().add(25, "days"))
//     );
//   });
// }

// // Helper: check if repeat booster exists based on previous booster
// function hasRepeatBooster(
//   boosterData,
//   boosterVaccineName,
//   previousBoosterDate,
//   repeatInterval
// ) {
//   const previousDate = moment(previousBoosterDate);

//   return boosterData.some((booster) => {
//     return (
//       booster.vaccineName === boosterVaccineName &&
//       moment(booster.vaccineDate).isAfter(
//         previousDate.clone().add(repeatInterval.value - 5, repeatInterval.unit)
//       )
//     );
//   });
// }

// async function processAlerts() {
//   const currentDate = moment("-2025-05-07");
//   const alertsToSend = [];

//   const animals = await Animal.find({});

//   for (const animal of animals) {
//     // Skip if neither birth date nor purchase date is available
//     if (!animal.birthDate && !animal.purchaseDate) continue;

//     const birthDate = animal.birthDate ? moment(animal.birthDate) : null;
//     const purchaseDate = animal.purchaseDate
//       ? moment(animal.purchaseDate)
//       : null;

//     let ageInDays = null;
//     let referenceDate = null;
//     let usesPurchaseDate = false;

//     // Determine which date to use as reference
//     if (purchaseDate) {
//       usesPurchaseDate = true;
//       referenceDate = purchaseDate;
//       // For purchased animals, we'll track days since purchase for scheduling
//       ageInDays = currentDate.diff(purchaseDate, "days");
//     } else if (birthDate) {
//       referenceDate = birthDate;
//       ageInDays = currentDate.diff(birthDate, "days");
//     }

//     const vaccineRecord = getVaccineRecord(animal.uniqueId);
//     const vaccineData = Array.isArray(vaccineRecord.vaccineData)
//       ? vaccineRecord.vaccineData
//       : [];
//     const boosterData = Array.isArray(vaccineRecord.boosterData)
//       ? vaccineRecord.boosterData
//       : [];

//     // No vaccine record, check first deworming based on date type
//     if (vaccineData.length === 0) {
//       if (usesPurchaseDate) {
//         // For purchased animals: deworming 2 days after purchase
//         if (ageInDays <= 2) {
//           alertsToSend.push({
//             userId: animal.uid,
//             animalId: animal.uniqueId,
//             animalName: animal.name,
//             alertType: "First Deworming",
//             message: `Your animal ${animal.name} is due for first deworming. It should be done 2 days after purchase.`,
//             dueDate: purchaseDate.clone().add(2, "days").toDate(),
//           });
//           console.log(
//             `Alert: ${animal.name} due for first deworming 2 days after purchase.`
//           );
//         }
//       } else {
//         // For birth date based animals: deworming at 85 days of age
//         if (ageInDays >= 75 && ageInDays <= 77) {
//           alertsToSend.push({
//             userId: animal.uid,
//             animalId: animal.uniqueId,
//             animalName: animal.name,
//             alertType: "First Deworming",
//             message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
//             dueDate: birthDate.clone().add(85, "days").toDate(),
//           });
//           console.log(
//             `Alert: ${animal.name} due for first deworming at 85 days.`
//           );
//         }
//       }
//       // continue;
//     }

//     // Deworming check
//     const dewormingRecords = vaccineData.filter((v) =>
//       (v.vaccineName || "").toLowerCase().includes("deworming")
//     );

//     if (dewormingRecords.length === 0) {
//       if (usesPurchaseDate) {
//         // For purchased animals: deworming 2 days after purchase
//         if (ageInDays <= 2) {
//           alertsToSend.push({
//             userId: animal.uid,
//             animalId: animal.uniqueId,
//             animalName: animal.name,
//             alertType: "First Deworming",
//             message: `Your animal ${animal.name} is due for first deworming. It should be done 2 days after purchase.`,
//             dueDate: purchaseDate.clone().add(2, "days").toDate(),
//           });
//           console.log(
//             `Alert: ${animal.name} due for first deworming 2 days after purchase.`
//           );
//         }
//       } else if (ageInDays >= 70 && ageInDays <= 75) {
//         // For birth date based animals: deworming at 85 days of age
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "First Deworming",
//           message: `Your animal ${animal.name} is due for first deworming. It should be done at 85 days of age.`,
//           dueDate: birthDate.clone().add(85, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for first deworming at 85 days.`
//         );
//       }
//     }

//     // PPR vaccine check
//     const pprRecordsFilter = vaccineData.filter((v) =>
//       (v.vaccineName || "").toLowerCase().includes("ppr")
//     );
//     const hasPPR = pprRecordsFilter.length > 0;

//     if (!hasPPR) {
//       if (usesPurchaseDate) {
//         // For purchased animals: PPR 7 days after purchase
//         if (ageInDays >= 5 && ageInDays <= 7) {
//           alertsToSend.push({
//             userId: animal.uid,
//             animalId: animal.uniqueId,
//             animalName: animal.name,
//             alertType: "PPR Vaccine",
//             message: `Your animal ${animal.name} is due for PPR vaccine. It should be done 7 days after purchase.`,
//             dueDate: purchaseDate.clone().add(7, "days").toDate(),
//           });
//           console.log(
//             `Alert: ${animal.name} due for PPR vaccine (7 days after purchase).`
//           );
//         }
//       } else if (ageInDays >= 82 && ageInDays <= 85) {
//         // For birth date based animals: PPR at 85 days of age
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "PPR Vaccine",
//           message: `Your animal ${animal.name} is due for PPR vaccine. It should be done at 85 days of age.`,
//           dueDate: birthDate.clone().add(85, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for PPR vaccine (85 days after birth).`
//         );
//       }
//     }

//     // Rest of vaccine schedule logic - follows the same pattern regardless of birth/purchase date
//     // Once the first vaccines are administered based on either birth or purchase date,
//     // the subsequent vaccine schedule follows the normal cycle/intervals

//     const pprRecords = vaccineData.filter(
//       (record) => record.vaccineName === "PPR"
//     );

//     for (const pprRecord of pprRecords) {
//       const pprDate = moment(pprRecord.vaccineDate);
//       const daysSincePPR = currentDate.diff(pprDate, "days");

//       // PPR Booster check (after 2 years)
//       const pprBoosterRecords = boosterData.filter(
//         (record) => record.vaccineName === "PPR Booster"
//       );

//       for (const pprBooster of pprBoosterRecords) {
//         const boosterDate = moment(pprBooster.vaccineDate);
//         const daysSinceBooster = currentDate.diff(boosterDate, "days");

//         // Check if it's time for PPR repeat booster (2 years after previous booster)
//         if (daysSinceBooster >= 725 && daysSinceBooster <= 730) {
//           alertsToSend.push({
//             userId: animal.uid,
//             animalId: animal.uniqueId,
//             animalName: animal.name,
//             alertType: "PPR Repeat Booster",
//             message: `Your animal ${animal.name} is due for PPR repeat booster vaccine. It should be done 2 years after the previous PPR booster.`,
//             dueDate: boosterDate.clone().add(2, "years").toDate(),
//           });
//           console.log(
//             `Alert: ${animal.name} due for PPR repeat booster (2 years after previous booster).`
//           );
//         }
//       }

//       // Check for initial PPR booster (though requirement says no booster, but alerting for 2-year repeat)
//       if (
//         pprBoosterRecords.length === 0 &&
//         daysSincePPR >= 725 &&
//         daysSincePPR <= 730
//       ) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "PPR Repeat Vaccine",
//           message: `Your animal ${animal.name} is due for repeat PPR vaccine. It should be done 2 years after the initial PPR vaccine.`,
//           dueDate: pprDate.clone().add(2, "years").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for repeat PPR vaccine (2 years after initial).`
//         );
//       }

//       if (daysSincePPR >= 13 && daysSincePPR <= 15) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "Second PPR Vaccine",
//           message: `Your animal ${animal.name} is due for the second PPR vaccine. It should be done 15 days after the first PPR vaccine.`,
//           dueDate: pprDate.clone().add(15, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for second PPR vaccine (15 days after first).`
//         );
//       }
//     }

//     // The rest of the code remains the same as the original implementation
//     // Once the animal has started the vaccination schedule, the timing between
//     // vaccines follows the same pattern whether initially triggered by birth or purchase

//     // ET + TT after PPR
//     const etTtRecords = vaccineData.filter(
//       (record) => record.vaccineName === "ET + TT"
//     );

//     for (const pprRecord of pprRecords) {
//       const pprDate = moment(pprRecord.vaccineDate);
//       const daysSincePPR = currentDate.diff(pprDate, "days");

//       const hasEtTtAfterPpr = etTtRecords.some((record) => {
//         const etTtDate = moment(record.vaccineDate);
//         return (
//           etTtDate.isAfter(pprDate) && etTtDate.diff(pprDate, "days") >= 15
//         );
//       });

//       if (!hasEtTtAfterPpr && daysSincePPR >= 13 && daysSincePPR <= 15) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "ET + TT Vaccine",
//           message: `Your animal ${animal.name} is due for ET + TT vaccine. It should be done 15 days after the PPR vaccine.`,
//           dueDate: pprDate.clone().add(15, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for ET + TT vaccine (15 days after PPR).`
//         );
//       }
//     }

//     // ET + TT Booster check
//     for (const etTtRecord of etTtRecords) {
//       const etTtDate = moment(etTtRecord.vaccineDate);
//       const daysSinceEtTt = currentDate.diff(etTtDate, "days");

//       // Check if booster is due (30 days after primary)
//       if (
//         daysSinceEtTt >= 28 &&
//         daysSinceEtTt <= 32 &&
//         !hasBooster(boosterData, "ET + TT", etTtRecord.vaccineDate)
//       ) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "ET + TT Booster",
//           message: `Your animal ${animal.name} is due for ET + TT booster vaccine. It should be done 30 days after the primary ET + TT vaccine.`,
//           dueDate: etTtDate.clone().add(30, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for ET + TT booster (30 days after primary).`
//         );
//       }

//       // Check for repeat boosters (every 6 months)
//       const etTtBoosterRecords = boosterData.filter(
//         (record) => record.vaccineName === "ET + TT Booster"
//       );

//       for (const booster of etTtBoosterRecords) {
//         const boosterDate = moment(booster.vaccineDate);
//         const daysSinceBooster = currentDate.diff(boosterDate, "days");

//         if (
//           daysSinceBooster >= 175 &&
//           daysSinceBooster <= 182 &&
//           !hasRepeatBooster(
//             boosterData,
//             "ET + TT Repeat Booster",
//             booster.vaccineDate,
//             { value: 6, unit: "months" }
//           )
//         ) {
//           alertsToSend.push({
//             userId: animal.uid,
//             animalId: animal.uniqueId,
//             animalName: animal.name,
//             alertType: "ET + TT Repeat Booster",
//             message: `Your animal ${animal.name} is due for ET + TT repeat booster vaccine. It should be done 6 months after the previous booster.`,
//             dueDate: boosterDate.clone().add(6, "months").toDate(),
//           });
//           console.log(
//             `Alert: ${animal.name} due for ET + TT repeat booster (6 months after previous booster).`
//           );
//         }
//       }
//     }

//     // HS after ET + TT
//     const hsRecords = vaccineData.filter(
//       (record) => record.vaccineName === "HS"
//     );

//     for (const etTtRecord of etTtRecords) {
//       const etTtDate = moment(etTtRecord.vaccineDate);
//       const daysSinceEtTt = currentDate.diff(etTtDate, "days");

//       const hasHsAfterEtTt = hsRecords.some((record) => {
//         const hsDate = moment(record.vaccineDate);
//         return hsDate.isAfter(etTtDate) && hsDate.diff(etTtDate, "days") >= 15;
//       });

//       if (!hasHsAfterEtTt && daysSinceEtTt >= 13 && daysSinceEtTt <= 15) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "HS Vaccine",
//           message: `Your animal ${animal.name} is due for HS vaccine. It should be done 15 days after the ET + TT vaccine.`,
//           dueDate: etTtDate.clone().add(15, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for HS vaccine (15 days after ET + TT).`
//         );
//       }
//     }

//     // HS Booster check
//     for (const hsRecord of hsRecords) {
//       const hsDate = moment(hsRecord.vaccineDate);
//       const daysSinceHs = currentDate.diff(hsDate, "days");

//       // Check if booster is due (30 days after primary)
//       if (
//         daysSinceHs >= 28 &&
//         daysSinceHs <= 32 &&
//         !hasBooster(boosterData, "HS", hsRecord.vaccineDate)
//       ) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "HS Booster",
//           message: `Your animal ${animal.name} is due for HS booster vaccine. It should be done 30 days after the primary HS vaccine.`,
//           dueDate: hsDate.clone().add(30, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for HS booster (30 days after primary).`
//         );
//       }

//       // Check for repeat boosters (every 6 months)
//       const hsBoosterRecords = boosterData.filter(
//         (record) => record.vaccineName === "HS Booster"
//       );

//       for (const booster of hsBoosterRecords) {
//         const boosterDate = moment(booster.vaccineDate);
//         const daysSinceBooster = currentDate.diff(boosterDate, "days");

//         if (
//           daysSinceBooster >= 175 &&
//           daysSinceBooster <= 182 &&
//           !hasRepeatBooster(
//             boosterData,
//             "HS Repeat Booster",
//             booster.vaccineDate,
//             { value: 6, unit: "months" }
//           )
//         ) {
//           alertsToSend.push({
//             userId: animal.uid,
//             animalId: animal.uniqueId,
//             animalName: animal.name,
//             alertType: "HS Repeat Booster",
//             message: `Your animal ${animal.name} is due for HS repeat booster vaccine. It should be done 6 months after the previous booster.`,
//             dueDate: boosterDate.clone().add(6, "months").toDate(),
//           });
//           console.log(
//             `Alert: ${animal.name} due for HS repeat booster (6 months after previous booster).`
//           );
//         }
//       }
//     }

//     // FMD after HS
//     const fmdRecords = vaccineData.filter(
//       (record) => record.vaccineName === "FMD"
//     );

//     for (const hsRecord of hsRecords) {
//       const hsDate = moment(hsRecord.vaccineDate);
//       const daysSinceHs = currentDate.diff(hsDate, "days");

//       const hasFmdAfterHs = fmdRecords.some((record) => {
//         const fmdDate = moment(record.vaccineDate);
//         return fmdDate.isAfter(hsDate) && fmdDate.diff(hsDate, "days") >= 15;
//       });

//       if (!hasFmdAfterHs && daysSinceHs >= 13 && daysSinceHs <= 15) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "FMD Vaccine",
//           message: `Your animal ${animal.name} is due for FMD vaccine. It should be done 15 days after the HS vaccine.`,
//           dueDate: hsDate.clone().add(15, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for FMD vaccine (15 days after HS).`
//         );
//       }
//     }

//     // FMD Booster check
//     for (const fmdRecord of fmdRecords) {
//       const fmdDate = moment(fmdRecord.vaccineDate);
//       const daysSinceFmd = currentDate.diff(fmdDate, "days");

//       // Check if booster is due (30 days after primary)
//       if (
//         daysSinceFmd >= 28 &&
//         daysSinceFmd <= 32 &&
//         !hasBooster(boosterData, "FMD", fmdRecord.vaccineDate)
//       ) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "FMD Booster",
//           message: `Your animal ${animal.name} is due for FMD booster vaccine. It should be done 30 days after the primary FMD vaccine.`,
//           dueDate: fmdDate.clone().add(30, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for FMD booster (30 days after primary).`
//         );
//       }

//       // Check for repeat boosters (every 6 months)
//       const fmdBoosterRecords = boosterData.filter(
//         (record) => record.vaccineName === "FMD Booster"
//       );

//       for (const booster of fmdBoosterRecords) {
//         const boosterDate = moment(booster.vaccineDate);
//         const daysSinceBooster = currentDate.diff(boosterDate, "days");

//         if (
//           daysSinceBooster >= 175 &&
//           daysSinceBooster <= 182 &&
//           !hasRepeatBooster(
//             boosterData,
//             "FMD Repeat Booster",
//             booster.vaccineDate,
//             { value: 6, unit: "months" }
//           )
//         ) {
//           alertsToSend.push({
//             userId: animal.uid,
//             animalId: animal.uniqueId,
//             animalName: animal.name,
//             alertType: "FMD Repeat Booster",
//             message: `Your animal ${animal.name} is due for FMD repeat booster vaccine. It should be done 6 months after the previous booster.`,
//             dueDate: boosterDate.clone().add(6, "months").toDate(),
//           });
//           console.log(
//             `Alert: ${animal.name} due for FMD repeat booster (6 months after previous booster).`
//           );
//         }
//       }
//     }

//     // Goat Pox after FMD
//     const goatPoxRecords = vaccineData.filter(
//       (record) => record.vaccineName === "Goat Pox"
//     );

//     for (const fmdRecord of fmdRecords) {
//       const fmdDate = moment(fmdRecord.vaccineDate);
//       const daysSinceFmd = currentDate.diff(fmdDate, "days");

//       const hasGoatPoxAfterFmd = goatPoxRecords.some((record) => {
//         const goatPoxDate = moment(record.vaccineDate);
//         return (
//           goatPoxDate.isAfter(fmdDate) &&
//           goatPoxDate.diff(fmdDate, "days") >= 15
//         );
//       });

//       if (!hasGoatPoxAfterFmd && daysSinceFmd >= 13 && daysSinceFmd <= 15) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "Goat Pox Vaccine",
//           message: `Your animal ${animal.name} is due for Goat Pox vaccine. It should be done 15 days after the FMD vaccine.`,
//           dueDate: fmdDate.clone().add(15, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for Goat Pox vaccine (15 days after FMD).`
//         );
//       }
//     }

//     // Goat Pox Booster check
//     for (const goatPoxRecord of goatPoxRecords) {
//       const goatPoxDate = moment(goatPoxRecord.vaccineDate);
//       const daysSinceGoatPox = currentDate.diff(goatPoxDate, "days");

//       // Check if booster is due (30 days after primary)
//       if (
//         daysSinceGoatPox >= 28 &&
//         daysSinceGoatPox <= 32 &&
//         !hasBooster(boosterData, "Goat Pox", goatPoxRecord.vaccineDate)
//       ) {
//         alertsToSend.push({
//           userId: animal.uid,
//           animalId: animal.uniqueId,
//           animalName: animal.name,
//           alertType: "Goat Pox Booster",
//           message: `Your animal ${animal.name} is due for Goat Pox booster vaccine. It should be done 30 days after the primary Goat Pox vaccine.`,
//           dueDate: goatPoxDate.clone().add(30, "days").toDate(),
//         });
//         console.log(
//           `Alert: ${animal.name} due for Goat Pox booster (30 days after primary).`
//         );
//       }

//       // Check for repeat boosters (every 1 year)
//       const goatPoxBoosterRecords = boosterData.filter(
//         (record) => record.vaccineName === "Goat Pox Booster"
//       );

//       for (const booster of goatPoxBoosterRecords) {
//         const boosterDate = moment(booster.vaccineDate);
//         const daysSinceBooster = currentDate.diff(boosterDate, "days");

//         if (
//           daysSinceBooster >= 360 &&
//           daysSinceBooster <= 370 &&
//           !hasRepeatBooster(
//             boosterData,
//             "Goat Pox Repeat Booster",
//             booster.vaccineDate,
//             { value: 1, unit: "year" }
//           )
//         ) {
//           alertsToSend.push({
//             userId: animal.uid,
//             animalId: animal.uniqueId,
//             animalName: animal.name,
//             alertType: "Goat Pox Repeat Booster",
//             message: `Your animal ${animal.name} is due for Goat Pox repeat booster vaccine. It should be done 1 year after the previous booster.`,
//             dueDate: boosterDate.clone().add(1, "year").toDate(),
//           });
//           console.log(
//             `Alert: ${animal.name} due for Goat Pox repeat booster (1 year after previous booster).`
//           );
//         }
//       }
//     }
//     console.log("ageInDays: ", ageInDays);
//   }

//   // Final output
//   for (const alert of alertsToSend) {
//     console.log(`Sending alert to user ${alert.userId}: ${alert.message}`);
//   }

//   return {
//     success: true,
//     alertsCount: alertsToSend.length,
//     message: `Processed ${alertsToSend.length} alerts.`,
//   };
// }

async function processAlerts() {
  const currentDate = moment("-2025-05-02");
  const alertsToSend = [];
  // We'll collect vaccineDataAlerts separately without modifying the database
  const vaccineDataAlerts = [];

  const animals = await Animal.find({});

  try {
    for (const animal of animals) {
      // Skip if neither birth date nor purchase date is available
      if (!animal.birthDate && !animal.purchaseDate) continue;
      // Skip if animal name is null or empty
      if (!animal.animalName) continue;
      // Skip if animal uniqueId is null or empty
      if (!animal.uniqueId) continue;

      const birthDate = animal.birthDate ? moment(animal.birthDate) : null;
      const purchaseDate = animal.purchaseDate
        ? moment(animal.purchaseDate)
        : null;

      let ageInDays = null;
      let referenceDate = null;
      let usesPurchaseDate = false;

      // Determine which date to use as reference
      if (purchaseDate) {
        usesPurchaseDate = true;
        referenceDate = purchaseDate;
        // For purchased animals, we'll track days since purchase for scheduling
        ageInDays = currentDate.diff(purchaseDate, "days");
      } else if (birthDate) {
        referenceDate = birthDate;
        ageInDays = currentDate.diff(birthDate, "days");
      }

      const vaccineRecord = await getVaccineRecord(animal.uniqueId);
      const vaccineData = Array.isArray(vaccineRecord.vaccineData)
        ? vaccineRecord.vaccineData
        : [];
      const boosterData = Array.isArray(vaccineRecord.boosterData)
        ? vaccineRecord.boosterData
        : [];

      // Initialize collection for this animal if it doesn't exist
      // if (!vaccineDataAlerts[animal.uniqueId]) {
      //   vaccineDataAlerts[animal.uniqueId] = [];
      // }

      // Function to add alert to both alertsToSend and collect in vaccineDataAlerts
      const addAlert = (alertType, message, dueDate) => {
        const alert = {
          userId: animal.uid,
          animalId: animal.uniqueId,
          animalName: animal.animalName,
          alertType: alertType,
          message: message,
          dueDate: dueDate.toDate(),
        };

        alertsToSend.push(alert);

        // Create alert data with tagId
        const alertData = {
          name: animal.animalName,
          date: dueDate.format("YYYY-MM-DD"),
          status: "pending",
          alertType: alertType,
          tagId: animal.tagId || "", // Use tagId if available, otherwise use uniqueId
        };

        // Check if this alert already exists to avoid duplicates
        const alertExists = vaccineDataAlerts.some(
          (existingAlert) =>
            existingAlert.alertType === alertData.alertType &&
            existingAlert.date === alertData.date
        );

        if (!alertExists) {
          vaccineDataAlerts.push(alertData);
          console.log(`Alert: ${message}`);
        }
      };

      // No vaccine record, check first deworming based on date type
      if (vaccineData.length === 0) {
        if (usesPurchaseDate) {
          // For purchased animals: deworming 2 days after purchase
          if (ageInDays <= 2) {
            const dueDate = purchaseDate.clone().add(2, "days");
            addAlert(
              "First Deworming",
              `Your animal ${animal.animalName} is due for first deworming. It should be done 2 days after purchase.`,
              dueDate
            );
          }
        } else {
          // For birth date based animals: deworming at 85 days of age
          if (ageInDays >= 75 && ageInDays <= 77) {
            const dueDate = birthDate.clone().add(85, "days");
            addAlert(
              "First Deworming",
              `Your animal ${animal.animalName} is due for first deworming. It should be done at 85 days of age.`,
              dueDate
            );
          }
        }
      }

      // Deworming check
      const dewormingRecords = vaccineData.filter((v) =>
        (v.vaccineName || "").toLowerCase().includes("deworming")
      );

      if (dewormingRecords.length === 0) {
        if (usesPurchaseDate) {
          // For purchased animals: deworming 2 days after purchase
          if (ageInDays <= 2) {
            const dueDate = purchaseDate.clone().add(2, "days");
            addAlert(
              "First Deworming",
              `Your animal ${animal.animalName} is due for first deworming. It should be done 2 days after purchase.`,
              dueDate
            );
          }
        } else if (ageInDays >= 70 && ageInDays <= 75) {
          // For birth date based animals: deworming at 85 days of age
          const dueDate = birthDate.clone().add(85, "days");
          addAlert(
            "First Deworming",
            `Your animal ${animal.animalName} is due for first deworming. It should be done at 85 days of age.`,
            dueDate
          );
        }
      }

      // PPR vaccine check
      const pprRecordsFilter = vaccineData.filter((v) =>
        (v.vaccineName || "").toLowerCase().includes("ppr")
      );
      const hasPPR = pprRecordsFilter.length > 0;

      if (!hasPPR) {
        if (usesPurchaseDate) {
          // For purchased animals: PPR 7 days after purchase
          if (ageInDays >= 5 && ageInDays <= 7) {
            const dueDate = purchaseDate.clone().add(7, "days");
            addAlert(
              "PPR Vaccine",
              `Your animal ${animal.animalName} is due for PPR vaccine. It should be done 7 days after purchase.`,
              dueDate
            );
          }
        } else if (ageInDays >= 82 && ageInDays <= 85) {
          // For birth date based animals: PPR at 85 days of age
          const dueDate = birthDate.clone().add(85, "days");
          addAlert(
            "PPR Vaccine",
            `Your animal ${animal.animalName} is due for PPR vaccine. It should be done at 85 days of age.`,
            dueDate
          );
        }
      }

      // Rest of vaccine schedule logic - follows the same pattern regardless of birth/purchase date
      const pprRecords = vaccineData.filter(
        (record) => record.vaccineName === "PPR"
      );

      for (const pprRecord of pprRecords) {
        const pprDate = moment(pprRecord.vaccineDate);
        const daysSincePPR = currentDate.diff(pprDate, "days");

        // PPR Booster check (after 2 years)
        const pprBoosterRecords = boosterData.filter(
          (record) => record.vaccineName === "PPR Booster"
        );

        for (const pprBooster of pprBoosterRecords) {
          const boosterDate = moment(pprBooster.vaccineDate);
          const daysSinceBooster = currentDate.diff(boosterDate, "days");

          // Check if it's time for PPR repeat booster (2 years after previous booster)
          if (daysSinceBooster >= 725 && daysSinceBooster <= 730) {
            const dueDate = boosterDate.clone().add(2, "years");
            addAlert(
              "PPR Repeat Booster",
              `Your animal ${animal.animalName} is due for PPR repeat booster vaccine. It should be done 2 years after the previous PPR booster.`,
              dueDate
            );
          }
        }

        // Check for initial PPR booster (though requirement says no booster, but alerting for 2-year repeat)
        if (
          pprBoosterRecords.length === 0 &&
          daysSincePPR >= 725 &&
          daysSincePPR <= 730
        ) {
          const dueDate = pprDate.clone().add(2, "years");
          addAlert(
            "PPR Repeat Vaccine",
            `Your animal ${animal.animalName} is due for repeat PPR vaccine. It should be done 2 years after the initial PPR vaccine.`,
            dueDate
          );
        }

        if (daysSincePPR >= 13 && daysSincePPR <= 15) {
          const dueDate = pprDate.clone().add(15, "days");
          addAlert(
            "Second PPR Vaccine",
            `Your animal ${animal.animalName} is due for the second PPR vaccine. It should be done 15 days after the first PPR vaccine.`,
            dueDate
          );
        }
      }

      // ET + TT after PPR
      const etTtRecords = vaccineData.filter(
        (record) => record.vaccineName === "ET + TT"
      );

      for (const pprRecord of pprRecords) {
        const pprDate = moment(pprRecord.vaccineDate);
        const daysSincePPR = currentDate.diff(pprDate, "days");

        const hasEtTtAfterPpr = etTtRecords.some((record) => {
          const etTtDate = moment(record.vaccineDate);
          return (
            etTtDate.isAfter(pprDate) && etTtDate.diff(pprDate, "days") >= 15
          );
        });

        if (!hasEtTtAfterPpr && daysSincePPR >= 13 && daysSincePPR <= 15) {
          const dueDate = pprDate.clone().add(15, "days");
          addAlert(
            "ET + TT Vaccine",
            `Your animal ${animal.animalName} is due for ET + TT vaccine. It should be done 15 days after the PPR vaccine.`,
            dueDate
          );
        }
      }

      // ET + TT Booster check
      for (const etTtRecord of etTtRecords) {
        const etTtDate = moment(etTtRecord.vaccineDate);
        const daysSinceEtTt = currentDate.diff(etTtDate, "days");

        // Check if booster is due (30 days after primary)
        if (
          daysSinceEtTt >= 28 &&
          daysSinceEtTt <= 32 &&
          !hasBooster(boosterData, "ET + TT", etTtRecord.vaccineDate)
        ) {
          const dueDate = etTtDate.clone().add(30, "days");
          addAlert(
            "ET + TT Booster",
            `Your animal ${animal.animalName} is due for ET + TT booster vaccine. It should be done 30 days after the primary ET + TT vaccine.`,
            dueDate
          );
        }

        // Check for repeat boosters (every 6 months)
        const etTtBoosterRecords = boosterData.filter(
          (record) => record.vaccineName === "ET + TT Booster"
        );

        for (const booster of etTtBoosterRecords) {
          const boosterDate = moment(booster.vaccineDate);
          const daysSinceBooster = currentDate.diff(boosterDate, "days");

          if (
            daysSinceBooster >= 175 &&
            daysSinceBooster <= 182 &&
            !hasRepeatBooster(
              boosterData,
              "ET + TT Repeat Booster",
              booster.vaccineDate,
              { value: 6, unit: "months" }
            )
          ) {
            const dueDate = boosterDate.clone().add(6, "months");
            addAlert(
              "ET + TT Repeat Booster",
              `Your animal ${animal.animalName} is due for ET + TT repeat booster vaccine. It should be done 6 months after the previous booster.`,
              dueDate
            );
          }
        }
      }

      // HS after ET + TT
      const hsRecords = vaccineData.filter(
        (record) => record.vaccineName === "HS"
      );

      for (const etTtRecord of etTtRecords) {
        const etTtDate = moment(etTtRecord.vaccineDate);
        const daysSinceEtTt = currentDate.diff(etTtDate, "days");

        const hasHsAfterEtTt = hsRecords.some((record) => {
          const hsDate = moment(record.vaccineDate);
          return (
            hsDate.isAfter(etTtDate) && hsDate.diff(etTtDate, "days") >= 15
          );
        });

        if (!hasHsAfterEtTt && daysSinceEtTt >= 13 && daysSinceEtTt <= 15) {
          const dueDate = etTtDate.clone().add(15, "days");
          addAlert(
            "HS Vaccine",
            `Your animal ${animal.animalName} is due for HS vaccine. It should be done 15 days after the ET + TT vaccine.`,
            dueDate
          );
        }
      }

      // HS Booster check
      for (const hsRecord of hsRecords) {
        const hsDate = moment(hsRecord.vaccineDate);
        const daysSinceHs = currentDate.diff(hsDate, "days");

        // Check if booster is due (30 days after primary)
        if (
          daysSinceHs >= 28 &&
          daysSinceHs <= 32 &&
          !hasBooster(boosterData, "HS", hsRecord.vaccineDate)
        ) {
          const dueDate = hsDate.clone().add(30, "days");
          addAlert(
            "HS Booster",
            `Your animal ${animal.animalName} is due for HS booster vaccine. It should be done 30 days after the primary HS vaccine.`,
            dueDate
          );
        }

        // Check for repeat boosters (every 6 months)
        const hsBoosterRecords = boosterData.filter(
          (record) => record.vaccineName === "HS Booster"
        );

        for (const booster of hsBoosterRecords) {
          const boosterDate = moment(booster.vaccineDate);
          const daysSinceBooster = currentDate.diff(boosterDate, "days");

          if (
            daysSinceBooster >= 175 &&
            daysSinceBooster <= 182 &&
            !hasRepeatBooster(
              boosterData,
              "HS Repeat Booster",
              booster.vaccineDate,
              { value: 6, unit: "months" }
            )
          ) {
            const dueDate = boosterDate.clone().add(6, "months");
            addAlert(
              "HS Repeat Booster",
              `Your animal ${animal.animalName} is due for HS repeat booster vaccine. It should be done 6 months after the previous booster.`,
              dueDate
            );
          }
        }
      }

      // FMD after HS
      const fmdRecords = vaccineData.filter(
        (record) => record.vaccineName === "FMD"
      );

      for (const hsRecord of hsRecords) {
        const hsDate = moment(hsRecord.vaccineDate);
        const daysSinceHs = currentDate.diff(hsDate, "days");

        const hasFmdAfterHs = fmdRecords.some((record) => {
          const fmdDate = moment(record.vaccineDate);
          return fmdDate.isAfter(hsDate) && fmdDate.diff(hsDate, "days") >= 15;
        });

        if (!hasFmdAfterHs && daysSinceHs >= 13 && daysSinceHs <= 15) {
          const dueDate = hsDate.clone().add(15, "days");
          addAlert(
            "FMD Vaccine",
            `Your animal ${animal.animalName} is due for FMD vaccine. It should be done 15 days after the HS vaccine.`,
            dueDate
          );
        }
      }

      // FMD Booster check
      for (const fmdRecord of fmdRecords) {
        const fmdDate = moment(fmdRecord.vaccineDate);
        const daysSinceFmd = currentDate.diff(fmdDate, "days");

        // Check if booster is due (30 days after primary)
        if (
          daysSinceFmd >= 28 &&
          daysSinceFmd <= 32 &&
          !hasBooster(boosterData, "FMD", fmdRecord.vaccineDate)
        ) {
          const dueDate = fmdDate.clone().add(30, "days");
          addAlert(
            "FMD Booster",
            `Your animal ${animal.animalName} is due for FMD booster vaccine. It should be done 30 days after the primary FMD vaccine.`,
            dueDate
          );
        }

        // Check for repeat boosters (every 6 months)
        const fmdBoosterRecords = boosterData.filter(
          (record) => record.vaccineName === "FMD Booster"
        );

        for (const booster of fmdBoosterRecords) {
          const boosterDate = moment(booster.vaccineDate);
          const daysSinceBooster = currentDate.diff(boosterDate, "days");

          if (
            daysSinceBooster >= 175 &&
            daysSinceBooster <= 182 &&
            !hasRepeatBooster(
              boosterData,
              "FMD Repeat Booster",
              booster.vaccineDate,
              { value: 6, unit: "months" }
            )
          ) {
            const dueDate = boosterDate.clone().add(6, "months");
            addAlert(
              "FMD Repeat Booster",
              `Your animal ${animal.animalName} is due for FMD repeat booster vaccine. It should be done 6 months after the previous booster.`,
              dueDate
            );
          }
        }
      }

      // Goat Pox after FMD
      const goatPoxRecords = vaccineData.filter(
        (record) => record.vaccineName === "Goat Pox"
      );

      for (const fmdRecord of fmdRecords) {
        const fmdDate = moment(fmdRecord.vaccineDate);
        const daysSinceFmd = currentDate.diff(fmdDate, "days");

        const hasGoatPoxAfterFmd = goatPoxRecords.some((record) => {
          const goatPoxDate = moment(record.vaccineDate);
          return (
            goatPoxDate.isAfter(fmdDate) &&
            goatPoxDate.diff(fmdDate, "days") >= 15
          );
        });

        if (!hasGoatPoxAfterFmd && daysSinceFmd >= 13 && daysSinceFmd <= 15) {
          const dueDate = fmdDate.clone().add(15, "days");
          addAlert(
            "Goat Pox Vaccine",
            `Your animal ${animal.animalName} is due for Goat Pox vaccine. It should be done 15 days after the FMD vaccine.`,
            dueDate
          );
        }
      }

      // Goat Pox Booster check
      for (const goatPoxRecord of goatPoxRecords) {
        const goatPoxDate = moment(goatPoxRecord.vaccineDate);
        const daysSinceGoatPox = currentDate.diff(goatPoxDate, "days");

        // Check if booster is due (30 days after primary)
        if (
          daysSinceGoatPox >= 28 &&
          daysSinceGoatPox <= 32 &&
          !hasBooster(boosterData, "Goat Pox", goatPoxRecord.vaccineDate)
        ) {
          const dueDate = goatPoxDate.clone().add(30, "days");
          addAlert(
            "Goat Pox Booster",
            `Your animal ${animal.animalName} is due for Goat Pox booster vaccine. It should be done 30 days after the primary Goat Pox vaccine.`,
            dueDate
          );
        }

        // Check for repeat boosters (every 1 year)
        const goatPoxBoosterRecords = boosterData.filter(
          (record) => record.vaccineName === "Goat Pox Booster"
        );

        for (const booster of goatPoxBoosterRecords) {
          const boosterDate = moment(booster.vaccineDate);
          const daysSinceBooster = currentDate.diff(boosterDate, "days");

          if (
            daysSinceBooster >= 360 &&
            daysSinceBooster <= 370 &&
            !hasRepeatBooster(
              boosterData,
              "Goat Pox Repeat Booster",
              booster.vaccineDate,
              { value: 1, unit: "year" }
            )
          ) {
            const dueDate = boosterDate.clone().add(1, "year");
            addAlert(
              "Goat Pox Repeat Booster",
              `Your animal ${animal.animalName} is due for Goat Pox repeat booster vaccine. It should be done 1 year after the previous booster.`,
              dueDate
            );
          }
        }
      }

      // Save the vaccineDataAlert data in a structured format to return
      const vaccineAlertsToReturn = [];
      console.log("vaccineAlertsToReturn: ", vaccineAlertsToReturn);

      // Convert the vaccineDataAlerts object to array format for return
      console.log("vaccineDataAlerts: ", vaccineDataAlerts);
      for (const animalId in vaccineDataAlerts) {
        if (vaccineDataAlerts && vaccineDataAlerts.length > 0) {
          vaccineAlertsToReturn.push(...vaccineDataAlerts);
        }
      }
      // Save the updated vaccineRecord with the new alerts
      await vaccineModal.findOneAndUpdate(
        { animalUniqueId: animal.uniqueId },
        { $set: { vaccineDataAlert: vaccineDataAlerts } },
        { new: true, upsert: true }
      );
      // Final output
      for (const alert of alertsToSend) {
        console.log(`Sending alert to user ${alert.userId}: ${alert.message}`);
      }

      return {
        success: true,
        alertsCount: alertsToSend.length,
        message: `Processed ${alertsToSend.length} alerts.`,
        vaccineDataAlerts: vaccineAlertsToReturn,
      };
    }
  } catch (error) {
    console.log("error: ", error);
    throw new Error(error);
  }
}
