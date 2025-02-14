//blog
const mongoose = require("mongoose");

const adminBlogSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        default: null
    },
    keywords: {
        type: Array,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    heading: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    metadescription: {
        type: String,
        default: null
    },
    script: {
        type: String,
        default: null
    },
},
    { timestamps: true }

);

module.exports = mongoose.model("AdminBlog", adminBlogSchema);

