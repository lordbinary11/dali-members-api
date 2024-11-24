const express = require('express');
const app = express();
const PORT = 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Simulated datasets
const members = require('./dali_members.json');
const posts = require('./posts.json'); // Initialize an empty array for posts

// GET /members - Retrieve all members
app.get('/members', (req, res) => {
    res.status(200).json(members);
});

// GET /members/:id - Retrieve a specific member by ID
app.get('/members/:id', (req, res) => {
    const { id } = req.params;
    const member = members.find(m => m.id === parseInt(id));
    
    if (!member) {
        return res.status(404).send({ message: `Member with ID ${id} not found` });
    }

    res.status(200).json(member);
});

// POST /members - Add a new member
app.post('/members', (req, res) => {
    const newMember = req.body;

    if (!newMember.name || !newMember.year) {
        return res.status(400).send({ message: 'Name and year are required fields' });
    }

    newMember.id = members.length + 1; // Simple auto-increment ID
    members.push(newMember);

    res.status(201).json(newMember);
});

// PUT /members/:id - Update an existing member
app.put('/members/:id', (req, res) => {
    const { id } = req.params;
    const updatedInfo = req.body;

    const memberIndex = members.findIndex(m => m.id === parseInt(id));
    if (memberIndex === -1) {
        return res.status(404).send({ message: `Member with ID ${id} not found` });
    }

    const updatedMember = { ...members[memberIndex], ...updatedInfo };
    members[memberIndex] = updatedMember;

    res.status(200).json(updatedMember);
});

// DELETE /members/:id - Delete a specific member
app.delete('/members/:id', (req, res) => {
    const { id } = req.params;
    const memberIndex = members.findIndex(m => m.id === parseInt(id));

    if (memberIndex === -1) {
        return res.status(404).send({ message: `Member with ID ${id} not found` });
    }

    const deletedMember = members.splice(memberIndex, 1);
    res.status(200).json(deletedMember);
});

// GET /members/filter - Filter members by criteria (e.g., major, role)
app.get('/members/filter', (req, res) => {
    const { major, dev } = req.query;

    let filteredMembers = members;

    if (major) {
        filteredMembers = filteredMembers.filter(m => m.major.toLowerCase() === major.toLowerCase());
    }

    if (dev) {
        const devStatus = dev.toLowerCase() === 'true';
        filteredMembers = filteredMembers.filter(m => m.dev === devStatus);
    }

    res.status(200).json(filteredMembers);
});

// --- POSTS ENDPOINTS ---

// GET /posts - Retrieve all posts
app.get('/posts', (req, res) => {
    res.status(200).json(posts);
});

// POST /posts - Add a new post
app.post('/posts', (req, res) => {
    const { content, daliUID } = req.body;

    if (!content || !daliUID) {
        return res.status(400).send({ message: 'Content and DALI-UID are required' });
    }

    const member = members.find(m => m.daliUID === daliUID);
    if (!member) {
        return res.status(404).send({ message: 'Invalid DALI-UID' });
    }

    const newPost = {
        id: posts.length + 1, // Auto-increment ID
        content,
        author: { id: member.id, name: member.name, major: member.major },
        reactions: [],
    };

    posts.push(newPost);
    res.status(201).json(newPost);
});

//POST /post/:id/reactions - react to a post
app.post('/posts/:id/reactions', (req, res) => {
    const { id } = req.params;
    const { type, daliUID } = req.body;

    if (!type || !daliUID) {
        return res.status(400).send({ message: 'Reaction type and DALI-UID are required' });
    }

    const post = posts.find(p => p.id === parseInt(id));
    if (!post) {
        return res.status(404).send({ message: 'Post not found' });
    }

    const member = members.find(m => m.daliUID === daliUID);
    if (!member) {
        return res.status(404).send({ message: 'Invalid DALI-UID' });
    }

    post.reactions.push({
        user: { id: member.id, name: member.name },
        type,
    });

    res.status(201).send(post);
});

//GET /posts/:id/reactions - get post reactions with user details
app.get('/posts/:id/reactions', (req, res) => {
    const { id } = req.params;

    const post = posts.find(p => p.id === parseInt(id));
    if (!post) {
        return res.status(404).send({ message: 'Post not found' });
    }

    res.status(200).json(post.reactions);
});

// DELETE /posts/:id - Delete a specific post
app.delete('/posts/:id', (req, res) => {
    const { id } = req.params;
    const postIndex = posts.findIndex(p => p.id === parseInt(id));

    if (postIndex === -1) {
        return res.status(404).send({ message: `Post with ID ${id} not found` });
    }

    const deletedPost = posts.splice(postIndex, 1);
    res.status(200).json(deletedPost);
});

// Start server
app.listen(
    PORT,
    () => console.log(`Server running on http://localhost:${PORT}`)
);
