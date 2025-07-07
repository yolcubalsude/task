const mongoose = require('mongoose');  

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  finalDate: { type: Date, required: true },
  actualStartDate: { type: Date },
  actualFinishDate: { type: Date },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false }
});
    
module.exports = mongoose.model('Task', TaskSchema);
