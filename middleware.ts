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

function sanitize<T>(object: T): any{
    if(object instanceof User){
        const result: IUser = object.toJSON();
        ["password", "__v"].forEach((i: string): void => {
            if(result.hasOwnProperty(i)) delete result[i];
        });
        return result;
    }
    else if(object instanceof Item){
        const result: IItem = object.toJSON();
        ["__v"].forEach((i: string): void => {
            if(result.hasOwnProperty(i)) delete result[i];
        });
        return result;
    }
    return null;
}



// Export

export default {
    polishRequest,
    requireBody,
    sanitize
};