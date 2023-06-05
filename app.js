const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const {
  NotFound,
} = require('./utils/errors');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '647d32c99beaf7b375135a5f',
  };
  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('*', (req, res) => {
  res.status(NotFound).send({ message: 'Указанный путь не найден.' });
});

app.listen(PORT, () => console.log(`App started at port ${PORT}`));
