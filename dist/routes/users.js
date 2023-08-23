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
const express_1 = __importDefault(require("express"));
const doctor_1 = __importDefault(require("../controller/doctor"));
const report_1 = __importDefault(require("../controller/report"));
const oAuth_1 = __importDefault(require("../auth/oAuth"));
const router = express_1.default.Router();
/* GET users listing. */
router.get("/", function (req, res, next) {
    res.send("respond with a resource");
});
router.post("/new", doctor_1.default.create);
router.use("/v", oAuth_1.default.authorise);
router.post("/login", oAuth_1.default.authenticate, doctor_1.default.login);
router.get("/v/dashboard", doctor_1.default.dashboard);
router.get("/v/profile", doctor_1.default.profile);
router.post("/v/update", doctor_1.default.update);
router.use("/v/report", oAuth_1.default.doctorAction);
router.post("/v/report/create", report_1.default.create);
router.get("/v/report/all", report_1.default.getAll);
router.post("/v/report/fetch", report_1.default.fetchOne);
router.get("/v/report/k/:reportId", report_1.default.getOne);
router.post("/v/report/k/:reportId/update", report_1.default.update);
router.get("/v/report/k/:reportId/update", report_1.default.getOne);
router.get("/v/report/mine", report_1.default.getMyReports);
router.get("/v/report/k/:reportId/delete", report_1.default.confirmDelete);
router.post("/v/report/k/:reportId/delete", report_1.default.delete);
router.get("/login", (req, res, next) => {
    res.render("doctor_login", { title: "MedBay | Login" });
});
router.get("/new", (req, res, next) => {
    res.render("doctor_signup", { title: "MedBay | Register" });
});
router.get("/v/report/create", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("create_report", { title: "MedBay | Create Report" });
}));
router.get("/v/report/fetch", (req, res, next) => {
    res.render("doctor_findReport", { title: "MedBay | Find Report" });
});
router.get("/v/update", (req, res, next) => {
    res.render("update_profile", { title: "MedBay | Profile" });
});
exports.default = router;
