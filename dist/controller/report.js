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
const report_1 = __importDefault(require("../model/report"));
const doctor_1 = __importDefault(require("../model/doctor"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("../utils");
(0, dotenv_1.config)();
const control = {
    create: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { error, value } = valid_1.default.reportSchema.validate(req.body);
        if (error) {
            // console.error(error);
            res.status(400).json({
                message: "invalid input",
                error: error,
            });
            return;
        }
        const { patientName, age, weight, height, hospitalName, bloodGroup, bloodPressure, HIV_Status, hepatitis, genotype, } = value;
        const doctorId = (0, utils_1.decodeId)(req);
        if (!doctorId) {
            return res.status(500).render("doctor_error", {
                title: "MedBay | Report",
                message: "Something went wrong",
                error: "Try logging in",
            });
        }
        try {
            const report = yield report_1.default.create({
                patientName,
                age,
                weight,
                height,
                hospitalName,
                bloodGroup,
                bloodPressure,
                HIV_Status,
                hepatitis,
                genotype,
                doctorId,
            });
            if (report) {
                return res.redirect(`/users/v/report/k/${report._id}`);
            }
            if (!doctorId) {
                return res.status(500).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "Something went wrong",
                    error: "Try logging in",
                });
            }
        }
        catch (err) {
            // console.error(err);
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const reportId = req.params.reportId;
        const updates = req.body;
        const doctorId = (0, utils_1.decodeId)(req);
        if (!doctorId) {
            return res.status(500).render("doctor_error", {
                title: "MedBay | Report",
                message: "Something went wrong",
                error: "Try logging in",
            });
        }
        try {
            const report = yield report_1.default.findById(reportId);
            if (!report) {
                return res.status(404).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "report not found",
                    error: "report not found",
                });
            }
            const isMatch = (0, utils_1.idMatch)(req, report.doctorId.toString());
            if (!isMatch) {
                return res.status(401).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "report not created by you",
                    error: "unauthorized",
                });
            }
            for (const field in updates) {
                if (!updates[field]) {
                    delete updates[field];
                }
            }
            yield Object.assign(report, updates);
            yield report.save();
            res.redirect(`/users/v/report/k/${reportId}`);
        }
        catch (err) {
            // console.error(err);
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    fetchOne: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { reportId, patientName } = req.body;
        const routes = req.url.split("/");
        try {
            if (reportId) {
                const report = yield report_1.default.findById(reportId);
                if (report) {
                    if (routes.includes("va")) {
                        return res.redirect(`/admin/va/report/k/${report._id.toString()}`);
                    }
                    return res.redirect(`/users/v/report/k/${report._id.toString()}`);
                }
                return res.status(404).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "Not Found",
                    error: "No Report Found",
                });
            }
            if (patientName) {
                const report = yield report_1.default.findOne({ patientName });
                if (report) {
                    if (routes.includes("va")) {
                        return res.redirect(`/admin/va/report/k/${report._id.toString()}`);
                    }
                    return res.redirect(`/users/v/report/k/${report._id.toString()}`);
                }
                return res.status(404).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "Not Found",
                    error: "No Report Found",
                });
            }
            return res.status(403).render("doctor_error", {
                title: "MedBay | Report",
                message: "Not Found",
                error: "No Report Found",
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
    getOne: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.reportId;
        try {
            const report = yield report_1.default.findById(id);
            if (report) {
                const url = req.url;
                const routes = url.split("/");
                // console.log(routes);
                const owner = (0, utils_1.idMatch)(req, report.doctorId.toString());
                if (routes.includes("va")) {
                    return res.render("admin_report", {
                        title: "MedBay | Admin",
                        data: report,
                    });
                }
                if (!owner && routes.includes("update")) {
                    return res.status(401).render("doctor_error", {
                        title: "MedBay | Report",
                        message: "Cannot Update",
                        error: "Report not created by you",
                    });
                }
                if (!owner) {
                    return res.render("doctor_Nreport", {
                        title: "MedBay | Report",
                        data: report,
                    });
                }
                if (routes.includes("update")) {
                    return res.render("update_report", {
                        title: "MedBay | Update Report",
                        data: report,
                    });
                }
                return res.status(200).render("doctor_report", {
                    title: "MedBay | Report",
                    data: report,
                });
            }
            return res.status(404).render("doctor_error", {
                title: "MedBay | Error",
                message: "Not Found",
                error: "No Report Found",
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
    getMyReports: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const doctorId = (0, utils_1.decodeId)(req);
        try {
            const reports = yield report_1.default.find({ doctorId });
            if (reports.length > 0) {
                return res.render("doctor_reports", {
                    title: "MedBay | Reports",
                    data: reports,
                });
            }
            res.render("doctor_error", {
                title: "MedBay | Report",
                message: "you do not have any reports",
                error: "no reports found",
            });
        }
        catch (err) {
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    getAll: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const routes = req.url.split("/");
            const reports = yield report_1.default.find();
            if (reports.length) {
                if (routes.includes("va")) {
                    return res.render("admin_allReports", {
                        title: "MedBay | Admin",
                        data: reports,
                    });
                }
                res.render("doctor_allReports", {
                    title: "MedBay | All",
                    data: reports,
                });
                return;
            }
            res.render("doctor_error", {
                title: "MedBay | Reports",
                message: "No Reports",
                error: "No Reports Found",
            });
        }
        catch (err) {
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    confirmDelete: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.reportId;
        try {
            const report = yield report_1.default.findById(id);
            if (!report) {
                res.status(404).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "Not Found",
                    error: "No Report Found",
                });
                return;
            }
            res.render("delete_report", {
                title: "MedBay | Confirm",
                message: "Not Sure",
                patient: report.patientName,
            });
        }
        catch (err) {
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
    delete: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.reportId;
        try {
            const report = yield report_1.default.findById(id);
            if (!report) {
                res.status(404).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "Not Found",
                    error: "No Report Found",
                });
                return;
            }
            const ownReport = (0, utils_1.idMatch)(req, report.doctorId.toString());
            if (!ownReport) {
                res.render("doctor_error", {
                    title: "MedBay | Report",
                    message: "Report not deleted",
                    error: "Report can only be deleted by the doctor who created them",
                });
                return;
            }
            const _id = (0, utils_1.decodeId)(req);
            const doctor = yield doctor_1.default.findById(_id);
            if (!doctor) {
                res.status(500).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "Something went wrong",
                    error: "Try logging in",
                });
                return;
            }
            const { password } = req.body;
            if (!password) {
                res.status(401).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "Report not deleted",
                    error: "Wrong input",
                });
                return;
            }
            const match = bcryptjs_1.default.compareSync(password, doctor.password);
            if (!match) {
                res.status(401).render("doctor_error", {
                    title: "MedBay | Report",
                    message: "Report not deleted",
                    error: "Wrong input",
                });
                return;
            }
            yield report_1.default.deleteOne({ _id: id });
            res.render("doctor_success", {
                title: "MedBay | Delete",
                message: "Report Deleted",
            });
        }
        catch (err) {
            res.status(500).render("server_error", {
                message: "server error",
                error: err,
            });
        }
    }),
};
exports.default = control;
