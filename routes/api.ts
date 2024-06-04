// Packages

import {
    Router as R,
    Request as Req,
    Response as Res,
    NextFunction as Next
} from "express";



// Configuration

const app: R = R();



// Endpoints

app.get("/session", (req: Req, res: Res): Res => res.status(200).send(req.session));



// Routing

app.use("/user", require("./api/user.ts"));
app.use("/item", require("./api/item.ts"));



// Export

module.exports = app;