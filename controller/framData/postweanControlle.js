const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalPostWean = require("../../model/framData/postWeanModal");
const ChildAnimal = require("../../model/framData/childFromModal");
const mongoose = require("mongoose");

// --------------------------------------------------latest codes------------------------------------

exports.createPostWean = async (req, res) => {
  const { tagId, kidWeight, bodyScore, weanDate, uid } = req.body;

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
      uid,
    });
    res.status(201).json({success:true, message:"Post wean added successfully",newPost});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPostWeans = async (req, res) => {
  try {
    const posts = await AnimalPostWean.find({ uid: req?.query.uid }).sort({
      createdAt: -1,
    });
    res.status(200).json({success:true, data:posts});
  } catch (error) {
    console.error("Error fetching postwean records:", error);
    res.status(500).json({success: false,
      message: "Failed to fetch postwean records",
       error: error.message });
  }
};

exports.getPostWeanById = async (req, res) => {
  try {
    const post = await AnimalPostWean.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "PostWean not found" });
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePostWean = async (req, res) => {
  const { tagId, kidWeight, bodyScore, weanDate, uid } = req.body;

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
      { tagId, kidWeight, bodyScore, weanDate, uid },
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
