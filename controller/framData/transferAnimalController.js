const expressAsyncHandler = require("express-async-handler");
const TransferAnimal = require("../../model/framData/transferAnimalModel");
const Animal = require("../../model/framData/parentFromModal");

exports.transferAnimal = expressAsyncHandler(async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: "No data provided" });
    }

    try {
        const {
            tagId,
            uniqueId,
            uid,
            date,
            animalStatus
        } = req.body;

        // Validation
        if (!tagId && !uid && !date && !animalStatus) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        //  Check if animal already transfer
        const existingTransferAnimal = await TransferAnimal.findOne({ tagId, uniqueId,uid  });
        if (existingTransferAnimal) {
            return res.status(404).json({ message: "Animal already transfer." });
        }

        //  Check if animal exists in Animal 
        const existingAnimal = await Animal.findOne({ tagId,uniqueId,uid });
        if (!existingAnimal) {
            return res.status(404).json({
                message: "Animal not found.",
            });
        }
        //Add transfer animal
        const newTransfer = new TransferAnimal({
            tagId: existingAnimal.tagId,
            uid: existingAnimal.uid,
            date,
            animalStatus,

            // Add animal data
            uniqueId: existingAnimal.uniqueId,
            animalName: existingAnimal.animalName,
            ageYear: existingAnimal.ageYear,
            ageMonth: existingAnimal.ageMonth,
            height: existingAnimal.height,
            weightKg: existingAnimal.weightKg,
            birthDate: existingAnimal.birthDate,
            motherTag: existingAnimal.motherTag,
            fatherTag: existingAnimal.fatherTag,
            gender: existingAnimal.gender,
            birthType: existingAnimal.birthType,
            birthWeight: existingAnimal.birthWeight,
            mothersWeanDate: existingAnimal.mothersWeanDate,
            bodyScore: existingAnimal.bodyScore,
            purchasDate: existingAnimal.purchasDate,
            anyComment: existingAnimal.anyComment,
            dateMading: existingAnimal.dateMading,
            currentPregnancyMonth: existingAnimal.currentPregnancyMonth,
            failed: existingAnimal.failed,
            motherWeanDate: existingAnimal.motherWeanDate,
            otherDisease: existingAnimal.otherDisease,
            vaccineDate: existingAnimal.vaccineDate,
            farmName: existingAnimal.farmName,
            createdAt: existingAnimal.createdAt,
            updatedAt: existingAnimal.updatedAt,

            // ✅ Copy parent and child links
            parents: existingAnimal.parents || [],
            children: existingAnimal.children || []

        })
        await newTransfer.save();

        //  Delete from Animal collection
        const deleteResult = await Animal.deleteOne({ tagId , uniqueId});

        //  Check if any document was deleted
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({
                message: "Animal not found in original Animal collection.",
            });
        }

        // Send a success response
        res.status(201).json({
            message: "Animal transfer Successfully",
            data: newTransfer,
        })

    } catch (error) {
        res.status(500).json({
            message: "Server Error. Failed to transfer Animal.",
            error: error.message
        });
    };
});



// Get All Transfer Animals 
exports.getAllTransferAnimal = expressAsyncHandler(async (req, res) => {

    try {
        const transfer = await TransferAnimal.find({});
        res.json({
            message: "All transfer animals fetched successfully",
            data: transfer,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error, failed to fetch transfer animals" });
    }
});


// Get transfer animal by Unique ID 
exports.getTransferAnimalByUniqueId = expressAsyncHandler(async (req, res) => {
    const { uniqueId } = req.params;

    try {
        if (!uniqueId) {
            return res.status(400).json({ message: "Unique ID is required." });
        }

        const animal = await TransferAnimal.findOne({ uniqueId });

        if (!animal) {
            return res.status(404).json({ message: "Transfer animal not found." });
        }

        res.status(200).json({
            message: "Transfer animal found successfully.",
            data: animal
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching transferred animal.",
            error: error.message
        });
    }
});


