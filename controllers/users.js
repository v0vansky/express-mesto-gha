const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, STATUS_CREATED } = require('../utils/constants');
const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const NotFoundError = require('../errors/not-found-error');

const { ValidationError, CastError } = mongoose.Error;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then((user) => {
          res.status(STATUS_CREATED).send({
            name,
            about,
            avatar,
            email,
            _id: user._id,
          });
        })
        .catch((err) => {
          if (err instanceof ValidationError) {
            next(new BadRequestError('Переданы некорректные данные в метод создания пользователя.'));
            return;
          }
          if (err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже существует.'));
            return;
          }
          next(err);
        });
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  let id = req.params.userId;
  if (!id) {
    id = req.user._id;
  }
  User.findById({ _id: id })
    .orFail(() => {
      next(new NotFoundError('Пользователь с данным ID не найден'));
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestError('Передан некорректные данные в метод поиска пользователя.'));
        return;
      }
      next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError('Переданы некорректные данные в метод обновления данных пользователя.'));
        return;
      }
      next(err);
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError('Переданы некорректные данные в метод обновления аватара.'));
        return;
      }
      next(err);
    });
};
