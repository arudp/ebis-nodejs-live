import { Request } from "express";
import { Document } from "mongoose";

export type Task = {
  id?: string;
  name: string;
  description: string;
  isDone: boolean;
};

export type User = {
  name: string;
  email: string;
  password: string;
};

export interface HasDocument extends Request {
  document: Document;
}

export type QueryParams = { [key: string]: string | undefined };
export type RouteParams = { [key: string]: string };
export type Body = { [key: string]: string | number | boolean | undefined };
