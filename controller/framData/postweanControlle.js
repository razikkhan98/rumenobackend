const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalPostWean = require("../../model/framData/postWeanModal");
const ChildAnimal = require("../../model/framData/childFromModal");
const mongoose = require("mongoose");

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
    console.log(childUniqueId, "childUniqueId");

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

// Update Post Wean Parent and Child

exports.updatePostWean = asyncHandler(async (req, res) => {
  let { postWeanId } = req.params;
  console.log("Received postWeanId:", postWeanId);

  // If postWeanId is numeric or a custom string, skip ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(postWeanId) && !isNaN(postWeanId)) {
    return res.status(400).json({ message: "Invalid postWeanId format" });
  }

  try {
    const { weightKg, weightGm, bodyScore, weanDate, weanComment } = req.body;

    const updatedPostWean = await AnimalPostWean.findOneAndUpdate(
      { postWeanId }, // ✅ Match `postWeanId` directly
      { weightKg, weightGm, bodyScore, weanDate, weanComment },
      { new: true }
    );

    if (!updatedPostWean) {
      return res.status(404).json({ message: "Post Wean not found." });
    }

    res.json({
      message: "Post Wean updated successfully",
      data: updatedPostWean,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to update Post Wean data.",
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

// --------------------------------------------------latest codes------------------------------------

exports.createPostWean = async (req, res) => {
  const { tagId, kidWeight, bodyScore, weanDate, uId } = req.body;

  if (!tagId || typeof tagId !== "string") {
    return res
      .status(400)
      .json({ error: "tagId is required and must be a string" });
  }

  if (kidWeight && isNaN(kidWeight)) {
    return res.status(400).json({ error: "kidWeight must be a number" });
  }

  if (bodyScore && isNaN(bodyScore)) {
    return res.status(400).json({ error: "bodyScore must be a number" });
  }

  if (weanDate && !/^\d{4}-\d{2}-\d{2}$/.test(weanDate)) {
    return res
      .status(400)
      .json({ error: "weanDate must be in YYYY-MM-DD format" });
  }

  try {
    const newPost = await AnimalPostWean.create({
      tagId,
      kidWeight,
      bodyScore,
      weanDate,
      uId,
    });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPostWeans = async (req, res) => {
  try {
    const posts = await AnimalPostWean.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPostWeanById = async (req, res) => {
  try {
    const post = await AnimalPostWean.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "PostWean not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePostWean = async (req, res) => {
  const { tagId, kidWeight, bodyScore, weanDate, uId } = req.body;

  if (tagId && typeof tagId !== "string") {
    return res.status(400).json({ error: "tagId must be a string" });
  }

  if (kidWeight && isNaN(kidWeight)) {
    return res.status(400).json({ error: "kidWeight must be a number" });
  }

  if (bodyScore && isNaN(bodyScore)) {
    return res.status(400).json({ error: "bodyScore must be a number" });
  }

  if (weanDate && !/^\d{4}-\d{2}-\d{2}$/.test(weanDate)) {
    return res
      .status(400)
      .json({ error: "weanDate must be in YYYY-MM-DD format" });
  }

  try {
    const updatedPost = await AnimalPostWean.findByIdAndUpdate(
      req.params.id,
      { tagId, kidWeight, bodyScore, weanDate, uId },
      { new: true }
    );

    if (!updatedPost)
      return res.status(404).json({ error: "PostWean not found" });

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePostWean = async (req, res) => {
  try {
    const deleted = await AnimalPostWean.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "PostWean not found" });

    res.status(200).json({ message: "PostWean deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

