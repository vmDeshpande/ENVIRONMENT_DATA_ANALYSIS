const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://admin:admin123@cluster0.z8fga1m.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..' ,'frontend', 'public', 'index.html'));
});

app.post('/user/location', async (req, res) => {
    const userLocation = req.body;
    console.log('User Location:', userLocation);
    res.status(200).send('User location received successfully');
});

const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    feedback: String,
  });
  
  const Feedback = mongoose.model('Feedback', feedbackSchema);

app.post('/submit-feedback', async (req, res) => {
    const { name, email, feedback } = req.body;
    try {
    const newFeedback = new Feedback({ name, email, feedback });  
    await newFeedback.save();
    res.json({ message: 'Feedback send successful' });
    } catch (error) {
        res.status(500).json({ message: 'Feedback sending failed', error: error.message });
    }
});  

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', 'public', '404.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
