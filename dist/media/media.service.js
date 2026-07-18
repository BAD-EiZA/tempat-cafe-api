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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const prisma_service_1 = require("../prisma/prisma.service");
let MediaService = class MediaService {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
        if (cloudName) {
            cloudinary_1.v2.config({
                cloud_name: cloudName,
                api_key: this.config.get('CLOUDINARY_API_KEY'),
                api_secret: this.config.get('CLOUDINARY_API_SECRET'),
            });
        }
    }
    signUpload(organizationId, folder) {
        const timestamp = Math.round(Date.now() / 1000);
        const fullFolder = `platform/${organizationId}/${folder}`;
        const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
        if (!cloudName) {
            return {
                mock: true,
                folder: fullFolder,
                timestamp,
                uploadUrl: null,
            };
        }
        const params = { timestamp, folder: fullFolder };
        const signature = cloudinary_1.v2.utils.api_sign_request(params, this.config.get('CLOUDINARY_API_SECRET') || '');
        return {
            cloudName,
            apiKey: this.config.get('CLOUDINARY_API_KEY'),
            timestamp,
            folder: fullFolder,
            signature,
            uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        };
    }
    async saveAsset(dto) {
        return this.prisma.mediaAsset.create({
            data: {
                organizationId: dto.organizationId,
                publicId: dto.publicId,
                url: dto.url,
                resourceType: dto.resourceType || 'image',
                folder: dto.folder,
            },
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map