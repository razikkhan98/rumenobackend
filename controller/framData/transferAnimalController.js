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

        if (!tagId || !uniqueId || !uid || !date || !animalStatus) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        //  Check if animal exists in Animal collection
        const existingAnimal = await Animal.findOne({ tagId, uniqueId });
        if (!existingAnimal) {
            return res.status(404).json({
                message: "Animal not found. Transfer failed.",
            });
        }

        //Add transfer animal
        const newTransfer = new TransferAnimal({
            tagId,
            uniqueId,
            uid,
            date,
            animalStatus
        })
        await newTransfer.save();

        // Step 2: Delete from Animal collection
        const deleteResult = await Animal.deleteOne({ tagId, uniqueId });

        // Optional: Check if any document was deleted
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







