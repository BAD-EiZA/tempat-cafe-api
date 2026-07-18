"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeHub = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let RealtimeHub = class RealtimeHub {
    constructor() {
        this.bus = new rxjs_1.Subject();
    }
    publish(event) {
        this.bus.next({ ...event, at: new Date().toISOString() });
    }
    stream(branchId, organizationId) {
        return this.bus.asObservable().pipe((0, rxjs_1.filter)((e) => {
            if (branchId && e.branchId && e.branchId !== branchId)
                return false;
            if (organizationId && e.organizationId && e.organizationId !== organizationId)
                return false;
            return true;
        }));
    }
};
exports.RealtimeHub = RealtimeHub;
exports.RealtimeHub = RealtimeHub = __decorate([
    (0, common_1.Injectable)()
], RealtimeHub);
//# sourceMappingURL=realtime.hub.js.map