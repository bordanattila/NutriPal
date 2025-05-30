export function authMiddleware({ req }: Object): Object;
export function refreshToken(user: Object): string;
export function verifyRefreshToken(token: string): Promise<Object>;
export function signInToken({ username, email, _id }: Object): string;
