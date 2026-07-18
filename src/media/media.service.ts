import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
    if (cloudName) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: this.config.get('CLOUDINARY_API_KEY'),
        api_secret: this.config.get('CLOUDINARY_API_SECRET'),
      });
    }
  }

  signUpload(organizationId: string, folder: string) {
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
    const signature = cloudinary.utils.api_sign_request(
      params,
      this.config.get('CLOUDINARY_API_SECRET') || '',
    );
    return {
      cloudName,
      apiKey: this.config.get('CLOUDINARY_API_KEY'),
      timestamp,
      folder: fullFolder,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    };
  }

  async saveAsset(dto: {
    organizationId: string;
    publicId: string;
    url: string;
    resourceType?: string;
    folder?: string;
  }) {
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
}
