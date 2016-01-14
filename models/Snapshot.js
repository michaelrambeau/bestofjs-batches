
var fields, model, mongoose, schema;

mongoose = require('mongoose');

fields = {
  stars: Number,
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project'
  },
  createdAt: {
    type: Date
  }
};

schema = new mongoose.Schema(fields, {
  collection: 'snapshot'
});

model = mongoose.model('Snapshot', schema);

module.exports = model;
