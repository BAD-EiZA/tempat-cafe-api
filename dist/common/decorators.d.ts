export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const PERMISSIONS_KEY = "permissions";
export declare const RequirePermissions: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const Tenant: (...dataOrPipes: unknown[]) => ParameterDecorator;
