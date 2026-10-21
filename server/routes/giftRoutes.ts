import { Router } from "express"; 
import { createGift, getGift } from "../controllers/giftController.js";
const router = Router();

router.post('/create', createGift);
router.get('/:slug', getGift);

export default router;