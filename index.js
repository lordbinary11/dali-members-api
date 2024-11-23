const express = require('express');
const app = express();
const PORT = 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Simulated dataset
const members = require('./dali_members.json'); 

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

// Start server
app.listen(
    PORT,
    () => console.log(`Server running on http://localhost:${PORT}`)
);
