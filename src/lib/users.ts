import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationToken?: string;
}

const dataFilePath = path.join(process.cwd(), 'data', 'users.json');

// Ensure the data directory and file exist
if (!fs.existsSync(path.dirname(dataFilePath))) {
  fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
}
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf-8');
}

export function getAllUsers(): User[] {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users data:', error);
    return [];
  }
}

export function saveAllUsers(users: User[]): void {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users data:', error);
  }
}

export function findUserByEmail(email: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserByVerificationToken(token: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.verificationToken === token);
}

export function createUser(user: User): void {
  const users = getAllUsers();
  users.push(user);
  saveAllUsers(users);
}

export function updateUser(id: string, updates: Partial<User>): void {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveAllUsers(users);
  }
}
