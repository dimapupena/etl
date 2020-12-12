const fs = require('fs');
const csv = require('fast-csv');
const { snakeCase, reduce, pick } = require('lodash');
const knexFile = require('./knexfile');

const knex = require('knex')(knexFile);

const extract = fileName => new Promise(resolve => {
  let headers = [];
  const rows = [];

  const fileStream = fs.createReadStream(fileName, 'utf8');
  const csvParser = csv
    .parseStream(fileStream, { delimiter: ',' })
    .on('data', async data => {
      csvParser.pause();

      if (!headers.length) {
        headers = data;
      } else {
        const object = reduce(data, (acc, curr, index) => {
            acc[snakeCase(headers[index])] = curr;
            return acc;
        }, {});

          const paths = ['id', 'name', 'platform', 'year_of_release', 'developer', 'genre', 'publisher', 'na_sales', 'eu_sales', 'jp_sales', 'other_sales', 'rating'];
          const toInsert = pick(object, paths);

        await knex('pc_game_sales_at_22_dec_2016').insert(toInsert);

        rows.push(object);
      }

      csvParser.resume();
    })
    .on('end', () => {
      resolve(rows);
    })
    .on('error', console.error);
});

const getOrCreateEntityByName = async (entity, nameValue) => {
  const entityObject = await knex.select().from(entity).where({ name: nameValue }).first();
  if (entityObject) {
    return entityObject;
  }

  const result = await knex(entity).insert({ name: nameValue }).returning('*');
  return result[0];
};

const transformAndLoad = async () => {
  const rows = await knex('pc_game_sales_at_22_dec_2016').select();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // Filtering the data
    if(!row.year_of_release) { continue; }
    if(!row.developer) { continue; }
    if(!row.rating) { continue; }


    const platform = await getOrCreateEntityByName('platform', row.platform);
    const genre = await getOrCreateEntityByName('genre', row.genre);
    const developer = await getOrCreateEntityByName('developer', row.developer);
    const publisher = await getOrCreateEntityByName('publisher', row.publisher);

    const [gameId] = await knex('game').insert({
        realease_year: row.year_of_release,
        name: row.name,
        rating: row.rating,
        genre_id: genre.id,
        platform_id: platform.id,
        publisher_id: publisher.id,
        developer_id: developer.id,
    }).returning('id');

    await knex('sales').insert({
        game_id: gameId,
        na_sales: row.na_sales,
        eu_sales: row.eu_sales,
        jp_sales: row.jp_sales,
        other_sales: row.other_sales
    });
  }
};

const etl = async () => {
  try {
    await extract('dataset.csv');
    await transformAndLoad();
    await knex.destroy();
  } catch (err) {
    console.error(err);
  }
};

etl()
  .then(() => console.log('ETL Process finished'))
  .catch(err => console.error('ETL Process error', err));
