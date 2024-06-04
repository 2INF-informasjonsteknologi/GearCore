// Packages

import {
    Router as R,
    Request as Req,
    Response as Res,
    NextFunction as Next
} from "express";

import {
    Item,
    IItem,
    User,
    IUser
} from "../../models.ts";

import {
    Document
} from "mongoose";

import mw from "../../middleware.ts";



// Configuration

const app: R = R();



// Endpoints

app.get("/@all", async (_, res: Res): Promise<void | Res> => {
    let items: Array<IItem> = [];

    (await Item.find({})).forEach((i: Document<unknown, {}, IItem> & IItem) => {
        items.push(mw.sanitize(i));
    });

    res.status(200).send(items);
});

app.get("/@all-mine", mw.requireLogin, async (req: Req, res: Res): Promise<void | Res> => {
    let items: Array<IItem> = [];

    (await Item.find({borrowedBy: req.session.user.id})).forEach((i: Document<unknown, {}, IItem> & IItem) => {
        items.push(mw.sanitize(i));
    });

    res.status(200).send(items);
});

app.get("/borrow/:id", mw.requireLogin, async (req: Req, res: Res): Promise<void | Res> => {
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

    if(item.borrowedBy != "null"){
        return res.status(409).send({
            code: 409,
            message: {
                en: "This item is already borrowed!",
                no: "Denne gjenstanden er allerede lånt ut!"
            }
        });
    }

    item.borrowedBy = req.session.user.id;
    await item.save();

    const user: Document<unknown, {}, IUser> & IUser = await User.findOne({id: req.session.user.id}) || new User();
    
    user.items.push(item.id);
    await user.save();

    res.status(200).send({
        code: 200,
        message: {
            en: "Item registered as borrowed successfully!",
            no: "Utlån registrering vellykket!"
        }
    });
});

app.get("/return/:id", mw.requireLogin, async (req: Req, res: Res): Promise<void | Res> => {
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

    if(item.borrowedBy != req.session.user.id){
        return res.status(409).send({
            code: 403,
            message: {
                en: "This item is not borrowed by you!",
                no: "Denne gjenstanden er ikke lånt ut til deg!"
            }
        });
    }    

    const user: Document<unknown, {}, IUser> & IUser = await User.findOne({id: req.session.user.id}) || new User();

    user.items.splice(
        user.items.indexOf(item.borrowedBy),
        1
    );
    await user.save();

    item.borrowedBy = "null";
    await item.save();

    res.status(200).send({
        code: 200,
        message: {
            en: "Item returned successfully!",
            no: "Gjenstand retur vellykket!"
        }
    });
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