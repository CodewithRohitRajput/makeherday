import { Router } from "express";
import { createPayment, verifyPayment } from "../controllers/paymentController";

const router = Router();

router.post('/payment', createPayment)
router.get('/verify', verifyPayment)

export default router;