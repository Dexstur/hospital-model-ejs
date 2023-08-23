"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const valid_1 = __importDefault(require("../auth/valid"));
const doctor_1 = __importDefault(require("../model/doctor"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
(0, dotenv_1.config)();
const keycode = process.env.JWT_SECRET;
const oAuth = {
    authenticate: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        //clear cookie and header
        req.headers.authorization = undefined;
        res.clearCookie("token");
        req.cookies.token = undefined;
        //get user input
        const userInput = req.body;
        //trim and lowercase email and store in userInput
        const trimEmail = userInput.email.toLowerCase().trim();
        userInput.email = trimEmail;
        //validate user input
        const { error, value } = valid_1.default.loginSchema.validate(userInput);
        if (error) {
            //if error, return error
            const msg = error.details[0].message;
            console.error(error);
            res.status(400).json({
                message: msg,
                error: error,
            });
            return;
        }
        //if no error, destructure value
        const { email, password } = value;
        try {
            //find user by email
            const user = yield doctor_1.default.findOne({ email });
            if (!user) {
                res.status(400).render("server_error", {
                    message: "invalid credentials",
                    error: "invalid credentials",
                });
                return;
            }
            //compare password
            const isMatch = bcryptjs_1.default.compareSync(password, user.password);
            if (!isMatch) {
                //if password does not match, return error
                res.status(400).render("server_error", {
                    message: "invalid credentials",
                    error: "invalid credentials",
                });
                return;
            }
            //if password matches, create token
            const token = jsonwebtoken_1.default.sign({
                _id: user._id,
                isDoctor: user.isDoctor,
                isAdmin: user.isAdmin,
            }, keycode, { expiresIn: "3h" });
            //to be removed
            // console.log(token);
            //set cookie and header
            res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
            // req.headers = { ...req.headers, authorization: `Bearer ${token}` };
            //return success
            next();
        }
        catch (err) {
            //if error, return error
            const msg = err.message ? err.message : err;
            res.status(500).render("server_error", {
                message: msg,
                error: err,
            });
        }
    }),
    authorise: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        //get token from header or cookie
        const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || req.cookies.token;
        if (!token) {
            //if no token, return error
            res.status(401).render("server_error", {
                message: "unauthorised",
                error: "unauthorised",
            });
            return;
        }
        try {
            //verify token
            const decoded = jsonwebtoken_1.default.verify(token, keycode);
            // console.log(decoded);
            if (!decoded) {
                //if token is invalid, return error
                res.status(401).render("server_error", {
                    message: "Session Lost.",
                    error: "unauthorised",
                });
                return;
            }
            //if token is valid, proceed
            next();
        }
        catch (err) {
            //if error, return error
            res.status(500).render("server_error", {
                message: "failed",
                error: err,
            });
        }
    }),
    adminAction: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        //get token from header or cookie
        const token = ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(" ")[1]) || req.cookies.token;
        if (!token) {
            //if no token, return error
            res.status(401).render("server_error", {
                message: "Unauthorised",
                error: "Please Login",
            });
            return;
        }
        try {
            //verify token
            const decoded = jsonwebtoken_1.default.verify(token, keycode);
            if (!decoded) {
                //if token is invalid, return error
                res.status(401).render("server_error", {
                    message: "Unauthorised",
                    error: "Please Login",
                });
                return;
            }
            if (decoded.isAdmin) {
                //if user is admin proceed
                next();
            }
            else {
                //if user is not admin, return error
                res.status(401).render("server_error", {
                    message: "unauthorised",
                    error: "only admins can perform this action",
                });
            }
        }
        catch (err) {
            //if error, return error
            res.status(500).render("server_error", {
                message: "Server error",
                error: err,
            });
        }
    }),
    doctorAction: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        //get token from header or cookie
        const token = ((_c = req.headers.authorization) === null || _c === void 0 ? void 0 : _c.split(" ")[1]) || req.cookies.token;
        if (!token) {
            //if no token, return error
            res.status(403).render("server_error", {
                title: "MedBay | Error",
                message: "Unauthorised",
                error: "Please Login",
            });
            return;
        }
        try {
            //verify token
            const decoded = jsonwebtoken_1.default.verify(token, keycode);
            if (!decoded) {
                //if token is invalid, return error
                res.status(403).render("doctor_error", {
                    title: "MedBay | Error",
                    message: "Unauthorised. Meet an Admin",
                    error: "You do not have permission to perform this action",
                });
                return;
            }
            if (decoded.isDoctor) {
                //if user is doctor proceed
                next();
            }
            else {
                //if user is not doctor, return error
                res.status(401).render("doctor_error", {
                    title: "MedBay | Error",
                    message: "Unauthorised. Meet an Admin",
                    error: "Only doctors can perform this action",
                });
            }
        }
        catch (err) {
            //if error, return error
            console.error(err);
            res.status(500).render("server error", {
                message: "server error",
                error: err,
            });
        }
    }),
};
exports.default = oAuth;
