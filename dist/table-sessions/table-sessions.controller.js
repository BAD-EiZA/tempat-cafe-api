"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableSessionsController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const table_sessions_service_1 = require("./table-sessions.service");
let TableSessionsController = class TableSessionsController {
    constructor(service) {
        this.service = service;
    }
    open(body) {
        return this.service.open(body);
    }
    get(id) {
        return this.service.get(id);
    }
    close(id) {
        return this.service.close(id);
    }
};
exports.TableSessionsController = TableSessionsController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TableSessionsController.prototype, "open", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TableSessionsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, decorators_1.RequirePermissions)('pos.operate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TableSessionsController.prototype, "close", null);
exports.TableSessionsController = TableSessionsController = __decorate([
    (0, common_1.Controller)('table-sessions'),
    __metadata("design:paramtypes", [table_sessions_service_1.TableSessionsService])
], TableSessionsController);
//# sourceMappingURL=table-sessions.controller.js.map