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
const utils_1 = require("../utils");
(0, dotenv_1.config)();
const control = {
    create: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const userInput = req.body;
        const trimEmail = userInput.email.toLowerCase().trim();
        userInput.email = trimEmail;
        const { error, value } = valid_1.default.doctorSchema.validate(userInput);
        if (error) {
            // console.error(error);
            res.status(400).json({
                message: "invalid input",
                error: error,
            });
            return;
        }
        const { name, email, password, specialization, gender, phone } = value;
        try {
            const salt = 10;
            const hash = bcryptjs_1.default.hashSync(password, salt);
            const user = yield doctor_1.default.create({
                name,
                email,
                password: hash,
                specialization: specialization || "N/A",
                gender,
                phone,
                isDoctor: false,
                isAdmin: false,
            });
            if (user) {
                const token = jsonwebtoken_1.default.sign({
                    _id: user._id,
                    isDoctor: user.isDoctor,
                    isAdmin: user.isAdmin,
                }, process.env.JWT_SECRET, { expiresIn: "2h" });
                // console.log(token);
                //set cookie and header
                req.headers = Object.assign(Object.assign({}, req.headers), { authorization: `Bearer ${token}` });
                res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
                res.redirect("/users/v/dashboard");
                return;
            }
            return res.status(500).render("server_error", {
                message: "server error",
            });
        }
        catch (err) {
            // console.error(err);
            return res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    login: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.redirect("/users/v/dashboard");
    }),
    dashboard: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const docName = yield (0, utils_1.doctorName)(req);
        res.render("doctor_dashboard", { title: "MedBay | Doctor", docName });
    }),
    profile: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = (0, utils_1.decodeId)(req);
        try {
            const user = yield doctor_1.default.findById(_id);
            if (user) {
                return res.status(200).render("doctor_profile", {
                    title: "MedBay | Profile",
                    data: user,
                });
            }
            return res.status(403).render("doctor_error", {
                title: "MedBay | Profile",
                message: "Something went wrong",
                error: "Try logging in",
            });
        }
        catch (err) {
            // console.error(err);
            return res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = (0, utils_1.decodeId)(req);
        const userInput = req.body;
        try {
            const user = yield doctor_1.default.findById(_id);
            if (!user) {
                return res.status(403).render("doctor_error", {
                    title: "MedBay | Profile",
                    message: "Something went wrong",
                    error: "Try logging in",
                });
            }
            userInput.email = null;
            userInput.password = null;
            userInput.isDoctor = null;
            userInput.isAdmin = null;
            for (const field in userInput) {
                if (!userInput[field]) {
                    //falsy fields should not update
                    delete userInput[field];
                }
            }
            yield Object.assign(user, userInput);
            yield user.save();
            res.redirect("/users/v/profile");
        }
        catch (err) {
            // console.error(err);
            return res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    logout: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.clearCookie("token");
        req.headers.authorization = undefined;
        res.redirect("/");
    }),
};
exports.default = control;
