/**
 * Augment Express namespace with our User type
 * Passport defines an empty Express.User interface that we need to populate
 */
declare global {
  namespace Express {
    /**
     * Authenticated user type returned by Passport JWT strategy
     * This is a subset of the full User model, excluding sensitive fields like password
     *
     * This interface augments the empty User interface defined by @types/passport
     * Passport automatically sets req.user to this type after successful authentication
     */
    interface User {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      address: string | null;
      country: string | null;
      gender: string | null;
      birthday: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

/**
 * Export the AuthenticatedUser type as an alias for Express.User
 * This can be used in code for explicit type annotations
 */
export type AuthenticatedUser = Express.User;

export {};
