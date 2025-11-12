const Knex = require('knex');
const { Model } = require('objection');
const config = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const knex = Knex(config[environment]);

Model.knex(knex);

module.exports = knex;