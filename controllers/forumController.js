const { db } = require('../config/firebase');
const crypto = require('crypto');

let localForumPosts = [];

const createPost = async (req, res) => {
  const { title, content, tags } = req.body;
  const userId = req.user.uid;

  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Title and content are required' });
  }

  const newPost = {
    id: crypto.randomUUID(),
    userId,
    title,
    content,
    tags: tags || [],
    likes: [],
    replies: [],
    createdAt: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('forum_posts').doc(newPost.id).set(newPost);
    } else {
      localForumPosts.push(newPost);
    }
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getAllPosts = async (req, res) => {
  try {
    let posts = [];
    if (db) {
      const snapshot = await db.collection('forum_posts').orderBy('createdAt', 'desc').get();
      snapshot.forEach(doc => posts.push(doc.data()));
    } else {
      posts = [...localForumPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const replyToPost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.uid;

  if (!content) {
    return res.status(400).json({ success: false, error: 'Reply content is required' });
  }

  const newReply = {
    id: crypto.randomUUID(),
    userId,
    content,
    createdAt: new Date().toISOString()
  };

  try {
    if (db) {
      const postRef = db.collection('forum_posts').doc(postId);
      const post = await postRef.get();
      if (!post.exists) return res.status(404).json({ success: false, error: 'Post not found' });

      const replies = post.data().replies || [];
      replies.push(newReply);
      await postRef.update({ replies });
    } else {
      const post = localForumPosts.find(p => p.id === postId);
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
      post.replies.push(newReply);
    }
    res.status(200).json({ success: true, data: newReply });
  } catch (error) {
    console.error('Error replying to post:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.uid;

  try {
    if (db) {
      const postRef = db.collection('forum_posts').doc(postId);
      const post = await postRef.get();
      if (!post.exists) return res.status(404).json({ success: false, error: 'Post not found' });

      let likes = post.data().likes || [];
      if (likes.includes(userId)) {
        likes = likes.filter(id => id !== userId); // Unlike
      } else {
        likes.push(userId); // Like
      }
      await postRef.update({ likes });
      res.status(200).json({ success: true, data: { likes } });
    } else {
      const post = localForumPosts.find(p => p.id === postId);
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id !== userId);
      } else {
        post.likes.push(userId);
      }
      res.status(200).json({ success: true, data: { likes: post.likes } });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = { createPost, getAllPosts, replyToPost, likePost };
