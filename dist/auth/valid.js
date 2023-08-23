"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const doctor_1 = require("../model/doctor");
const check = {
    doctorSchema: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        name: joi_1.default.string().required(),
        specialization: joi_1.default.string().allow("", null),
        gender: joi_1.default.string()
            .valid(...Object.values(doctor_1.Gender))
            .required(),
        phone: joi_1.default.string().required(),
    }),
    adminSchema: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        name: joi_1.default.string().required(),
        specialization: joi_1.default.string().allow("", null),
        gender: joi_1.default.string()
            .valid(...Object.values(doctor_1.Gender))
            .required(),
        phone: joi_1.default.string().required(),
        adminKey: joi_1.default.string().required(),
    }),
    loginSchema: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
    }),
    reportSchema: joi_1.default.object({
        patientName: joi_1.default.string().required(),
        age: joi_1.default.number().required(),
        hospitalName: joi_1.default.string().required(),
        weight: joi_1.default.string().required(),
        height: joi_1.default.string().required(),
        bloodGroup: joi_1.default.string().required(),
        genotype: joi_1.default.string().required(),
        bloodPressure: joi_1.default.string().required(),
        HIV_Status: joi_1.default.string().required(),
        hepatitis: joi_1.default.string().required(),
    }),
};
exports.default = check;
