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
        const sql = "SELECT Pages.*, Users.name FROM Pages, Users WHERE Pages.author_id = Users.id AND Pages.publication_date <= date('now') ORDER BY Pages.publication_date DESC";
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
                    publication_date: dayjs(row.publication_date).format('DD/MM/YYYY'),
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
                    let pub_date = row.publication_date;
                    if (dayjs(pub_date).isValid()) {
                        if (dayjs(pub_date).isBefore(dayjs().add(0, 'day'))) {
                            pub_date = dayjs(pub_date).format('DD/MM/YYYY');
                        }
                        else {
                            pub_date = "Programmed for " + dayjs(pub_date).format('DD/MM/YYYY');
                        }
                    }
                    else {
                        pub_date = "Not published";
                    }
                    return {
                        id: row.page_id,
                        title: row.title,
                        author_id: row.author_id,
                        author: row.name,
                        publication_date: pub_date,
                    }
                }
            );
            resolve(pages);
        });
    });
};
