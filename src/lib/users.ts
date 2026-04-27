import prisma from './prisma';

export interface User {
  id: string;
  email: string;
  username?: string | null;
  passwordHash: string;
  isVerified: boolean;
  verificationToken?: string | null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user as User | null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

export async function findUserByUsername(username: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    return user as User | null;
  } catch (error) {
    console.error('Error finding user by username:', error);
    return null;
  }
}

export async function findUserByVerificationToken(token: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });
    return user as User | null;
  } catch (error) {
    console.error('Error finding user by verification token:', error);
    return null;
  }
}

export async function createUser(data: Omit<User, 'id' | 'isVerified'>): Promise<User | null> {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username?.toLowerCase(),
        passwordHash: data.passwordHash,
        verificationToken: data.verificationToken,
        isVerified: false,
      },
    });
    return user as User | null;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    // Remove id from updates if it exists to prevent Prisma errors
    const { id: _, ...validUpdates } = updates;
    
    const user = await prisma.user.update({
      where: { id },
      data: validUpdates,
    });
    return user as User | null;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}
