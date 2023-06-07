const regexFilter = /https?:\/\/(www\.)?[-a-zA-Z0-9:%._+~#=]{1,}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const {
  JWT_SECRET = '81956041dd0f842e7d817e60368b704e37909374c8551e33bbe2f6ebbd3c3843',
} = process.env;
const STATUS_CREATED = 201;

module.exports = { regexFilter, JWT_SECRET, STATUS_CREATED };
