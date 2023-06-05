const mongoose = require('mongoose');
const Card = require('../models/card');
const {
  BadRequest,
  NotFound,
  ServerError,
  Created,
} = require('../utils/errors');

const { ValidationError, CastError } = mongoose.Error;

const getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      res.status(ServerError).send({ message: 'Ошибка по-умолчанию.' });
      console.log(err);
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(Created).send({ data: card }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(BadRequest).send({ message: 'Переданы некорректные данные в метод создания карточки.' });
      } else {
        res.status(ServerError).send({ message: 'Ошибка по-умолчанию.' });
        console.log(err);
      }
    });
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('invalidId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError) {
        res.status(BadRequest).send({ message: 'Переданы некорректные данные в метод удаления карточки.' });
      } else if (err.message === 'invalidId') {
        res.status(NotFound).send({ message: 'Карточка не найдена.' });
      } else {
        res.status(ServerError).send({ message: 'Ошибка по-умолчанию.' });
        console.log(err);
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('invalidId'))
    .populate('owner')
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError) {
        res.status(BadRequest).send({ message: 'Переданы некорректные данные в метод постановки лайка.' });
      } else if (err.message === 'invalidId') {
        res.status(NotFound).send({ message: 'Карточка не найдена.' });
      } else {
        res.status(ServerError).send({ message: 'Ошибка по-умолчанию.' });
        console.log(err);
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('invalidId'))
    .populate('owner')
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError) {
        res.status(BadRequest).send({ message: 'Переданы некорректные данные в метод удаления лайка.' });
      } else if (err.message === 'invalidId') {
        res.status(NotFound).send({ message: 'Карточка не найдена.' });
      } else {
        res.status(ServerError).send({ message: 'Ошибка по-умолчанию.' });
        console.log(err);
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
