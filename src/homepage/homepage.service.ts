import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService) {}

  createPage(dto: {
    organizationId: string;
    brandId?: string;
    branchId?: string;
    slug: string;
    title?: string;
  }) {
    return this.prisma.homepagePage.create({
      data: {
        ...dto,
        versions: {
          create: {
            version: 1,
            status: 'DRAFT',
            design: {
              primaryColor: '#1a1a1a',
              secondaryColor: '#c4a574',
              font: 'Inter',
            },
            sections: {
              create: [
                {
                  type: 'hero',
                  sortOrder: 0,
                  content: { title: dto.title || 'Welcome', subtitle: '' },
                },
                {
                  type: 'about',
                  sortOrder: 1,
                  content: { body: '' },
                },
                {
                  type: 'cta',
                  sortOrder: 2,
                  content: { menuLabel: 'Lihat Menu', reservationLabel: 'Reservasi' },
                },
              ],
            },
          },
        },
      },
      include: { versions: { include: { sections: true } } },
    });
  }

  async updateDraft(pageId: string, dto: { design?: object; sections?: any[] }) {
    const page = await this.prisma.homepagePage.findUnique({
      where: { id: pageId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
    if (!page) throw new NotFoundException();
    let version = page.versions[0];
    if (!version || version.status === 'PUBLISHED') {
      version = await this.prisma.homepageVersion.create({
        data: {
          pageId,
          version: (version?.version || 0) + 1,
          status: 'DRAFT',
          design: dto.design || version?.design || {},
        },
      });
    } else if (dto.design) {
      version = await this.prisma.homepageVersion.update({
        where: { id: version.id },
        data: { design: dto.design },
      });
    }

    if (dto.sections) {
      await this.prisma.homepageSection.deleteMany({ where: { versionId: version.id } });
      await this.prisma.homepageSection.createMany({
        data: dto.sections.map((s, i) => ({
          versionId: version.id,
          type: s.type,
          sortOrder: s.sortOrder ?? i,
          visible: s.visible !== false,
          content: s.content || {},
        })),
      });
    }

    return this.prisma.homepageVersion.findUnique({
      where: { id: version.id },
      include: { sections: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async publish(pageId: string) {
    const page = await this.prisma.homepagePage.findUnique({
      where: { id: pageId },
      include: { versions: { where: { status: 'DRAFT' }, orderBy: { version: 'desc' }, take: 1 } },
    });
    if (!page?.versions[0]) throw new NotFoundException('No draft');
    const version = await this.prisma.homepageVersion.update({
      where: { id: page.versions[0].id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
    await this.prisma.homepagePage.update({
      where: { id: pageId },
      data: { publishedVersionId: version.id },
    });
    return version;
  }

  async getPublicBySlug(slug: string, branchSlug?: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { slug, deletedAt: null },
      include: {
        organization: true,
        branches: branchSlug
          ? { where: { slug: branchSlug, status: 'ACTIVE' } }
          : { where: { status: 'ACTIVE' }, take: 1 },
      },
    });
    if (!brand) {
      const org = await this.prisma.organization.findUnique({
        where: { slug },
        include: { brands: { take: 1, include: { branches: { take: 1 } } } },
      });
      if (!org) throw new NotFoundException();
    }

    const page = await this.prisma.homepagePage.findFirst({
      where: {
        OR: [
          { slug },
          { brand: { slug } },
        ],
        publishedVersionId: { not: null },
      },
      include: {
        brand: true,
        branch: true,
        organization: true,
      },
    });

    if (!page?.publishedVersionId) {
      return {
        slug,
        brand,
        published: false,
        sections: [],
      };
    }

    const version = await this.prisma.homepageVersion.findUnique({
      where: { id: page.publishedVersionId },
      include: { sections: { where: { visible: true }, orderBy: { sortOrder: 'asc' } } },
    });

    const sections = version?.sections || [];
    let featuredItems: any[] = [];
    let activePromos: any[] = [];
    const branchId = page.branchId || brand?.branches?.[0]?.id;
    const orgId = page.organizationId || brand?.organizationId;
    if (sections.some((s) => s.type === 'featured_menu') && branchId) {
      const items = await this.prisma.menuItem.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          category: {
            menu: {
              isActive: true,
              OR: [{ branchId }, { brandId: page.brandId || brand?.id, branchId: null }],
            },
          },
        },
        take: 6,
        orderBy: { name: 'asc' },
        include: { branchItems: branchId ? { where: { branchId } } : false },
      });
      featuredItems = items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.branchItems?.[0]?.price ?? i.basePrice,
        description: i.description,
      }));
    }
    if (sections.some((s) => s.type === 'promo') && orgId) {
      const now = new Date();
      activePromos = await this.prisma.promotion.findMany({
        where: {
          organizationId: orgId,
          isActive: true,
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    }

    return {
      page: {
        id: page.id,
        title: page.title,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        brand: page.brand,
        branch: page.branch,
      },
      design: version?.design,
      sections,
      featuredItems,
      activePromos,
      published: true,
    };
  }

  list(organizationId: string) {
    return this.prisma.homepagePage.findMany({
      where: { organizationId },
      include: { versions: { orderBy: { version: 'desc' }, take: 3 } },
    });
  }
}
