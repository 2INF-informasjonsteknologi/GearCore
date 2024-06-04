// Packages

import express, {
    Express as E,
    Request as Req,
    Response as Res,
    NextFunction as Next
} from "express";

import {
    IUser,
    Item
} from "./models.ts";

import mongoose from "mongoose";
import session from "express-session";
import crypto from "node:crypto";
import dotenv from "dotenv";
import cors from "cors";
import path from "node:path";
import mw from "./middleware.ts";
import fs from "node:fs";



// Configuration

dotenv.config();

const app: E = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: process.env.ExpressSessionSecret || crypto.randomBytes(20).toString("hex"),
    saveUninitialized: false,
    resave: false
}));

app.use(mw.polishRequest);



// Routing

app.use("/api", require("./routes/api.ts"));



// Interface expansion

declare module "express-session"{
    export interface SessionData{
        user?: IUser
    }
}



// Endpoints

app.get("/", (_, res: Res, next: Next): void | Res => {
    if(fs.existsSync(path.join(__dirname, "public", "index.html"))){
        return res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
    }

    if(fs.existsSync(path.join(__dirname, "public", "not-found.html"))){
        return res.status(200).sendFile(path.join(__dirname, "public", "not-found.html"));
    }

    next();
});

app.get("*", (req: Req, res: Res, next: Next): void | Res => {
    if(fs.existsSync(path.join(__dirname, "public", req.baseUrl + ".html"))){
        return res.status(200).sendFile(path.join(__dirname, "public", req.baseUrl + ".html"));
    }

    if(fs.existsSync(path.join(__dirname, "public", req.baseUrl))){
        return res.status(200).sendFile(path.join(__dirname, "public", req.baseUrl));
    }

    if(fs.existsSync(path.join(__dirname, "public", "not-found.html"))){
        return res.status(200).sendFile(path.join(__dirname, "public", "not-found.html"));
    }

    next();
});

app.all("*", (_, res: Res): void => {
    res.status(404).send({
        code: 404,
        message: {
            en: "This page or endpoint does not exist!",
            no: "Denne siden eller endepunktet finnes ikke!"
        }
    });
});



// Hosting

(async (): Promise<void> => {
    try{
        await mongoose.connect(process.env.MongooseConnectURI || "");
    }
    catch{
        return console.log("Could not connect to MongoDB database!");
    }

    app.listen(4000, "0.0.0.0", (): void => console.log("Server online!"));
})();