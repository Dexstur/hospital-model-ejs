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
const accessKey = process.env.ADMINKEY;
const control = {
    create: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const userInput = req.body;
        const trimEmail = userInput.email.toLowerCase().trim();
        userInput.email = trimEmail;
        const { error, value } = valid_1.default.adminSchema.validate(userInput);
        if (error) {
            console.error(error);
            res.status(400).json({
                message: "invalid input",
                error: error,
            });
            return;
        }
        const { name, email, password, specialization, gender, phone, adminKey } = value;
        if (adminKey !== accessKey) {
            res.status(400).json({
                message: "cannot register admin",
                error: "invalid credentials",
            });
            return;
        }
        try {
            const salt = 10;
            const hash = bcryptjs_1.default.hashSync(password, salt);
            const userAdmin = yield doctor_1.default.create({
                name,
                email,
                password: hash,
                specialization: specialization || "N/A",
                gender,
                phone,
                isDoctor: false,
                isAdmin: true,
            });
            if (userAdmin) {
                const token = jsonwebtoken_1.default.sign({
                    _id: userAdmin._id,
                    isDoctor: userAdmin.isDoctor,
                    isAdmin: userAdmin.isAdmin,
                }, process.env.JWT_SECRET, { expiresIn: "2h" });
                req.headers.authorization = `Bearer ${token}`;
                res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
                res.redirect("/admin/va/dashboard");
                return;
            }
            return res.status(500).json({
                message: "failed",
                error: "something went wrong",
            });
        }
        catch (err) {
            // console.error(err);
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    login: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.redirect("/admin/va/dashboard");
    }),
    dashboard: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const docName = "Admin";
        res.render("admin_dashboard", {
            title: `MedBay | Admin`,
            docName: docName,
        });
    }),
    endorseDoctorPage: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.render("admin_endorse", {
            title: `MedBay | Admin`,
        });
    }),
    endorseDoctor: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const trimEmail = email.toLowerCase().trim();
        try {
            const doc = yield doctor_1.default.findOne({ email: trimEmail });
            if (!doc) {
                res.status(400).json({
                    message: "cross check email",
                    error: "user not found",
                });
                return;
            }
            doc.isDoctor = true;
            doc.save();
            res.render("admin_success", {
                title: `MedBay | Admin`,
                message: `Doctor ${doc.name} has been endorsed`,
                data: doc,
            });
        }
        catch (err) {
            // console.error(err);
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    deleteDoctor: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const trimEmail = email.toLowerCase().trim();
        try {
            const doc = yield doctor_1.default.findOne({ email: trimEmail });
            if (!doc) {
                return res.status(400).json({
                    message: "cross check email",
                    error: "user not found",
                });
            }
            if (doc.isAdmin) {
                return res.status(400).json({
                    message: "cannot delete admin",
                    error: "invalid credentials",
                });
            }
            yield doctor_1.default.deleteOne({ email: trimEmail });
            res.json({
                message: "success",
                data: "deleted",
            });
        }
        catch (err) {
            // console.error(err);
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    profile: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const adminId = (0, utils_1.decodeId)(req);
        try {
            const admin = yield doctor_1.default.findById(adminId);
            if (admin) {
                return res.render("admin_profile", {
                    title: `MedBay | Admin`,
                    data: admin,
                });
            }
            res.status(400).json({
                message: "invalid credentials",
                error: "invalid credentials",
            });
            return;
        }
        catch (err) {
            console.error(err);
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    updatePage: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.render("update_admin", {
            title: `MedBay | Admin`,
        });
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = (0, utils_1.decodeId)(req);
        const userInput = req.body;
        try {
            const user = yield doctor_1.default.findById(_id);
            if (!user) {
                return res.status(403).render("server_error", {
                    title: "MedBay | Error",
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
            res.redirect("/admin/va/profile");
            return;
        }
        catch (err) {
            // console.error(err);
            return res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    fetchReport: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.render("admin_findReport", {
            title: `MedBay | Admin`,
        });
    }),
};
exports.default = control;
