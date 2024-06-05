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
import crypto from "node:crypto";



// Configuration

const app: R = R();



// Endpoints

app.get("/@all", async (_, res: Res): Promise<void | Res> => {
    let items: Array<IItem> = [];

    (await Item.find({})).forEach((i: Document<unknown, {}, IItem> & IItem) => {
        items.push(mw.sanitize(i));
    });

    res.status(200).send(items.reverse());
});

app.get("/@all-mine", mw.requireLogin, async (req: Req, res: Res): Promise<void | Res> => {
    let items: Array<IItem> = [];

    (await Item.find({borrowedBy: req.session.user.id})).forEach((i: Document<unknown, {}, IItem> & IItem) => {
        items.push(mw.sanitize(i));
    });

    res.status(200).send(items.reverse());
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

app.put("/:id", async (req: Req, res: Res): Promise<void | Res> => {
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

    let changedKeys: Array<string> = [];

    Object.keys(req.body).forEach((i: string) => {
        if([
            "producer",
            "description",
            "specs",
            "dateOfPurchase",
            "price",
            "lifetime",
            "category"
        ].includes(i)){
            switch(i){
                case "dateOfPurchase":
                    item.dateOfPurchase = new Date(req.body.dateOfPurchase);
                    break;

                case "price": {
                    const parse: number = parseFloat(req.body.price);
                    if(parse == req.body.price) item.price = parse;
                    break;
                }

                case "lifetime": {
                    const parse: number = parseFloat(req.body.lifetime);
                    if(parse == req.body.lifetime) item.lifetime = parse;
                    break;
                }

                default: item[i] = req.body[i];
            }
        }
    });

    try{
        await item.save();

        res.status(200).send({
            code: 200,
            message: {
                en: `Successfully updated keys: ${changedKeys.join(", ")}!`,
                no: `Oppdatering vellykket!: ${changedKeys.join(", ")}`
            }
        });
    }
    catch{
        res.status(400).send({
            code: 400,
            message: {
                en: "Could not resolve update!",
                no: "Kunne ikke forstå oppdateringen!"
            }
        });
    }
});

app.delete("/:id", async (req: Req, res: Res): Promise<void | Res> => {
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

    await Item.deleteOne({id});

    res.status(200).send({
        code: 200,
        message: {
            en: "Item deleted successfully!",
            no: "Sletting vellykket!"
        }
    });
});

app.post("/new", mw.requireBody(
    "producer",
    "description",
    "specs",
    "dateOfPurchase",
    "price",
    "lifetime",
    "category"
), async (req: Req, res: Res): Promise<void | Res> => {
    const body: {
        producer: string,
        description: string,
        specs: string,
        dateOfPurchase: string,
        price: string,
        lifetime: string,
        category: string
    } = req.body;

    await new Item({
        id: await getId(),
        producer: body.producer,
        description: body.description,
        specs: body.specs,
        dateOfPurchase: new Date(body.dateOfPurchase),
        price: parseFloat(body.price),
        lifetime: parseFloat(body.lifetime),
        category: body.category,
        borrowedBy: "null"
    }).save();

    res.status(200).send({});
});



// Functions

async function getId(): Promise<string>{
    let id: string = crypto.randomBytes(20).toString("hex");
    while(await Item.exists({id})) id = crypto.randomBytes(20).toString("hex");
    return id;
}



// Export

module.exports = app;