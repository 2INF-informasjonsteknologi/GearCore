// Packages

import {
    Router as R,
    Request as Req,
    Response as Res,
    NextFunction as Next
} from "express";

import {
    Item,
    IItem
} from "../../models.ts";

import {
    Document
} from "mongoose";

import mw from "../../middleware.ts";
import bcrypt from "bcrypt";
import crypto from "node:crypto";



// Configuration

const app: R = R();



// Endpoints

app.get("/@all", async (req: Req, res: Res): Promise<void | Res> => {
    let items: Array<IItem> = [];
    
    (await Item.find()).forEach((i: Document<unknown, {}, IItem> & IItem) => {
        items.push(mw.sanitize(i));
    });

    res.status(200).send(items);
});

app.get("/:id", async (req: Req, res: Res): Promise<void | Res> => {
    const {id} = req.params;

    if(!(await Item.exists({id}))){
        return res.status(404).send({
            code: 404,
            message: {
                en: "This item does not exist!",
                no: "Denne gjenstanden finnes ikke!"
            }
        });
    }

    const item: Document<unknown, {}, IItem> & IItem = await Item.findOne({id}) || new Item();

    res.status(200).send(mw.sanitize(item));
});



// Export

module.exports = app;