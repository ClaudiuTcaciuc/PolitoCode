"use strict";
// import modules
const sqlite = require('sqlite3');

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

// get the page by id
exports.getPageByID = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT Pages.*, Users.name FROM Pages, Users WHERE Pages.page_id = ? AND Pages.author_id = Users.id";
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);

                return;
            }
            const page = {
                id: row.page_id,
                title: row.title,
                author_id: row.author_id,
                author: row.name,
                publication_date: row.publication_date,
            }
            resolve(page);
        });
    });
};

exports.getPageContent = (pageId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT ContentBlocks.*, Pages.title FROM ContentBlocks, Pages WHERE ContentBlocks.page_id = ? AND Pages.page_id = ContentBlocks.page_id ";
        db.all(sql, [pageId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const content = rows.map(
                (row) => {
                    return {
                        block_id: row.block_id,
                        block_type: row.block_type,
                        content: row.content,
                        order_index: row.order_index,
                        page_id: row.page_id,
                    }
                }
            );
            resolve(content);
        });
    });
};