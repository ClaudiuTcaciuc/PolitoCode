"use strict";
// import modules
const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database("CSM_Small.db", (err) => {
    if (err) throw err;
});

// get all the public pages
exports.getPubPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT Pages.*, Users.name FROM Pages, Users WHERE Pages.author_id = Users.id AND Pages.publication_date <= date('now', 'localtime') ORDER BY Pages.publication_date DESC";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const pages = rows.map(
                (row) => ({
                    id: row.page_id,
                    title: row.title,
                    author_id: row.author_id,
                    author: row.name,
                    publication_date: row.publication_date,
                })
            );
            resolve(pages);
        });
    });
}

// get all the pages
exports.getPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT Pages.*, Users.name FROM Pages, Users WHERE Pages.author_id = Users.id ORDER BY Pages.publication_date DESC";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);

                return;
            }
            const pages = rows.map(
                (row) => {
                    return {
                        id: row.page_id,
                        title: row.title,
                        author_id: row.author_id,
                        author: row.name,
                        publication_date: row.publication_date,
                    }
                }
            );
            resolve(pages);
        });
    });
};
