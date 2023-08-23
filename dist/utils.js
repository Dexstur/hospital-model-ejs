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
exports.doctorName = exports.idMatch = exports.decodeDoctor = exports.decodeAdmin = exports.decodeId = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const doctor_1 = __importDefault(require("./model/doctor"));
function decodeId(req) {
    var _a;
    const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || req.cookies.token;
    if (!token)
        return false;
    const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decode)
        return false;
    return decode._id;
}
exports.decodeId = decodeId;
function decodeAdmin(req) {
    var _a;
    const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || req.cookies.token;
    if (!token)
        return false;
    const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decode)
        return false;
    return decode.isAdmin;
}
exports.decodeAdmin = decodeAdmin;
function decodeDoctor(req) {
    var _a;
    const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || req.cookies.token;
    if (!token)
        return false;
    const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decode)
        return false;
    return decode.isDoctor;
}
exports.decodeDoctor = decodeDoctor;
function idMatch(req, id) {
    var _a;
    const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || req.cookies.token;
    if (!token)
        return false;
    const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decode)
        return false;
    return decode._id === id;
}
exports.idMatch = idMatch;
function doctorName(req) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || req.cookies.token;
        if (!token)
            return false;
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decode)
            return false;
        const doctor = yield doctor_1.default.findById(decode._id);
        if (!doctor)
            return "Doctor";
        return doctor.name;
    });
}
exports.doctorName = doctorName;
