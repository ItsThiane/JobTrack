import { User } from "@prisma/client";
import * as express from "express";

// Extension de l'interface Request pour inclure l'utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: User; 
  }
} }
