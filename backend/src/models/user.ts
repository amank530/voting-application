import { db } from '../config/db';

export const UserModel = {
  getUserByAadhar: (aadhar: string) => db.getUserByAadhar(aadhar),
  getUserByMobile: (mobile: string) => db.getUserByMobile(mobile),
  createUser: (data: any) => db.createUser(data),
  getUsers: () => db.getUsers(),
  updateUser: (mobile: string, data: any) => db.updateUser(mobile, data)
};
