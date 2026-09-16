const communityPostModel = require('../models/communityPost.model');
const postReplyModel = require('../models/postReply.model');
const learnerModel = require('../models/learner.model');
const skillAssessmentModel = require('../models/skillAssessment.model');

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

async function getSuccessStories(req, res) {
    const placedLearners = await learnerModel
        .find({ placementStatus: 'placed' })
        .populate('user', 'username')
        .sort({ placedDate: -1 })
        .limit(10);

    const stories = await Promise.all(
        placedLearners.map(async (learner) => {
            const assessments = await skillAssessmentModel
                .find({ learner: learner._id })
                .sort({ createdAt: 1 }); // oldest first

            let growth = null;
            if (assessments.length >= 2) {
                const first = assessments[0];
                const last = assessments[assessments.length - 1];
                growth = {
                    from: first.score,
                    to: last.score,
                    skillCategory: last.skillCategory
                };
            }

            return {
                name: learner.user?.username,
                center: learner.center,
                company: learner.placedCompany,
                role: learner.placedRole,
                placedDate: learner.placedDate,
                growth
            };
        })
    );

    return res.status(200).json({ stories });
}

module.exports = { getPosts, createPost, getReplies, createReply, getSuccessStories };