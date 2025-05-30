export function createDailyLog(userId: string, date?: Date | null, foodIds: Array<string>): Promise<Object>;
export function authenticateUser(username: string, password: string): Promise<Object | null>;
