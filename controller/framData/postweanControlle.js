const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalPostWean = require("../../model/framData/postWeanModal");
const ChildAnimal = require("../../model/framData/childFromModal");

exports.addPostWean = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      parentUniqueId,
      childUniqueId,
      weightKg,
      weightGm,
      bodyScore,
      weanDate,
      weanComment,
    } = req.body;

    if (!parentUniqueId && !childUniqueId) {
      return res.status(400).json({
        message: "Either parentUniqueId or childUniqueId is required.",
      });
    }

    let parentExists = null;
    let childExists = null;

    // Check if Parent exists
    if (parentUniqueId) {
      parentExists = await Animal.findOne({ uniqueId: parentUniqueId });
      if (!parentExists) {
        return res.status(404).json({ message: "Parent not found." });
      }
    }

    // Check if Child exists
    if (childUniqueId) {
      childExists = await ChildAnimal.findOne({ uniqueId: childUniqueId });
      if (!childExists) {
        return res.status(404).json({ message: "Child not found." });
      }
    }

    const postWeanId = parentUniqueId || childUniqueId;

    // Create new Post WEAN data
    const AnimalPostWeanData = await AnimalPostWean.create({
      postWeanId,
      weightKg,
      weightGm,
      bodyScore,
      weanDate,
      weanComment,
    });

    // Update Parent Record if parentUniqueId is provided
    if (parentExists) {
      await Animal.findOneAndUpdate(
        { uniqueId: parentUniqueId },
        { $push: { postWean: AnimalPostWeanData } }, // Storing only ObjectId
        { new: true }
      );
    }

    // Update Child Record if childUniqueId is provided
    if (childExists) {
      await ChildAnimal.findOneAndUpdate(
        { uniqueId: childUniqueId },
        { $push: { postWean: AnimalPostWeanData } }, // Storing only ObjectId
        { new: true }
      );
    }

    res.status(201).json({
      message: "Post WEAN added successfully",
      data: AnimalPostWeanData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add Post Wean data.",
      error: error.message,
    });
  }
});

// Delete Post Wean Parent and Child

exports.deletePostWean = asyncHandler(async (req, res) => {
  const { postWeanId } = req.params;
  console.log(postWeanId);

  if (!postWeanId) {
    return res.status(400).json({ message: "No postWeanId provided" });
  }

  try {
    // Find Post Wean Entry
    const postWean = await AnimalPostWean.findOne({ postWeanId: postWeanId });
    if (!postWean) {
      return res.status(404).json({ message: "Post Wean not found" });
    }

    // Remove references from Parent & Child
    await Animal.updateMany(
      { uniqueId: postWeanId },
      { $pull: { postWean: postWeanId } }
    );
    await ChildAnimal.updateMany(
      { uniqueId: postWeanId },
      { $pull: { postWean: postWeanId } }
    );

    // Delete Post Wean Entry
    await AnimalPostWean.deleteOne({ postWeanId: postWeanId });

    res.json({ message: "Post Wean deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});
