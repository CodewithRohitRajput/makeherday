import { Router } from "express"; 
import { createGift } from "../controllers/giftController.js";  
const router = Router();

router.post('/create', createGift);

export default router