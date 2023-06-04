"use strict";

const sqlite = require("sqlite3");
const crypto = require("crypto");
const e = require("express");

const db = new sqlite.Database("films.db", (err) => {
    if (err) throw err;
});

exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            else if (row === undefined) {
                resolve({ error: "User not found." });
                return;
            }
            const user = { id: row.id, username: row.email, name: row.name };
            resolve(user);
        });
    });
};

exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {     
        const sql = "SELECT * FROM users WHERE email = ?";
        db.get(sql, [email], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            else if (row === undefined) {
                resolve(false);
                return;
            }
            const user = { id: row.id, username: row.email, name: row.name };
            const salt = row.salt;
            crypto.scrypt (password, salt, 32, (err, hashedPassword) => {
                if (err) {
                    reject(err);
                    return;
                }
                const passwordHex = Buffer.from(row.hash, "hex");
                if (!crypto.timingSafeEqual(hashedPassword, passwordHex)) {
                    resolve(false);
                    return;
                }
                resolve(user);
            });
        });
    });
};