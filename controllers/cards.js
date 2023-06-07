const mongoose = require('mongoose');
const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');

const { STATUS_CREATED } = require('../utils/constants');

const { ValidationError, CastError } = mongoose.Error;

const getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(STATUS_CREATED).send({ data: card }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError('Переданы некорректные данные в метод создания карточки.'));
        return;
      }
      next(err);
    });
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена.');
    })
    .then((card) => {
      if (req.user._id === card.owner.toString()) {
        Card.deleteOne(card)
          .then(() => {
            res.send({ data: card });
          })
          .catch(next);
      } else {
        next(new ForbiddenError('У вас нет прав удалять чужие карточки.'));
      }
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestError('Переданы некорректные данные в метод удаления карточки.'));
        return;
      }
      next(err);
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена.');
    })
    .populate('owner')
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestError('Переданы некорректные данные в метод постановки лайка.'));
        return;
      }
      next(err);
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена.');
    })
    .populate('owner')
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestError('Переданы некорректные данные в метод удаления лайка.'));
        return;
      }
      next(err);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
