const mongoose = require('mongoose');
const User = require('../models/user');

const { ValidationError, CastError } = mongoose.Error;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      res.status(500).send({ message: 'Ошибка по-умолчанию.' });
      console.log(err);
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('invalidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof CastError) {
        res.status(400).send({ message: 'Переданы некорректные данные в метод поиска пользователя.' });
      } else if (err.message === 'invalidId') {
        res.status(404).send({ message: 'Пользователь не найден.' });
      } else {
        res.status(500).send({ message: 'Ошибка по-умолчанию.' });
        console.log(err);
      }
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(400).send({ message: 'Переданы некорректные данные в метод создания пользователя.' });
      } else {
        res.status(500).send({ message: 'Ошибка по-умолчанию.' });
        console.log(err);
      }
    });
};

module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(400).send({ message: 'Переданы некорректные данные в метод обновления данных пользователя.' });
      } else {
        res.status(500).send({ message: 'Ошибка по-умолчанию.' });
        console.log(err);
      }
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(400).send({ message: 'Переданы некорректные данные в метод обновления аватара.' });
      } else {
        res.status(500).send({ message: 'Ошибка по-умолчанию.' });
        console.log(err);
      }
    });
};
