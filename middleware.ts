// Packages

import {
    Request as Req,
    Response as Res,
    NextFunction as Next,
    RequestHandler as ReqHandler
} from "express";

import {
    User,
    Item,
    IUser,
    IItem
} from "./models";

import {
    Document
} from "mongoose";



// Functions

function polishRequest(req: Req, _, next: Next): void{
    req.baseUrl = req.url.split("?")[0];
    next();
}

function requireBody(...keys: Array<string>): ReqHandler{
    return (req: Req, res: Res, next: Next): void | Res => {
        for(let i = 0; i < keys.length; i++){
            if(!req.body.hasOwnProperty(keys[i])){
                return res.status(400).send({
                    code: 400,
                    message: {
                        en: `Request body missing key \"${keys[i]}\"!`,
                        no: `Forespørselen mangler \"${keys[i]}\"!`
                    },
                    key: keys[i]
                });
            }
        }
        next();
    }
}

function requireLogin(req: Req, res: Res, next: Next): void | Res{
    if([null, undefined].includes(req.session.user)){
        return res.status(401).send({
            code: 401,
            message: {
                en: "This action requires a login!",
                no: "Denne handlingen krever innlogging!"
            }
        });
    }
    next();
}

function sanitize<T>(object: T): any{
    if(object instanceof User){
        const result: IUser = object.toJSON();
        ["_id", "password", "__v"].forEach((i: string): void => {
            if(result.hasOwnProperty(i)) delete result[i];
        });
        return result;
    }
    else if(object instanceof Item){
        const result: IItem = object.toJSON();
        ["_id", "__v"].forEach((i: string): void => {
            if(result.hasOwnProperty(i)) delete result[i];
        });
        return result;
    }
    return null;
}

async function refreshUser(req: Req, res: Res, next: Next): Promise<void>{
    if(![null, undefined].includes(req.session.user)) return next();

    if(!req.session.user?.hasOwnProperty("id")){
        delete req.session.user;
        return next();
    }

    const {id} = req.session.user;

    if(!(await User.exists({id}))){
        delete req.session.user;
        return next();
    }

    const user: Document<unknown, {}, IUser> & IUser = await User.findOne({id}) || new User();

    req.session.user = sanitize(user);

    next();
}



// Export

export default {
    polishRequest,
    requireBody,
    requireLogin,
    sanitize,
    refreshUser
};