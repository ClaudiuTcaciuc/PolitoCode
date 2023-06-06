"use strict";
// import modules
const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database("CSM_Small.db", (err) => {
    if (err) throw err;
});

// get all the pages
exports.getPagesForView = () => {
    return new Promise ((resolve, reject) => {
        const sql = "SELECT Pages.*, Users.name FROM Pages, Users WHERE Pages.author_id = Users.id";
        db.all(sql, [], (err, rows) => {
            if (err){
                reject(err);
                return;
            }
            const pages = rows.map(
                (row) => ({
                    id: row.id,
                    title: row.title,
                    author_id: row.author_id,
                    author: row.name,
                    pubblication_date: row.pubblication_date
                })
            );
            resolve(pages);
        });
    });
}

