import { Router } from "express"
import TutorController from "../../controllers/tutor/tutorController"
import tutorService from "../../services/tutor/tutorService"

const router = Router()

const tutorcontroller = new TutorController(tutorService)

router.post('/login', tutorcontroller.login.bind(tutorcontroller))
router.post('/refresh-token', tutorcontroller.refreshUserAccessToken.bind(tutorcontroller))

export default router