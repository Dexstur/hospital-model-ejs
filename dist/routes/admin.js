"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = __importDefault(require("../controller/admin"));
const oAuth_1 = __importDefault(require("../auth/oAuth"));
const report_1 = __importDefault(require("../controller/report"));
const router = express_1.default.Router();
router.post("/new", admin_1.default.create);
router.post("/login", oAuth_1.default.authenticate, admin_1.default.login);
router.use("/va", oAuth_1.default.adminAction);
router.get("/va/dashboard", admin_1.default.dashboard);
router.get("/va/doctor/endorse", admin_1.default.endorseDoctorPage);
router.post("/va/doctor/endorse", admin_1.default.endorseDoctor);
router.post("/va/doctor/delete", admin_1.default.deleteDoctor);
router.get("/va/update", admin_1.default.updatePage);
router.post("/va/update", admin_1.default.update);
router.get("/va/profile", admin_1.default.profile);
router.get("/va/report/all", report_1.default.getAll);
router.get("/va/report/fetch", admin_1.default.fetchReport);
router.post("/va/report/fetch", report_1.default.fetchOne);
router.get("/va/report/k/:reportId", report_1.default.getOne);
router.get("/login", (req, res, next) => {
    res.render("admin_login", { title: "MedBay | Admin" });
});
router.get("/new", (req, res, next) => {
    res.render("admin_signup", { title: "MedBay | Register" });
});
exports.default = router;
