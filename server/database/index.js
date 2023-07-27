const mongoose = require('mongoose');
require('dotenv').config()

mongoose.set('strictQuery', false);
mongoose.connect(process.env.LOCAL_MONGODB_DB).then(() => console.log('Connected to DB')).catch((err) => console.log(err));