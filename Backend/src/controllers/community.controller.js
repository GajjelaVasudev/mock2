const communityPostModel = require('../models/communityPost.model');
const postReplyModel = require('../models/postReply.model');

async function getPosts(req, res) {
    const posts = await communityPostModel
        .find()
        .populate('author', 'username role')
        .sort({ createdAt: -1 });

    return res.status(200).json({ posts });
}

async function createPost(req, res) {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'content is required' });
    }

    const post = await communityPostModel.create({
        author: req.user.id,
        content
    });

    return res.status(201).json({ message: 'Post created', post });
}

async function getReplies(req, res) {
    const replies = await postReplyModel
        .find({ post: req.params.id })
        .populate('author', 'username role')
        .sort({ createdAt: 1 });

    return res.status(200).json({ replies });
}

async function createReply(req, res) {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'content is required' });
    }

    const post = await communityPostModel.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    const reply = await postReplyModel.create({
        post: req.params.id,
        author: req.user.id,
        content
    });

    return res.status(201).json({ message: 'Reply added', reply });
}

module.exports = { getPosts, createPost, getReplies, createReply };