// src/resources/tremps/trempControler.ts
import { Request, Response } from "express";
import * as TrempService from "./TrempService";
import * as UserService from "../users/UserService";
import TrempModel from "./TrempModel";

export async function createTremp(req: Request, res: Response): Promise<Response> {
  const tremp: TrempModel = req.body;
  const newTremp = new TrempModel(tremp);
  // Validate tremp before further processing
  try {
    newTremp.validateTremp();
  } catch (error) {
    return res.status(400).json({ message: `Validation failed: ${error.message}` });
  }

  const { creator_id, tremp_time, from_root, to_root } = newTremp;

  try {
    // Check if the user exists
    const user = await UserService.getUserById(creator_id.toString());
    console.log(user
      );
    
    if (!user) {
      throw new Error("Creator user does not exist");
    }

    // Check if tremp_time has not passed
    if (new Date(tremp_time) < new Date()) {
      throw new Error("Tremp time has already passed");
    }

    // Check if 'from' and 'to' locations are not the same
    if (from_root.name === to_root.name) {
      throw new Error("The 'from' and 'to' locations cannot be the same");
    }

    const result = await TrempService.createTremp(newTremp);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getTrempsByFilters(req: Request, res: Response): Promise<Response> {
  try {
    const filters = req.body;
    const tremps = await TrempService.getTrempsByFilters(filters);

    return res.status(200).json(tremps);
  } catch (error) {
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}