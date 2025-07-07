require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');


const app = express();
app.use(express.json());
const cors = require('cors');

app.use(cors());

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);




app.patch('/tasks/:id/start', async (req, res) => {
  const { id } = req.params;
  const { actualStartDate } = req.body;
  const task = await Task.findById(id);
  if(task.actualStartDate){
    return res.status(400).json({ error: 'Görev zaten başlamış' });
  }

  task.actualStartDate = actualStartDate;
  task.completed = false;
  await task.save();

  res.json(task);
})
app.patch('/tasks/:id/finish', async (req, res) => {
  const { id } = req.params;
  const { actualFinishDate , completed } = req.body;
  const task = await Task.findById(id);
  if(task.actualFinishDate){
    return res.status(400).json({ error: 'Görev zaten bitmiş' });
  }
  task.actualFinishDate = actualFinishDate;
  task.completed = completed;
  await task.save();
  res.json(task);
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

const Task = require('./models/Task');
const auth = require('./middleware/auth');

app.post('/tasks', auth, async (req, res) => {
  if(req.body.startDate > req.body.finalDate){
    return res.status(400).json({ error: 'Başlangıç tarihi bitiş tarihinden büyük olamaz' });
  }
  const task = new Task({ ...req.body, userId: req.user.userId }); // görev kime ait belli
  await task.save();
  res.status(201).json(task);
});

app.get('/tasks', auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.userId, isDeleted: false });
  res.json(tasks);
});

app.patch('/tasks/:id', auth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  let { title, dueDate } = req.body;
  title = title.trim();
  dueDate = dueDate ? new Date(dueDate) : null;
  const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
  const finalDate = req.body.finalDate ? new Date(req.body.finalDate) : null;
  console.log("logg");
  console.log(req.body);
  try {
    const existingTask = await Task.findOne({ title });
    console.log(existingTask);
    console.log(req.body.title);
    if (existingTask) {
      return res.status(400).json({ error: 'Bu görev zaten mevcut' });
    }
    if(new Date(startDate) > new Date(finalDate)){
      return res.status(400).json({ error: 'Başlangıç tarihi bitiş tarihinden büyük olamaz' });
    }
    const task = new Task(req.body);

    console.log("task");

    console.log(task);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/tasks/:id', auth, async (req, res) => {
  const updates = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      {
      new: true,
      runValidators: true
    });
  
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
  
    res.json(updatedTask);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
     
});

 



  app.get('/tasks', auth, async (req, res) => {
    try {
      const tasks = await Task.find({
        userId: req.user.userId,
        isDeleted: false // sadece silinmemiş olanları al
      });
      res.json(tasks);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });
   
  


   app.patch('/tasks/:id/delete', auth, async (req, res) => {
    const { id } = req.params;
    const task = await Task.findOneAndUpdate(
      {_id: id, userId: req.user.userId, isDeleted: false},
      { isDeleted: true },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await task.save();
    res.json({ message: 'Task deleted successfully' });
   })


   
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

